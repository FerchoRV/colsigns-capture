"use client";
import LabelsWordsV2 from "@/app/ui/evaluate/labels-words-v2";
import React, { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from "../../components/ProtectedRoute"; 
import { collection, query, where, getDocs, doc, getDoc, limit,addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase/firebaseConfig';
import CameraRecorder from '@/app/ui/send-signs/camera-recorder';
import ExampleVideo from '@/app/ui/send-signs/example-video';

// Define la interfaz para las señas
interface Sign {
  id: string;
  name: string;
  type: string;
  status: string;
  videoPath: string;
  meaning?: string; // Opcional
  reference?: string; // Opcional
}

interface ApiResponse {
    prediction: string | null;
    probabilities: number[] | null;   
}

const EvaluateWordsV2: React.FC = () => {
  // selectedSearch ahora almacena la letra Y el tipo de seña
  const [selectedSearch, setSelectedSearch] = useState<{ word: string; type: string } | null>(null); 
  const [selectedSign, setSelectedSign] = useState<Sign | null>(null); 
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [levelId, setLevelId] = useState<string | null>(null);

    // Nuevo estado para la respuesta de la API
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isSendingToApi, setIsSendingToApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSavingEvaluation, setIsSavingEvaluation] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        setUserId(user.uid);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setLevelId(userDoc.data().levelId);
        } else {
          console.error('El documento del usuario no existe en Firestore.');
        }
      } else {
        console.error('No hay un usuario autenticado.');
      }
    };
    fetchUserData();
  }, []);

  // Función para buscar la seña específica por letra y tipo
  const fetchSpecificSign = useCallback(async (word: string) => {
    if (!word.trim() ) {
      setSelectedSign(null);
      setErrorMessage('Por favor, selecciona una Palabra o frase.');
      return;
    }

    setIsPending(true);
    setErrorMessage(null);
    setSelectedSign(null); // Limpiar cualquier seña previamente seleccionada
    setApiResponse(null); // Limpiar respuesta API al buscar nueva seña
    setApiError(null);

    try {
      const videoExampleCollection = collection(db, 'video_example');
      
      // Consulta exacta: 'name' debe ser la letra (en mayúscula) Y 'type' debe ser el tipo especificado
      const q = query(
        videoExampleCollection,
        where('name', '==', word), // Busca el nombre exacto de la letra
        where('status', '==', 'activo'),
        limit(1) // Solo necesitamos el primer resultado
      );
      
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const foundSign = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data(),
        } as Sign;
        setSelectedSign(foundSign);
      } else {
        setErrorMessage(`No se encontró una seña activa de tipo  para la letra "${word}".`);
      }
    } catch (error) {
      console.error('Error buscando la seña:', error);
      setErrorMessage('Error buscando la seña.');
    } finally {
      setIsPending(false);
    }
  }, []); // Dependencias vacías ya que no usa estados/props que cambien

  // Efecto para disparar la búsqueda cuando cambia selectedSearch
  useEffect(() => {
    if (selectedSearch) {
      fetchSpecificSign(selectedSearch.word);
    }
  }, [selectedSearch, fetchSpecificSign]);

  // Función para manejar la selección de una letra Y un tipo de seña
  const handlewordAndTypeSelect = (word: string, type: string) => {
    setSelectedSearch({ word, type });
  };
   
  const getRecordingDuration = (type: string) => {
    if (type === 'Caracter') return 3000;
    if (type === 'Palabra') return 3000;
    if (type === 'Frases') return 5000;
    return 3000; // Valor por defecto
  };

  // NUEVA FUNCIÓN: Manejar los datos del video subido
    const handleRecordedVideoData = async (docId: string, videoDownloadUrl: string) => {
      if (!selectedSign || !userId || !levelId) {
        setApiError("Faltan datos para enviar a la API.");
        return;
      }
  
      setIsSendingToApi(true);
      setApiError(null);
      setApiResponse(null);
  
      const apiPayload = {
        recordedVideoDocId: docId,
        url_video: videoDownloadUrl,
        signName: selectedSign.name,
        signId: selectedSign.id,
        signType: selectedSign.type,
        userId: userId,
        userLevelId: levelId,
        type_extract:"pose_hands",
        // Puedes añadir más datos aquí si los necesitas para tu API
        timestamp: new Date().toISOString(), // ISO 8601 format
      };
  
      
  
      try {
        // AQUÍ ES DONDE HARÍAS LA LLAMADA A TU API EXTERNA
        // Ejemplo con fetch:
        const response = await fetch('https://model-lsc-api-244204625992.us-central1.run.app/predict_recognition_video_words_v2', { // Reemplaza con la URL de tu API
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',            
          },
          body: JSON.stringify(apiPayload),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al enviar datos a la API');
        }
  
        const data = await response.json();
        setApiResponse(data);
        //alert("Datos enviados a la API con éxito!");
        //console.log("Respuesta de la API:", data);
  
              // --- NUEVO: Guardar la respuesta de la API en Firestore ---
        setIsSavingEvaluation(true); // Activa el estado de guardado
        try {
          const evaluatesSignCollection = collection(db, "evaluates_sign");
          await addDoc(evaluatesSignCollection, {
            label: selectedSign.name, // El valor del botón que presionó el usuario (name de selectedSign)
            recordedVideoDocId: apiPayload.recordedVideoDocId,
            url_video: apiPayload.url_video,
            signName: apiPayload.signName,
            signId: apiPayload.signId,
            signType: apiPayload.signType,
            userId: apiPayload.userId,
            userLevelId: apiPayload.userLevelId,
            type_extract: apiPayload.type_extract,
            model:'words_v2', // El modelo que estás usando
            prediction: data?.prediction || null, // Valor de la predicción de la API
            probabilities: data?.probabilities || null, // Probabilidades de la API
            evaluatedAt: new Date(), // Timestamp del momento de la evaluación
          });
          console.log("✅ Evaluación guardada en Firestore correctamente.");
        } catch (firestoreError) {
          console.error("🚨 Error al guardar la evaluación en Firestore:", firestoreError);
          setApiError(`Error al guardar evaluación: ${firestoreError instanceof Error ? firestoreError.message : 'Desconocido'}`);
        } finally {
          setIsSavingEvaluation(false); // Desactiva el estado de guardado
        }
        // --- FIN NUEVO ---
  
        } catch (error: unknown) {
          console.error("Error al enviar datos a la API:", error);
          if (error instanceof Error) {
            setApiError(`Error al enviar datos a la API: ${error.message}`);
          } else {
            setApiError('Error al enviar datos a la API: Desconocido');
          }
        } finally {
          setIsSendingToApi(false);
        }
    };

  return (
    <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1), parseInt(process.env.NEXT_PUBLIC_APP_ROLE_2)]}>
    <div className="p-4">
      <h1 className="text-3xl font-extrabold text-blue-500 mb-6">Evalúa Señas de tipo palabra y frases</h1>
      
      {/* Componente LabelsAlphabet para Caracteres */}
      <div className="mb-8">
        <h2 className="text-xl text-gray-800 mb-4">Selecciona una palabra o frase, luego el sistema te entregara las opciones de señas disponibles para evaluar y ser parte del conjunto de datos de prueba y evaluación:</h2>
        {/* Pasamos 'Caracter' como signType por defecto */}
        <LabelsWordsV2
          onLetterSelect={handlewordAndTypeSelect} 
          selectedLetter={selectedSearch?.word} 
          
        />
      </div>


      {isPending && (
        <p className="text-blue-600 text-center text-lg mt-4 animate-pulse">Buscando seña...</p>
      )}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <strong className="font-bold">¡Error!</strong>
          <span className="block sm:inline"> {errorMessage}</span>
        </div>
      )}

      {selectedSign && userId && levelId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Grabar seña para evaluar: {selectedSign.name} </h2>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              Si tienes dudas de cómo hacer la seña elegida, revisa el video de ejemplo. Recuerda que en cada video solo debe aparecer una persona haciendo la seña y se debe grabar de la cintura hacia arriba, similar al video de ejemplo.
            </p>
              {!(isSendingToApi || isSavingEvaluation) ? (
                <CameraRecorder
                  name={selectedSign.name}
                  idSign={selectedSign.id}
                  idUser={userId}
                  levelId={levelId}
                  type={selectedSign.type}
                  duration={getRecordingDuration(selectedSign.type)}
                  onVideoUploaded={handleRecordedVideoData}
                />
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg animate-pulse text-gray-500">
                      <p>Procesado seña y guardando evaluación ...</p>
                  </div>
              )}
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Video de Ejemplo: {selectedSign.name}</h2>
            <ExampleVideo
              name={selectedSign.name}
              meaning={selectedSign.meaning}
              videoPath={selectedSign.videoPath}
              reference={selectedSign.reference}
            />
          </div>
        </div>
      )}
      {/* Mostrar estado de envío a la API */}
      {isSendingToApi || isSavingEvaluation&& (
        <p className="text-blue-600 text-center text-lg mt-4 animate-pulse">{isSendingToApi ? "Procesando seña..." : "Guardando evaluación..."}</p>
      )}
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <strong className="font-bold">¡Error de API! Intente mas tarde </strong>
          <span className="block sm:inline"> {apiError}</span>
        </div>
      )}
      {apiResponse && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
          <span className="block sm:inline"> Predicción: {apiResponse?.prediction}</span>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}

export default EvaluateWordsV2;