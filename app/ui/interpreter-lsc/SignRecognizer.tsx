/* eslint-disable */

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { VideoCameraSlashIcon } from '@heroicons/react/24/outline';

// Define los modos de captura para controlar el comportamiento
type CaptureMode = 'none' | 'deletreo' | 'palabras';

// --- Constantes y Helpers (Fuera del componente para evitar recreación) ---
const POSE_LANDMARKS_COUNT = 33;
const HAND_LANDMARKS_COUNT = 21;
const COORDS_XYZ_VIS = 4; // X, Y, Z, Visibility
const COORDS_XYZ = 3;     // X, Y, Z

// Helper para extraer y aplanar landmarks con o sin visibility
const flattenLandmarks = (landmarks: any[] | undefined | null, includeVisibility: boolean = false): number[] => {
  const flattened: number[] = [];
  if (landmarks) {
    for (const landmark of landmarks) {
      flattened.push(landmark.x);
      flattened.push(landmark.y);
      flattened.push(landmark.z);
      if (includeVisibility && landmark.visibility !== undefined) { // Asegurarse que visibility exista
        flattened.push(landmark.visibility);
      }
    }
  }
  return flattened;
};

// Función para generar un array de ceros de una longitud específica
const createZeroArray = (length: number): number[] => Array(length).fill(0);

const SignRecognizer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cameraRef = useRef<any>(null); // Instancia de Camera
  const handsModelRef = useRef<any>(null); // Instancia del modelo Hands
  const poseModelRef = useRef<any>(null); // Instancia del modelo Pose

  // Referencias para almacenar los últimos resultados de MediaPipe de cada stream
  const lastPoseResultsRef = useRef<any | null>(null);
  const lastHandsResultsRef = useRef<any | null>(null);

  // Controla la frecuencia de procesamiento de keypoints para la API
  const lastProcessedKeypointsTimestampRef = useRef<number>(0);
  const API_PROCESSING_INTERVAL_MS = 1000 / 20; // Procesar keypoints para API a ~20 FPS (ajustable)

  const [cameraOn, setCameraOn] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [extractingPoints, setExtractingPoints] = useState(true); // Se usa una vez al principio
  const [mediaPipeLoaded, setMediaPipeLoaded] = useState(false);

  const [captureMode, setCaptureMode] = useState<CaptureMode>('none');
  const [keypointsSequence, setKeypointsSequence] = useState<number[][]>([]);

  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [isProcessingAPI, setIsProcessingAPI] = useState(false);
  const [isSequenceReadyToSend, setIsSequenceReadyToSend] = useState(false);

  const SEQUENCE_LENGTH = 30; // Longitud deseada de la secuencia de fotogramas

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_MODELS_URL;
  if (!API_BASE_URL) {
    console.error("NEXT_PUBLIC_API_MODELS_URL no está definida en las variables de entorno.");
    setLoadingError("URL de la API no definida. No se puede enviar la secuencia.");
    return;
  }

  // --- sendKeypointsToAPI (mantenida como está) ---
  // --- Ajuste de sendKeypointsToAPI para evitar perpetuidad ---
  const sendKeypointsToAPI = useCallback(async (keypoints: number[][], endpoint: string) => {
    if (isProcessingAPI) {
      console.log("API ya está procesando una secuencia. Ignorando nueva solicitud.");
      return;
    }
    if (!API_BASE_URL) {
      console.error("NEXT_PUBLIC_API_MODELS_URL no está definida en las variables de entorno.");
      setLoadingError("URL de la API no definida. No se puede enviar la secuencia.");
      return;
    }

    setIsProcessingAPI(true);
    setApiResponse(null); // Limpiar respuesta anterior
    setCaptureMode('none'); // Detener la acumulación inmediatamente antes de enviar

    try {
      const fullUrl = `${API_BASE_URL}/${endpoint}`;
      console.log(`Enviando a API: ${fullUrl}`);
      console.log("Datos enviados:", keypoints);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keypoints }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Respuesta de la API:", data);

      // Extraer solo el valor de `prediction` y almacenarlo
      setApiResponse(data.prediction || "No prediction available");

    } catch (error: any) {
      console.error('Error al enviar keypoints a la API:', error);
      setLoadingError(`Error al procesar la secuencia: ${error.message}`);
      setApiResponse("Error desconocido al comunicarse con la API.");
    } finally {
      setIsProcessingAPI(false);
      setKeypointsSequence([]); // Limpiar la secuencia para el próximo envío
      setIsSequenceReadyToSend(false); // Permitir una nueva captura
    }
  }, [API_BASE_URL, isProcessingAPI]);

  // --- accumulateKeypoints (mantenida como está) ---
  // --- Ajuste de accumulateKeypoints para controlar el envío ---
  const accumulateKeypoints = useCallback((flattenedKeypoints: number[]) => {
    if (isSequenceReadyToSend || isProcessingAPI) {
      return; // Evitar acumulación si la secuencia está lista o la API está procesando
    }

    setKeypointsSequence((prev) => {
      const updatedSequence = [...prev, flattenedKeypoints];
      if (updatedSequence.length >= SEQUENCE_LENGTH) {
        setIsSequenceReadyToSend(true); // Marcar la secuencia como lista para enviar
        console.log(`Secuencia de '${captureMode}' completa (${SEQUENCE_LENGTH} fotogramas).`);
        return updatedSequence.slice(0, SEQUENCE_LENGTH); // Limitar la secuencia a la longitud deseada
      }
      return updatedSequence;
    });
  }, [captureMode, SEQUENCE_LENGTH, isSequenceReadyToSend, isProcessingAPI]);

  // --- NUEVA FUNCIÓN: Procesa los keypoints para la API (Usa useCallback) ---
  // Esta función se encarga de extraer y formatear los keypoints y llamar a accumulateKeypoints
  const processFrameKeypointsForAPI = useCallback((
    poseResults: any | null,
    handsResults: any | null,
    mode: CaptureMode
  ) => {
    let currentFlattenedKeypoints: number[] = [];

    // Lógica para el modo 'deletreo' (Abecedario)
    if (mode === 'deletreo') {
      const lhRaw = flattenLandmarks(handsResults?.multiHandLandmarks?.[0] || null, false);
      const rhRaw = flattenLandmarks(handsResults?.multiHandLandmarks?.[1] || null, false);

      const lhKeypoints = lhRaw.length === (HAND_LANDMARKS_COUNT * COORDS_XYZ) ? lhRaw : createZeroArray(HAND_LANDMARKS_COUNT * COORDS_XYZ);
      const rhKeypoints = rhRaw.length === (HAND_LANDMARKS_COUNT * COORDS_XYZ) ? rhRaw : createZeroArray(HAND_LANDMARKS_COUNT * COORDS_XYZ);

      currentFlattenedKeypoints = [...lhKeypoints, ...rhKeypoints];

      if (currentFlattenedKeypoints.length === 126) {
        accumulateKeypoints(currentFlattenedKeypoints);
      }
    }
    // Lógica para el modo 'palabras'
    else if (mode === 'palabras') {
      const poseRaw = flattenLandmarks(poseResults?.poseLandmarks || null, true); // Con visibility
      const lhRaw = flattenLandmarks(handsResults?.multiHandLandmarks?.[0] || null, false); // Sin visibility
      const rhRaw = flattenLandmarks(handsResults?.multiHandLandmarks?.[1] || null, false); // Sin visibility

      const poseKeypoints = poseRaw.length === (POSE_LANDMARKS_COUNT * COORDS_XYZ_VIS) ? poseRaw : createZeroArray(POSE_LANDMARKS_COUNT * COORDS_XYZ_VIS);
      const lhKeypoints = lhRaw.length === (HAND_LANDMARKS_COUNT * COORDS_XYZ) ? lhRaw : createZeroArray(HAND_LANDMARKS_COUNT * COORDS_XYZ);
      const rhKeypoints = rhRaw.length === (HAND_LANDMARKS_COUNT * COORDS_XYZ) ? rhRaw : createZeroArray(HAND_LANDMARKS_COUNT * COORDS_XYZ);

      currentFlattenedKeypoints = [...poseKeypoints, ...lhKeypoints, ...rhKeypoints];

      if (currentFlattenedKeypoints.length === 258) {
        accumulateKeypoints(currentFlattenedKeypoints);
      }
    }
  }, [accumulateKeypoints]); // Dependencia: accumulateKeypoints

  // --- useEffect 1: Cargar scripts de MediaPipe y Inicializar Modelos (Mantenida) ---
  useEffect(() => {
    const initializeMediaPipeModels = async () => {
      try {
        setLoadingError(null);
        console.log("Intentando cargar y inicializar modelos de MediaPipe...");

        if (
          typeof window.Pose === 'undefined' || typeof window.Hands === 'undefined' ||
          typeof window.Camera === 'undefined' || typeof window.drawConnectors === 'undefined' ||
          typeof window.drawLandmarks === 'undefined' || typeof window.POSE_CONNECTIONS === 'undefined' ||
          typeof window.HAND_CONNECTIONS === 'undefined'
        ) {
          throw new Error("Las librerías de MediaPipe no se han cargado en el navegador. Reintentando...");
        }

        const pose: any = new (window as any).Pose({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });
        pose.setOptions({
          modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false,
          smoothSegmentation: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5,
        });
        poseModelRef.current = pose;

        const hands: any = new (window as any).Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        hands.setOptions({
          maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5,
        });
        handsModelRef.current = hands;

        setMediaPipeLoaded(true);
        console.log("Modelos de MediaPipe inicializados y listos.");

      } catch (error: any) {
        console.error('Error al cargar o inicializar modelos de MediaPipe:', error);
        setLoadingError(`Error al cargar los recursos de MediaPipe: ${error.message}.`);
        setMediaPipeLoaded(false);
        if (error.message.includes("not loaded") || error.message.includes("undefined")) {
          setTimeout(initializeMediaPipeModels, 500);
        }
      }
    };

    const checkAndInitialize = () => {
      if (typeof window.Pose !== 'undefined' && typeof window.Hands !== 'undefined' && typeof window.Camera !== 'undefined') {
        initializeMediaPipeModels();
      } else {
        setTimeout(checkAndInitialize, 100);
      }
    };

    checkAndInitialize();

    return () => {
      if (poseModelRef.current && typeof poseModelRef.current.close === 'function') {
        poseModelRef.current.close();
        poseModelRef.current = null;
      }
      if (handsModelRef.current && typeof handsModelRef.current.close === 'function') {
        handsModelRef.current.close();
        handsModelRef.current = null;
      }
    };
  }, [cameraOn, mediaPipeLoaded]);

  // --- useEffect 2: Control de la Cámara y Flujo de Procesamiento de Fotogramas (REVISADO) ---
  useEffect(() => {
    if (!mediaPipeLoaded || !cameraOn ) {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setLoadingError(null);
      setExtractingPoints(true); // Reiniciar para el próximo encendido
      setKeypointsSequence([]);
      setApiResponse(null);
      setIsProcessingAPI(false);
      setCaptureMode('none');
      lastPoseResultsRef.current = null; // Limpiar resultados anteriores
      lastHandsResultsRef.current = null; // Limpiar resultados anteriores
      lastProcessedKeypointsTimestampRef.current = 0; // Resetear temporizador
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const pose = poseModelRef.current;
    const hands = handsModelRef.current;

    if (!video || !canvas || !pose || !hands) {
      setLoadingError('Recursos de video/canvas o modelos de MediaPipe no disponibles.');
      setCameraOn(false);
      return;
    }

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) {
      setLoadingError('No se pudo obtener el contexto 2D del canvas.');
      setCameraOn(false);
      return;
    }

    const drawConnectors: Function = (window as any).drawConnectors;
    const drawLandmarks: Function = (window as any).drawLandmarks;
    const POSE_CONNECTIONS: any = (window as any).POSE_CONNECTIONS;
    const HAND_CONNECTIONS: any = (window as any).HAND_CONNECTIONS;

    // --- OnResults para Pose (Solo dibuja y almacena el resultado) ---
    pose.onResults((results: any) => {
      lastPoseResultsRef.current = results; // Almacena el último resultado de pose

      // Dibuja los landmarks de pose (la imagen base ya se dibuja en camera.onFrame)
      if (results.poseLandmarks && canvasCtx) {
        const mirroredPose = results.poseLandmarks.map((landmark: any) => ({
          ...landmark, x: 1 - landmark.x,
        }));
        drawConnectors(canvasCtx, mirroredPose, POSE_CONNECTIONS, { color: '#2563eb', lineWidth: 2 });
        drawLandmarks(canvasCtx, mirroredPose, { color: '#FF0000', radius: 0.5 });
        setExtractingPoints(false); // Solo una vez cuando se detectan puntos por primera vez
      }

      // Llama a la función de procesamiento unificada
      // Debe estar fuera de onResults directamente para evitar llamadas redundantes/desincronizadas
      // Se manejará en el onFrame de la cámara, o una vez que ambos results estén disponibles
    });

    // --- OnResults para Hands (Solo dibuja y almacena el resultado) ---
    hands.onResults((results: any) => {
      lastHandsResultsRef.current = results; // Almacena el último resultado de manos

      // Dibuja los landmarks de manos (la imagen base ya se dibuja en camera.onFrame)
      if (results.multiHandLandmarks && canvasCtx) {
        for (const landmarks of results.multiHandLandmarks) {
          const mirroredHand = landmarks.map((landmark: any) => ({
            ...landmark, x: 1 - landmark.x,
          }));
          drawConnectors(canvasCtx, mirroredHand, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
          drawLandmarks(canvasCtx, mirroredHand, { color: '#FF0000', radius: 0.5 });
        }
        setExtractingPoints(false); // Solo una vez cuando se detectan puntos por primera vez
      }

      // Llama a la función de procesamiento unificada
    });


    // --- Camera.onFrame (El bucle principal de renderizado y envío a modelos) ---
    const camera: any = new (window as any).Camera(video, {
      onFrame: async () => {
        // 1. Dibuja la imagen del video en el canvas UNA VEZ por fotograma
        if (canvasCtx && video) {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvas.width, canvas.height); // Limpia todo el canvas
          canvasCtx.scale(-1, 1); // Voltea horizontalmente para efecto espejo
          canvasCtx.translate(-canvas.width, 0); // Ajusta la traducción después de voltear
          canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height); // Dibuja el fotograma del video
          canvasCtx.restore(); // Restaura el estado del canvas para futuras operaciones
        }

        // 2. Envía el fotograma a los modelos de MediaPipe (asíncronamente)
        if (poseModelRef.current) await poseModelRef.current.send({ image: video });
        if (handsModelRef.current) await handsModelRef.current.send({ image: video });

        // 3. Procesa los keypoints para la API si es el momento y hay datos disponibles
        const now = performance.now();
        if (captureMode !== 'none' && now - lastProcessedKeypointsTimestampRef.current > API_PROCESSING_INTERVAL_MS) {
          // Para 'deletreo', solo necesitamos los resultados de las manos
          if (captureMode === 'deletreo' && lastHandsResultsRef.current) {
            processFrameKeypointsForAPI(
              null, // Pose no necesaria
              lastHandsResultsRef.current,
              captureMode
            );
            lastProcessedKeypointsTimestampRef.current = now;
          }
          // Para 'palabras', necesitamos ambos: pose y manos
          else if (captureMode === 'palabras' && lastPoseResultsRef.current && lastHandsResultsRef.current) {
            processFrameKeypointsForAPI(
              lastPoseResultsRef.current,
              lastHandsResultsRef.current,
              captureMode
            );
            lastProcessedKeypointsTimestampRef.current = now;
          }
        }
      },
      width: 640,
      height: 480,
    });
    camera.start();
    cameraRef.current = camera;

    // Función de limpieza para detener la cámara y los modelos al desmontar el componente o cambiar dependencias
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
      }
    };
  }, [
    cameraOn,
    mediaPipeLoaded,
    captureMode,
    processFrameKeypointsForAPI, // Dependencia para que useEffect sepa de este cambio
  ]);

  // Handlers de los Botones de Captura (mantienen la lógica de limpieza)
  const handleCaptureDeletreo = () => {
    if (!cameraOn || extractingPoints || captureMode !== 'none' || isProcessingAPI || isSequenceReadyToSend) {
      return; // Evitar iniciar captura si no es posible
    }
    setKeypointsSequence([]); // Limpiar secuencia anterior
    setApiResponse(null); // Limpiar respuesta anterior
    setIsProcessingAPI(false); // Reiniciar estado de procesamiento
    setIsSequenceReadyToSend(false); // Reiniciar estado de secuencia lista
    setCaptureMode('deletreo'); // Activar modo de captura
    lastProcessedKeypointsTimestampRef.current = 0; // Reiniciar temporizador
    console.log("Iniciando captura de 'Deletreo' (solo manos)...");
  };

  const handleCapturePalabras = () => {
    if (!cameraOn || extractingPoints || captureMode !== 'none' || isProcessingAPI || isSequenceReadyToSend) {
      return; // Evitar iniciar captura si no es posible
    }
    setKeypointsSequence([]); // Limpiar secuencia anterior
    setApiResponse(null); // Limpiar respuesta anterior
    setIsProcessingAPI(false); // Reiniciar estado de procesamiento
    setIsSequenceReadyToSend(false); // Reiniciar estado de secuencia lista
    setCaptureMode('palabras'); // Activar modo de captura
    lastProcessedKeypointsTimestampRef.current = 0; // Reiniciar temporizador
    console.log("Iniciando captura de 'Palabras' (manos y pose combinadas)...");
  };

  const toggleCamera = () => {
    setCameraOn(prev => !prev);
    setCaptureMode('none');
    setApiResponse(null);
    setIsProcessingAPI(false);
  };

  // --- NUEVO useEffect: Envío automático a la API al completar la secuencia ---
  useEffect(() => {
    if (isSequenceReadyToSend && !isProcessingAPI) {
      console.log("Disparando sendKeypointsToAPI por secuencia completa y lista.");
      if (keypointsSequence.length === SEQUENCE_LENGTH) {
        if (captureMode === 'deletreo') {
          console.log("Enviando secuencia de deletreo a la API...");
          sendKeypointsToAPI(keypointsSequence, 'predict_recognition_alphabet');
        } else if (captureMode === 'palabras') {
          console.log("Enviando secuencia de palabras a la API...");
          sendKeypointsToAPI(keypointsSequence, 'predict_recognition_words_v2');
        }
      } else {
        console.warn("Secuencia lista para enviar pero longitud inesperada:", keypointsSequence.length);
        setIsSequenceReadyToSend(false);
        setKeypointsSequence([]);
        setCaptureMode('none');
      }
    }
  }, [isSequenceReadyToSend, isProcessingAPI, keypointsSequence, captureMode, sendKeypointsToAPI]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 w-full">
      {/* Columna 1: Cámara y Canvas */}
      <div className="relative w-full max-w-[640px] aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-gray-300">
        {loadingError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-700 text-center p-4 z-10">
            <p>{loadingError}</p>
          </div>
        )}
        {cameraOn && extractingPoints && !loadingError && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-100 text-blue-600 text-center p-4 z-10">
            <p className="font-semibold text-lg">Extrayendo puntos de control...</p>
          </div>
        )}
        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-600 text-center p-4 z-10">
            <VideoCameraSlashIcon className="h-16 w-16 text-gray-500 mb-2" />
            <p>Cámara Apagada</p>
          </div>
        )}
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          width={640}
          height={480}
        />
      </div>

      {/* Columna 2: Botones y datos */}
      <div className="flex flex-col items-center justify-center gap-4">
        <button
          onClick={toggleCamera}
          disabled={!mediaPipeLoaded}
          className={`${
            !mediaPipeLoaded
              ? 'bg-gray-400 cursor-not-allowed'
              : cameraOn
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-semibold px-6 py-2 rounded-lg shadow-md transition`}
        >
          {cameraOn ? 'Apagar Cámara' : 'Encender Cámara'}
        </button>

        <button
          onClick={handleCaptureDeletreo}
          disabled={!cameraOn || extractingPoints || captureMode !== 'none' || isProcessingAPI}
          className={`${
            cameraOn && !extractingPoints && captureMode === 'none' && !isProcessingAPI
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-400 cursor-not-allowed'
          } text-white font-semibold px-6 py-2 rounded-lg shadow-md transition`}
        >
          Abecedario
        </button>

        <button
          onClick={handleCapturePalabras}
          disabled={!cameraOn || extractingPoints || captureMode !== 'none' || isProcessingAPI}
          className={`${
            cameraOn && !extractingPoints && captureMode === 'none' && !isProcessingAPI
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-gray-400 cursor-not-allowed'
          } text-white font-semibold px-6 py-2 rounded-lg shadow-md transition`}
        >
          Palabras
        </button>

        {/* Indicador de Captura Activa */}
        {captureMode !== 'none' && (
            <p className="text-blue-500 font-semibold text-center">
                Capturando '{captureMode}' ({keypointsSequence.length}/{SEQUENCE_LENGTH} fotogramas)
            </p>
        )}

        {/* Indicador de Procesamiento de API */}
        {isProcessingAPI && (
          <p className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg w-full text-center font-semibold">
            Procesando respuesta de la API...
          </p>
        )}

        {/* Mostrar Respuesta de la API */}
        {apiResponse && !isProcessingAPI && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg w-full text-sm break-all">
            <h3 className="font-semibold text-lg mb-2">Predicción:</h3>
            <p className="text-blue-600 font-bold">{apiResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignRecognizer;

