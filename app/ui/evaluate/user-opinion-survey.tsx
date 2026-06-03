// app/ui/evaluate/user-opinion-survey.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseConfig';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';

const SURVEY_URL = '/user-survey/survey-information.json';

// Rol de administrador (puede enviar varias encuestas: propias o a nombre de un encuestado)
const ROLE_ADMIN = parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1 ?? '', 10);

// Modo de respuesta cuando el usuario es administrador
type RespondentMode = 'self' | 'external';

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

type QuestionType = 'scale' | 'choice' | 'open';

interface SurveyQuestion {
  id: number;
  key: string;
  question_text: string;
  type: QuestionType;
  scale: [number, number, string?, string?] | null;
  options: string[] | null;
  required: boolean;
}

interface SurveyInformation {
  survey_id: string;
  title: string;
  description: string;
  version: number;
  questions: SurveyQuestion[];
}

// Una respuesta puede ser un número (escala) o un texto (choice/open)
type SurveyAnswers = Record<string, number | string>;

export default function UserOpinionSurvey() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [roleId, setRoleId] = useState<number | null>(null);

  const [survey, setSurvey] = useState<SurveyInformation | null>(null);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(true);
  const [surveyError, setSurveyError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<SurveyAnswers>({});

  // Estado de elegibilidad (para roles no administradores: una sola encuesta)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Estado para el modo de administrador
  const [respondentMode, setRespondentMode] = useState<RespondentMode>('self');
  const [externalName, setExternalName] = useState('');
  const [externalEmail, setExternalEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const isAdmin = roleId === ROLE_ADMIN;

  // Verifica si ya existe una encuesta para un correo dado
  const surveyExistsForEmail = useCallback(async (email: string): Promise<boolean> => {
    const normalizedEmail = email.trim().toLowerCase();
    const q = query(
      collection(db, 'user_opinion_app'),
      where('respondent_email', '==', normalizedEmail),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }, []);

  // Obtener el usuario autenticado, su nombre, correo y rol
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserId(null);
        setIsCheckingEligibility(false);
        setSubmitMessage('Debes iniciar sesión para enviar la encuesta.');
        setMessageType('error');
        return;
      }

      setUserId(user.uid);
      setUserEmail(user.email ?? '');

      let resolvedRole: number | null = null;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          resolvedRole = parseInt(data.roleId, 10);
          setRoleId(resolvedRole);
          setUserName(data.name ?? user.displayName ?? '');
        } else {
          setUserName(user.displayName ?? '');
        }
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
      }

      // Los no administradores solo pueden responder una vez
      if (resolvedRole !== ROLE_ADMIN && user.email) {
        try {
          const exists = await surveyExistsForEmail(user.email);
          setAlreadySubmitted(exists);
        } catch (error) {
          console.error('Error al verificar elegibilidad de la encuesta:', error);
        }
      }

      setIsCheckingEligibility(false);
    });

    return () => unsubscribe();
  }, [surveyExistsForEmail]);

  // Cargar las preguntas desde el JSON en public/
  useEffect(() => {
    let isMounted = true;

    const fetchSurvey = async () => {
      try {
        setIsLoadingSurvey(true);
        setSurveyError(null);

        const response = await fetch(SURVEY_URL, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`No se pudo cargar la encuesta (${response.status}).`);
        }

        const data: SurveyInformation = await response.json();
        if (isMounted) {
          setSurvey(data);
        }
      } catch (error) {
        if (isMounted) {
          setSurveyError(
            error instanceof Error ? error.message : 'Error desconocido al cargar la encuesta.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingSurvey(false);
        }
      }
    };

    fetchSurvey();

    return () => {
      isMounted = false;
    };
  }, []);

  const setAnswer = useCallback((key: string, value: number | string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Verifica que todas las preguntas obligatorias estén respondidas
  const isAnswerProvided = (question: SurveyQuestion): boolean => {
    const value = answers[question.key];
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim() !== '';
    return true;
  };

  const allRequiredAnswered = survey
    ? survey.questions.filter((q) => q.required).every(isAnswerProvided)
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setSubmitMessage('No se pudo obtener el ID de usuario. Por favor, inicia sesión de nuevo.');
      setMessageType('error');
      return;
    }

    if (!survey || !allRequiredAnswered) {
      setSubmitMessage('Por favor, responde a todas las preguntas antes de enviar.');
      setMessageType('error');
      return;
    }

    // Determinar a nombre de quién se registra la encuesta
    const isExternal = isAdmin && respondentMode === 'external';

    let respondentName = userName;
    let respondentEmail = userEmail;

    if (isExternal) {
      respondentName = externalName.trim();
      respondentEmail = externalEmail.trim();

      if (!respondentName || !respondentEmail) {
        setSubmitMessage('Ingresa el nombre y el correo del encuestado.');
        setMessageType('error');
        return;
      }
      if (!isValidEmail(respondentEmail)) {
        setSubmitMessage('El correo del encuestado no es válido.');
        setMessageType('error');
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitMessage(null);
    setMessageType(null);

    try {
      // Verificación de duplicados:
      // - No administradores: solo una encuesta por correo.
      // - Administrador a nombre de un encuestado: una encuesta por ese correo.
      // - Administrador a nombre propio: sin restricción.
      const mustCheckDuplicate = !isAdmin || isExternal;
      if (mustCheckDuplicate) {
        const exists = await surveyExistsForEmail(respondentEmail);
        if (exists) {
          setSubmitMessage(
            isExternal
              ? 'Ya existe una encuesta registrada con ese correo.'
              : 'Ya has respondido la encuesta anteriormente. Solo se permite una respuesta.'
          );
          setMessageType('error');
          if (!isAdmin) setAlreadySubmitted(true);
          setIsSubmitting(false);
          return;
        }
      }

      // Normaliza las respuestas a texto (recortado) cuando son strings
      const normalizedAnswers: SurveyAnswers = {};
      survey.questions.forEach((q) => {
        const value = answers[q.key];
        if (value === undefined) return;
        normalizedAnswers[q.key] = typeof value === 'string' ? value.trim() : value;
      });

      await addDoc(collection(db, 'user_opinion_app'), {
        userId: userId, // UID del usuario autenticado que registra la encuesta
        submitted_by_role: roleId,
        respondent_name: respondentName,
        respondent_email: respondentEmail.toLowerCase(),
        is_external: isExternal,
        survey_id: survey.survey_id,
        survey_version: survey.version,
        ...normalizedAnswers,
        submittedAt: serverTimestamp(),
      });

      setSubmitMessage('¡Gracias! La encuesta ha sido enviada con éxito.');
      setMessageType('success');
      setAnswers({});

      if (isExternal) {
        // Limpiar datos del encuestado para registrar otro
        setExternalName('');
        setExternalEmail('');
      } else if (!isAdmin) {
        // Un usuario normal ya no puede volver a responder
        setAlreadySubmitted(true);
      }
    } catch (error) {
      console.error('Error al guardar la encuesta:', error);
      setSubmitMessage('Hubo un error al enviar tu opinión. Por favor, inténtalo de nuevo.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderiza una pregunta de tipo escala (con etiquetas opcionales en los extremos)
  const renderScaleQuestion = (question: SurveyQuestion) => {
    if (!question.scale) return null;
    const [min, max, minLabel, maxLabel] = question.scale;
    const current = answers[question.key];

    const values: number[] = [];
    for (let i = min; i <= max; i++) values.push(i);

    return (
      <div>
        <div className="flex justify-center gap-2 mt-2 flex-wrap">
          {values.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setAnswer(question.key, num)}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                transition-all duration-200 ease-in-out
                ${current === num
                  ? 'bg-blue-600 text-white shadow-lg scale-110'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              {num}
            </button>
          ))}
        </div>
        {(minLabel || maxLabel) && (
          <div className="flex justify-between mt-2 text-xs text-gray-500 max-w-md mx-auto px-1">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
          </div>
        )}
      </div>
    );
  };

  // Renderiza una pregunta de tipo selección (opciones)
  const renderChoiceQuestion = (question: SurveyQuestion) => {
    const options = question.options ?? [];
    const current = answers[question.key];

    return (
      <div className="flex justify-center gap-4 mt-2 flex-wrap">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setAnswer(question.key, option)}
            className={`
              px-6 py-2 rounded-lg text-lg font-bold transition-all duration-200 ease-in-out
              ${current === option
                ? 'bg-green-600 text-white shadow-lg scale-105'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  // Renderiza una pregunta abierta (texto libre)
  const renderOpenQuestion = (question: SurveyQuestion) => {
    const current = typeof answers[question.key] === 'string' ? (answers[question.key] as string) : '';

    return (
      <textarea
        id={question.key}
        value={current}
        onChange={(e) => setAnswer(question.key, e.target.value)}
        rows={4}
        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
        placeholder="Escribe tu respuesta aquí..."
      />
    );
  };

  const renderQuestion = (question: SurveyQuestion) => {
    switch (question.type) {
      case 'scale':
        return renderScaleQuestion(question);
      case 'choice':
        return renderChoiceQuestion(question);
      case 'open':
        return renderOpenQuestion(question);
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-2xl mx-auto my-8">
      <h1 className="text-3xl font-extrabold text-blue-500 mb-6 text-center">
        {survey?.title ?? 'Encuesta de Opinión del Usuario'}
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        {survey?.description ??
          'Tu opinión es muy valiosa para nosotros. Por favor, tómate un momento para responder las siguientes preguntas.'}
      </p>

      {!userId && messageType === 'error' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">¡Error!</strong>
          <span className="block sm:inline"> {submitMessage}</span>
        </div>
      )}

      {(isLoadingSurvey || isCheckingEligibility) && userId && (
        <p className="text-blue-600 text-center animate-pulse">Cargando encuesta...</p>
      )}

      {surveyError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">¡Error!</strong>
          <span className="block sm:inline"> {surveyError}</span>
        </div>
      )}

      {/* Usuario no administrador que ya respondió la encuesta */}
      {userId && !isAdmin && alreadySubmitted && !isCheckingEligibility && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center" role="alert">
          <strong className="font-bold">¡Gracias!</strong>
          <span className="block sm:inline"> Ya has respondido la encuesta. Solo se permite una respuesta por usuario.</span>
        </div>
      )}

      {userId && survey && !isLoadingSurvey && !isCheckingEligibility && !(!isAdmin && alreadySubmitted) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Panel de administrador: responder a nombre propio o de un encuestado */}
          {isAdmin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
              <p className="text-sm font-semibold text-blue-800">
                Como administrador puedes registrar la encuesta a nombre propio o de otra persona.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setRespondentMode('self')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                    respondentMode === 'self'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  A nombre propio
                </button>
                <button
                  type="button"
                  onClick={() => setRespondentMode('external')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                    respondentMode === 'external'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Registrar a un encuestado
                </button>
              </div>

              {respondentMode === 'external' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="externalName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del encuestado
                    </label>
                    <input
                      id="externalName"
                      type="text"
                      value={externalName}
                      onChange={(e) => setExternalName(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="externalEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo del encuestado
                    </label>
                    <input
                      id="externalEmail"
                      type="email"
                      value={externalEmail}
                      onChange={(e) => setExternalEmail(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {survey.questions.map((question) => (
            <div key={question.id}>
              <label htmlFor={question.key} className="block text-lg font-medium text-gray-800 mb-2">
                {question.id}. {question.question_text}
                {question.required && <span className="text-red-500"> *</span>}
              </label>
              {renderQuestion(question)}
            </div>
          ))}

          {submitMessage && (
            <div
              className={`px-4 py-3 rounded relative text-center text-base ${
                messageType === 'success'
                  ? 'bg-green-100 border border-green-400 text-green-700'
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}
              role="alert"
            >
              {submitMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !userId || !allRequiredAnswered}
            className={`
              w-full px-6 py-3 rounded-lg text-xl font-bold text-white transition-all duration-300 ease-in-out
              ${isSubmitting || !userId || !allRequiredAnswered
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md'
              }
            `}
          >
            {isSubmitting ? 'Enviando opinión...' : 'Enviar Opinión'}
          </button>
        </form>
      )}
    </div>
  );
}
