'use client';

import React, { useEffect, useState } from 'react';
import CameraRecorder from '@/app/ui/interpreter-lsc/camera-recorder';
import { auth, db } from '@/firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import ProtectedRoute from '@/app/components/ProtectedRoute';

const COLSIGN_API_BASE = "https://colsign-api-models-244204625992.europe-west1.run.app/api/v1";
const COLSIGN_ENDPOINT_SIGN_TO_TEXT_FLAT = `${COLSIGN_API_BASE}/sign-to-narrative/flat`;
const COLSIGN_ENDPOINT_SIGN_TO_TEXT_HIERARCHICAL = `${COLSIGN_API_BASE}/sign-to-narrative/hierarchical`;

// Respuesta de los endpoints de narrativa
interface NarrativeResponse {
    count: number;
    predictions: unknown[];
    narrative: string;
}

// Valores posibles para el campo result_select
type ResultSelection = 'flat' | 'hierarchical' | 'both' | 'none';

type ModelKey = 'flat' | 'hierarchical';

type ModelProgressStatus = 'idle' | 'processing' | 'retrying' | 'completed' | 'failed';

interface ModelProgress {
    status: ModelProgressStatus;
    clipSeconds: number | null;
    attempt: number;
}

const INITIAL_MODEL_PROGRESS: Record<ModelKey, ModelProgress> = {
    flat: { status: 'idle', clipSeconds: null, attempt: 0 },
    hierarchical: { status: 'idle', clipSeconds: null, attempt: 0 },
};

export default function SignRecognizer() {
    const [userId, setUserId] = useState<string | null>(null); // ID del usuario autenticado
    const [levelId, setLevelId] = useState<string | null>(null); // Nivel del usuario autenticado

    // Estado del procesamiento y resultados
    const [currentDocId, setCurrentDocId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [modelProgress, setModelProgress] = useState<Record<ModelKey, ModelProgress>>(INITIAL_MODEL_PROGRESS);
    const [processingError, setProcessingError] = useState<string | null>(null);
    const [flatResponse, setFlatResponse] = useState<NarrativeResponse | null>(null);
    const [hierarchicalResponse, setHierarchicalResponse] = useState<NarrativeResponse | null>(null);

    // Estado de la selección del usuario
    const [resultSelect, setResultSelect] = useState<ResultSelection | null>(null);
    const [isSavingSelection, setIsSavingSelection] = useState(false);
    const [selectionError, setSelectionError] = useState<string | null>(null);

    // Obtener el usuario autenticado y su nivel
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUserId(user.uid);
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setLevelId(userDoc.data().levelId ?? null);
                    }
                } catch (error) {
                    console.error('Error al obtener el nivel del usuario:', error);
                }
            } else {
                setUserId(null);
                setLevelId(null);
            }
        });
        return () => unsubscribe();
    }, []);

    // Envía el video a un endpoint de narrativa y devuelve la respuesta completa
    const fetchNarrative = async (endpoint: string, videoUrl: string, clip_seconds: number, min_confidence: number): Promise<NarrativeResponse> => {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_url: videoUrl, clip_seconds: clip_seconds, min_confidence: min_confidence }),
        });

        if (!response.ok) {
            let detail = 'Error al procesar el video en la API.';
            try {
                const errorData = await response.json();
                detail = errorData.error || errorData.message || detail;
            } catch {
                // respuesta sin cuerpo JSON
            }
            throw new Error(detail);
        }

        return (await response.json()) as NarrativeResponse;
    };

    // Indica si una respuesta tiene un narrative válido
    const hasValidNarrative = (response: NarrativeResponse | null): boolean =>
        Boolean(response?.narrative && response.narrative.trim().length > 0);

    const updateModelProgress = (model: ModelKey, update: Partial<ModelProgress>) => {
        setModelProgress((prev) => ({
            ...prev,
            [model]: { ...prev[model], ...update },
        }));
    };

    // Procesa un modelo reintentando con distintos clip_seconds hasta obtener narrative
    const processModelWithRetries = async (
        endpoint: string,
        videoUrl: string,
        modelKey: ModelKey
    ): Promise<{ response: NarrativeResponse | null; clipSeconds: number; minConfidence: number }> => {
        const clipSecondsSequence = [2, 1.5, 1]; // Se reduce el corte si narrative llega null
        const minConfidence = 0.6;

        let lastResponse: NarrativeResponse | null = null;
        let lastClipSeconds = clipSecondsSequence[0];

        for (let i = 0; i < clipSecondsSequence.length; i++) {
            const clip = clipSecondsSequence[i];
            lastClipSeconds = clip;

            updateModelProgress(modelKey, {
                status: i === 0 ? 'processing' : 'retrying',
                clipSeconds: clip,
                attempt: i + 1,
            });

            try {
                const res = await fetchNarrative(endpoint, videoUrl, clip, minConfidence);
                lastResponse = res;
                // Si ya hay narrative válido, no se sigue reintentando
                if (hasValidNarrative(res)) {
                    updateModelProgress(modelKey, { status: 'completed', clipSeconds: clip, attempt: i + 1 });
                    return { response: res, clipSeconds: clip, minConfidence };
                }
            } catch (e) {
                console.error(`Error procesando ${endpoint} con clip_seconds=${clip}:`, e);
                // Continuar con el siguiente clip_seconds
            }
        }

        // Tras agotar los reintentos, se devuelve el último resultado (aunque narrative sea null)
        updateModelProgress(modelKey, {
            status: hasValidNarrative(lastResponse) ? 'completed' : 'failed',
            clipSeconds: lastClipSeconds,
            attempt: clipSecondsSequence.length,
        });
        return { response: lastResponse, clipSeconds: lastClipSeconds, minConfidence };
    };

    // Cuando el video se sube, procesarlo en ambos modelos y guardar las respuestas
    const handleVideoUploaded = async (docId: string, videoUrl: string) => {
        // Reiniciar el estado para un nuevo procesamiento
        setCurrentDocId(docId);
        setIsProcessing(true);
        setProcessingError(null);
        setFlatResponse(null);
        setHierarchicalResponse(null);
        setResultSelect(null);
        setSelectionError(null);
        setModelProgress(INITIAL_MODEL_PROGRESS);

        // Procesar ambos modelos en paralelo, cada uno con su propia secuencia de reintentos
        const [flatResult, hierarchicalResult] = await Promise.all([
            processModelWithRetries(COLSIGN_ENDPOINT_SIGN_TO_TEXT_FLAT, videoUrl, 'flat'),
            processModelWithRetries(COLSIGN_ENDPOINT_SIGN_TO_TEXT_HIERARCHICAL, videoUrl, 'hierarchical'),
        ]);

        const flatData = flatResult.response;
        const hierarchicalData = hierarchicalResult.response;

        setFlatResponse(flatData);
        setHierarchicalResponse(hierarchicalData);

        if (!flatData && !hierarchicalData) {
            setProcessingError('No fue posible procesar el video en ninguno de los modelos. Intenta nuevamente.');
        } else if (!flatData) {
            setProcessingError('El modelo plano no respondió correctamente. Se muestra solo el modelo jerárquico.');
        } else if (!hierarchicalData) {
            setProcessingError('El modelo jerárquico no respondió correctamente. Se muestra solo el modelo plano.');
        }

        // Guardar las respuestas completas y los parámetros usados por cada modelo
        try {
            await updateDoc(doc(db, 'signs-to-text-collection', docId), {
                flat_narrative_response: flatData ?? null,
                hierarchical_narrative_response: hierarchicalData ?? null,
                clip_seconds: {
                    flat: flatResult.clipSeconds,
                    hierarchical: hierarchicalResult.clipSeconds,
                },
                min_confidence: {
                    flat: flatResult.minConfidence,
                    hierarchical: hierarchicalResult.minConfidence,
                },
                processedAt: new Date(),
            });
        } catch (error) {
            console.error('🚨 Error al guardar las respuestas en Firestore:', error);
            setProcessingError(
                `Las respuestas se obtuvieron, pero hubo un error al guardarlas: ${
                    error instanceof Error ? error.message : 'Desconocido'
                }`
            );
        } finally {
            setIsProcessing(false);
            setModelProgress(INITIAL_MODEL_PROGRESS);
        }
    };

    // Guarda la selección del usuario en el campo result_select
    const handleSelectResult = async (selection: ResultSelection) => {
        if (!currentDocId) return;

        setIsSavingSelection(true);
        setSelectionError(null);

        try {
            await updateDoc(doc(db, 'signs-to-text-collection', currentDocId), {
                result_select: selection,
                resultSelectedAt: new Date(),
            });
            setResultSelect(selection);
        } catch (error) {
            console.error('🚨 Error al guardar la selección en Firestore:', error);
            setSelectionError(
                `Error al guardar tu selección: ${error instanceof Error ? error.message : 'Desconocido'}`
            );
        } finally {
            setIsSavingSelection(false);
        }
    };

    // Reinicia el panel de resultados para procesar un nuevo video
    const handleClearResults = () => {
        setCurrentDocId(null);
        setFlatResponse(null);
        setHierarchicalResponse(null);
        setResultSelect(null);
        setProcessingError(null);
        setSelectionError(null);
        setModelProgress(INITIAL_MODEL_PROGRESS);
    };

    const hasResults = Boolean(flatResponse || hierarchicalResponse);

    const getModelProgressLabel = (model: ModelKey): string => {
        const progress = modelProgress[model];
        if (progress.status === 'idle') {
            return 'En espera...';
        }
        if (progress.status === 'processing') {
            return `Analizando con corte de ${progress.clipSeconds}s (intento ${progress.attempt}/3)...`;
        }
        if (progress.status === 'retrying') {
            return `Reintentando con corte de ${progress.clipSeconds}s (intento ${progress.attempt}/3)...`;
        }
        if (progress.status === 'completed') {
            return 'Análisis completado.';
        }
        return 'Sin texto detectado tras todos los intentos.';
    };

    // Renderiza el contenido de una tarjeta según el estado del procesamiento
    const renderNarrativeContent = (response: NarrativeResponse | null, model: ModelKey) => {
        if (isProcessing) {
            return (
                <p className="text-blue-600 text-sm animate-pulse">
                    {getModelProgressLabel(model)}
                </p>
            );
        }
        if (!currentDocId) {
            return <p className="text-gray-400 italic">Aquí se mostrará el resultado.</p>;
        }
        if (!response) {
            return <p className="text-gray-400 italic">Sin respuesta de este modelo.</p>;
        }
        if (response.narrative && response.narrative.trim().length > 0) {
            return <p className="text-gray-800 text-lg">{response.narrative}</p>;
        }
        return <p className="text-orange-600 font-medium">Señas no detectadas</p>;
    };

    const selectionOptions: { value: ResultSelection; label: string }[] = [
        { value: 'flat', label: 'Colsign 154' },
        { value: 'hierarchical', label: 'Estrategia Jerárquica' },
        { value: 'both', label: 'Ambos' },
        { value: 'none', label: 'Ninguno' },
    ];

    return (
      <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1), parseInt(process.env.NEXT_PUBLIC_APP_ROLE_3)]}>
        <p className="p-2">El módulo señas a texto está diseñado para que el usuario pueda grabar un grupo de señas en videos de máximo 10 segundos el sistema procesará el video y entregara el texto correspondiente a las señas grabadas, el resultado se mostrará en la pantalla.</p>
        <p className="p-2">Solo puedes enviar un video de máximo 20 segundos, pero si necesitas menos tiempo al momento de grabar puedes presionar el botón enviar o la tecla enter y se enviará lo grabado hasta el momento o para cancelar la grabación presiona escape o el botón cancelar, al finalizar el sistema te pedirá votar cual resultado es correcto, para hacer seguimiento de los resultados.</p>
        
        <div className="flex flex-col md:flex-row gap-6 mt-6">
            {/* Columna izquierda: grabación */}
            <div className="w-full md:w-1/2">
                <CameraRecorder
                    name='sign-video-to-text'
                    idUser={userId ?? ''}
                    levelId={levelId ?? ''}
                    type='grupo-señas'
                    duration={20000}
                    onVideoUploaded={handleVideoUploaded}
                    disabled={isProcessing}
                />
            </div>

            {/* Columna derecha: resultados de los modelos y votación */}
            <div className="w-full md:w-1/2">
                <div className="bg-gray-50 border rounded-lg p-6 h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-blue-500 flex-1 text-center">
                            Resultados de la traducción
                        </h2>
                        {hasResults && !isProcessing && (
                            <button
                                onClick={handleClearResults}
                                disabled={isSavingSelection}
                                className={`ml-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300 ${
                                    isSavingSelection ? 'opacity-60 cursor-not-allowed' : ''
                                }`}
                            >
                                Limpiar
                            </button>
                        )}
                    </div>

                    {isProcessing && (
                        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-center">
                            <p className="text-blue-700 font-medium animate-pulse">
                                Procesando el video en ambos modelos...
                            </p>
                            <p className="text-blue-600 text-sm mt-1">
                                Se ajusta automáticamente el tiempo de corte si no se detectan señas.
                            </p>
                        </div>
                    )}

                    {/* Las dos tarjetas siempre están visibles */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white shadow rounded-lg p-5">
                            <h3 className="text-lg font-bold text-blue-600 mb-2">Modelo Colsign 154</h3>
                            {renderNarrativeContent(flatResponse, 'flat')}
                        </div>

                        <div className="bg-white shadow rounded-lg p-5">
                            <h3 className="text-lg font-bold text-blue-600 mb-2">Estrategia Jerárquica</h3>
                            {renderNarrativeContent(hierarchicalResponse, 'hierarchical')}
                        </div>
                    </div>

                    {/* La votación solo aparece cuando hay resultados */}
                    {hasResults && !isProcessing && (
                        <div className="mt-6 border-t pt-5">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                                ¿Cuál resultado consideras coherente?
                            </h3>
                            <div className="flex flex-wrap justify-center gap-3">
                                {selectionOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSelectResult(option.value)}
                                        disabled={isSavingSelection}
                                        className={`px-5 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                                            resultSelect === option.value
                                                ? 'bg-blue-700 text-white'
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                        } ${isSavingSelection ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            {isSavingSelection && (
                                <p className="text-blue-600 text-center mt-4 animate-pulse">Guardando tu selección...</p>
                            )}
                            {selectionError && (
                                <p className="text-red-600 text-center mt-4">{selectionError}</p>
                            )}
                            {resultSelect && !isSavingSelection && (
                                <p className="text-green-600 text-center mt-4 font-medium">
                                    ¡Gracias! Tu selección se registró correctamente.
                                </p>
                            )}
                        </div>
                    )}

                    {processingError && (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mt-4" role="alert">
                            <span className="block sm:inline">{processingError}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </ProtectedRoute>
    );
}
