"use client";
import LabelsColsignBiAsimetrico from "./labels-colsign-asimetrico";
import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { collection, query, where, getDocs, doc, getDoc, limit, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase/firebaseConfig";
import CameraRecorder from "@/app/ui/evaluate/camera-recorder";
import ExampleVideo from "@/app/ui/send-signs/example-video";

// Endpoint del nuevo modelo Colsign (asimetrico)
const COLSIGN_API_BASE = "https://colsign-api-models-244204625992.europe-west1.run.app/api/v1";
const COLSIGN_TEST_ENDPOINT = `${COLSIGN_API_BASE}/test/asimetrico`;

// Define la interfaz para las señas
interface Sign {
  id: string;
  name: string;
  type: string;
  status: string;
  videoPath: string;
  meaning?: string;
  reference?: string;
}

// Respuesta del endpoint /api/v1/test/asimetrico
interface ApiResponse {
  label: string | null;
  prob: number | null;
  id?: number;
  model_name?: string;
  num_classes?: number;
  source?: string;
  source_index?: number;
  clip_index?: number;
  video?: string;
  error?: string;
}

const EvaluateColsignBiAsimetrico: React.FC = () => {
  const [selectedSearch, setSelectedSearch] = useState<{ label: string; type: string } | null>(null);
  const [selectedSign, setSelectedSign] = useState<Sign | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [levelId, setLevelId] = useState<string | null>(null);

  // Estado para la respuesta de la API
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
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setLevelId(userDoc.data().levelId);
        } else {
          console.error("El documento del usuario no existe en Firestore.");
        }
      } else {
        console.error("No hay un usuario autenticado.");
      }
    };
    fetchUserData();
  }, []);

  // Busca la seña (video de ejemplo) por el nombre de la etiqueta seleccionada
  const fetchSpecificSign = useCallback(async (label: string) => {
    if (!label.trim()) {
      setSelectedSign(null);
      setErrorMessage("Por favor, selecciona una seña.");
      return;
    }

    setIsPending(true);
    setErrorMessage(null);
    setSelectedSign(null);
    setApiResponse(null);
    setApiError(null);

    try {
      const videoExampleCollection = collection(db, "video_example");
      const q = query(
        videoExampleCollection,
        where("name", "==", label),
        where("status", "==", "activo"),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const foundSign = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data(),
        } as Sign;
        setSelectedSign(foundSign);
      } else {
        setErrorMessage(`No se encontró una seña activa para "${label}".`);
      }
    } catch (error) {
      console.error("Error buscando la seña:", error);
      setErrorMessage("Error buscando la seña.");
    } finally {
      setIsPending(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSearch) {
      fetchSpecificSign(selectedSearch.label);
    }
  }, [selectedSearch, fetchSpecificSign]);

  const handleLabelAndTypeSelect = (label: string, type?: string) => {
    setSelectedSearch({ label, type: type ?? "Palabra" });
  };

  const getRecordingDuration = (type: string) => {
    if (type === "Caracter") return 3000;
    if (type === "Palabra") return 3000;
    if (type === "Frases") return 5000;
    return 3000;
  };

  // Manejar los datos del video subido y enviarlos a la API del modelo
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
      type_extract: "pose_hands_45",
      timestamp: new Date().toISOString(),
    };

    try {
      // El endpoint solo requiere la URL del video subido a Storage
      const response = await fetch(COLSIGN_TEST_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ video_url: videoDownloadUrl }),
      });

      if (!response.ok) {
        let detail = "Error al enviar datos a la API";
        try {
          const errorData = await response.json();
          detail = errorData.error || errorData.message || detail;
        } catch {
          // respuesta sin cuerpo JSON
        }
        throw new Error(detail);
      }

      const data: ApiResponse = await response.json();

      // La API puede responder 200 con un campo "error" indicando un fallo controlado
      if (data?.error) {
        throw new Error(data.error);
      }

      setApiResponse(data);

      // Guardar la respuesta de la API en Firestore
      setIsSavingEvaluation(true);
      try {
        const evaluatesSignCollection = collection(db, "evaluates_sign");
        await addDoc(evaluatesSignCollection, {
          label: selectedSign.name, // El valor del botón que presionó el usuario
          recordedVideoDocId: apiPayload.recordedVideoDocId,
          url_video: apiPayload.url_video,
          signName: apiPayload.signName,
          signId: apiPayload.signId,
          signType: apiPayload.signType,
          userId: apiPayload.userId,
          userLevelId: apiPayload.userLevelId,
          type_extract: apiPayload.type_extract,
          model: data?.model_name ?? "colsign_lstm_norm_45_154", // Modelo usado
          prediction: data?.label ?? null, // Predicción de la API (label)
          probabilities: data?.prob ?? null, // Probabilidad de la API (prob)
          evaluatedAt: new Date(),
        });
        console.log("✅ Evaluación guardada en Firestore correctamente.");
      } catch (firestoreError) {
        console.error("🚨 Error al guardar la evaluación en Firestore:", firestoreError);
        setApiError(
          `Error al guardar evaluación: ${
            firestoreError instanceof Error ? firestoreError.message : "Desconocido"
          }`
        );
      } finally {
        setIsSavingEvaluation(false);
      }
    } catch (error: unknown) {
      console.error("Error al enviar datos a la API:", error);
      if (error instanceof Error) {
        setApiError(`Error al enviar datos a la API: ${error.message}`);
      } else {
        setApiError("Error al enviar datos a la API: Desconocido");
      }
    } finally {
      setIsSendingToApi(false);
    }
  };

  return (
    <ProtectedRoute
      allowedRoles={[
        parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1),
        parseInt(process.env.NEXT_PUBLIC_APP_ROLE_3),
      ]}
    >
      <div className="p-4">
        <h1 className="text-3xl font-extrabold text-blue-500 mb-6">
          Evalúa el modelo de señas dinamicas asimetricas
        </h1>

        <div className="mb-8">
          <h2 className="text-xl text-gray-800 mb-4">
            Selecciona una seña, luego el sistema te entregará las opciones para grabar y evaluar
            tu seña como parte del conjunto de datos de prueba y evaluación:
          </h2>
          <LabelsColsignBiAsimetrico
            onLetterSelect={handleLabelAndTypeSelect}
            selectedLetter={selectedSearch?.label ?? null}
            signType="Palabra"
          />
        </div>

        {isPending && (
          <p className="text-blue-600 text-center text-lg mt-4 animate-pulse">Buscando seña...</p>
        )}
        {errorMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
            role="alert"
          >
            <strong className="font-bold">¡Error!</strong>
            <span className="block sm:inline"> {errorMessage}</span>
          </div>
        )}

        {selectedSign && userId && levelId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Grabar seña para evaluar: {selectedSign.name}
              </h2>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Si tienes dudas de cómo hacer la seña elegida, revisa el video de ejemplo. Recuerda
                que en cada video solo debe aparecer una persona haciendo la seña y se debe grabar de
                la cintura hacia arriba, similar al video de ejemplo.
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
                  <p>Procesando seña y guardando evaluación ...</p>
                </div>
              )}
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Video de Ejemplo: {selectedSign.name}
              </h2>
              <ExampleVideo
                name={selectedSign.name}
                meaning={selectedSign.meaning}
                videoPath={selectedSign.videoPath}
                reference={selectedSign.reference}
              />
            </div>
          </div>
        )}

        {(isSendingToApi || isSavingEvaluation) && (
          <p className="text-blue-600 text-center text-lg mt-4 animate-pulse">
            {isSendingToApi ? "Procesando seña..." : "Guardando evaluación..."}
          </p>
        )}
        {apiError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
            role="alert"
          >
            <strong className="font-bold">¡Error de API! Intente más tarde </strong>
            <span className="block sm:inline"> {apiError}</span>
          </div>
        )}
        {apiResponse && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4"
            role="alert"
          >
            <span className="block sm:inline">
              Predicción: {apiResponse?.label}
              {typeof apiResponse?.prob === "number" && (
                <> ({(apiResponse.prob * 100).toFixed(2)}%)</>
              )}
            </span>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default EvaluateColsignBiAsimetrico;
