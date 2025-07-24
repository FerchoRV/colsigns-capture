// app/ui/evaluate/user-opinion-survey.js
"use client";

import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase/firebaseConfig'; // Asegúrate de que esta ruta sea correcta para tu configuración
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function UserOpinionSurvey() {
  const [userId, setUserId] = useState<string | null>(null);
  const [q1Rating, setQ1Rating] = useState<number | null>(null);
  const [q2Rating, setQ2Rating] = useState<number | null>(null);
  const [q3Rating, setQ3Rating] = useState<number | null>(null);
  const [q4Response, setQ4Response] = useState<string | null>(null);
  const [q5Opinion, setQ5Opinion] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
    } else {
      setSubmitMessage('Debes iniciar sesión para enviar la encuesta.');
      setMessageType('error');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setSubmitMessage('No se pudo obtener el ID de usuario. Por favor, inicia sesión de nuevo.');
      setMessageType('error');
      return;
    }

    if (q1Rating === null || q2Rating === null || q3Rating === null || q4Response === null || q5Opinion.trim() === '') {
      setSubmitMessage('Por favor, responde a todas las preguntas antes de enviar.');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);
    setMessageType(null);

    try {
      await addDoc(collection(db, 'user_opinion_app'), {
        userId: userId,
        q1_reconocimiento_senas: q1Rating,
        q2_generador_senas: q2Rating,
        q3_necesidad_sistema: q3Rating,
        q4_usaria_para_comunicarse: q4Response,
        q5_opinion_general: q5Opinion.trim(),
        submittedAt: serverTimestamp(), // Marca de tiempo de cuándo se envió la encuesta
      });

      setSubmitMessage('¡Gracias! Tu opinión ha sido enviada con éxito.');
      setMessageType('success');
      // Opcional: Reiniciar el formulario después de un envío exitoso
      setQ1Rating(null);
      setQ2Rating(null);
      setQ3Rating(null);
      setQ4Response(null);
      setQ5Opinion('');

    } catch (error) {
      console.error('Error al guardar la encuesta:', error);
      setSubmitMessage('Hubo un error al enviar tu opinión. Por favor, inténtalo de nuevo.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingOptions = ({ rating, setRating }: { questionNumber: number; rating: number | null; setRating: React.Dispatch<React.SetStateAction<number | null>> }) => (
    <div className="flex justify-center gap-2 mt-2">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          type="button" // Importante para que no envíe el formulario
          onClick={() => setRating(num)}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
            transition-all duration-200 ease-in-out
            ${rating === num
              ? 'bg-blue-600 text-white shadow-lg scale-110'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
          `}
        >
          {num}
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-2xl mx-auto my-8">
      <h1 className="text-3xl font-extrabold text-blue-500 mb-6 text-center">Encuesta de Opinión del Usuario</h1>
      <p className="text-gray-600 mb-8 text-center">
        Tu opinión es muy valiosa para nosotros. Por favor, tómate un momento para responder las siguientes preguntas.
      </p>

      {!userId && messageType === 'error' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">¡Error!</strong>
          <span className="block sm:inline"> {submitMessage}</span>
        </div>
      )}

      {userId && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pregunta 1 */}
          <div>
            <label className="block text-lg font-medium text-gray-800 mb-2">
              1. En la escala de 1 a 5 (1: muy malo, 5: muy bueno), ¿Cuánto califica el sistema Colsig con respecto al módulo de reconocimiento de señas o, &quot;Señas a texto&quot;?
            </label>
            <RatingOptions questionNumber={1} rating={q1Rating} setRating={setQ1Rating} />
          </div>

          {/* Pregunta 2 */}
          <div>
            <label className="block text-lg font-medium text-gray-800 mb-2">
              2. En la escala de 1 a 5 (1: muy malo, 5: muy bueno), ¿Cuánto califica el sistema Colsig con respecto al módulo generador de señas o &quot;Texto a señas&quot;?
            </label>
            <RatingOptions questionNumber={2} rating={q2Rating} setRating={setQ2Rating} />
          </div>

          {/* Pregunta 3 */}
          <div>
            <label className="block text-lg font-medium text-gray-800 mb-2">
              3. En la escala de 1 a 5 (1: poco necesario, 5: muy necesario), ¿Cuánto califica la necesidad de este tipo de sistemas en Colombia?
            </label>
            <RatingOptions questionNumber={3} rating={q3Rating} setRating={setQ3Rating} />
          </div>

          {/* Pregunta 4 */}
          <div>
            <label className="block text-lg font-medium text-gray-800 mb-2">
              4. ¿Consideraría usar el sistema Colsig para interactuar con una persona sorda u oyente?
            </label>
            <div className="flex justify-center gap-4 mt-2">
              <button
                type="button"
                onClick={() => setQ4Response('Si')}
                className={`
                  px-6 py-2 rounded-lg text-lg font-bold transition-all duration-200 ease-in-out
                  ${q4Response === 'Si'
                    ? 'bg-green-600 text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setQ4Response('No')}
                className={`
                  px-6 py-2 rounded-lg text-lg font-bold transition-all duration-200 ease-in-out
                  ${q4Response === 'No'
                    ? 'bg-red-600 text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                No
              </button>
            </div>
          </div>

          {/* Pregunta 5 */}
          <div>
            <label htmlFor="q5Opinion" className="block text-lg font-medium text-gray-800 mb-2">
              5. De manera general, ¿qué opina del sistema Colsign?
            </label>
            <textarea
              id="q5Opinion"
              value={q5Opinion}
              onChange={(e) => setQ5Opinion(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="Escribe tu opinión aquí..."
            ></textarea>
          </div>

          {/* Mensajes de envío */}
          {submitMessage && (
            <div className={`px-4 py-3 rounded relative text-center text-base ${
              messageType === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'
            }`} role="alert">
              {submitMessage}
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isSubmitting || !userId || q1Rating === null || q2Rating === null || q3Rating === null || q4Response === null || q5Opinion.trim() === ''}
            className={`
              w-full px-6 py-3 rounded-lg text-xl font-bold text-white transition-all duration-300 ease-in-out
              ${isSubmitting || !userId || q1Rating === null || q2Rating === null || q3Rating === null || q4Response === null || q5Opinion.trim() === ''
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