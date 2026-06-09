'use client';

import React, { useEffect, useState } from 'react';
import CameraRecorder from '@/app/ui/interpreter-lsc/camera-recorder';
import ExampleVideo from '@/app/ui/send-signs/example-video';
import { auth, db } from '@/firebase/firebaseConfig';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import ProtectedRoute from '@/app/components/ProtectedRoute';

const COLSIGN_API_BASE = "https://colsign-api-models-244204625992.europe-west1.run.app/api/v1";
const COLSIGN_ENDPOINT_SIGN_TO_TEXT_FLAT = `${COLSIGN_API_BASE}/sign-to-narrative/flat/sliding-window`;
const COLSIGN_ENDPOINT_SIGN_TO_TEXT_HIERARCHICAL = `${COLSIGN_API_BASE}/sign-to-narrative/hierarchical/sliding-window`;

// Archivo con las 154 señas disponibles (compartidas por ambas estrategias)
const LABELS_URL = "/info_models/colsign_lstm_norm_45_154_labels.json";

// Parámetros de procesamiento enviados a la API (aplican a ambos endpoints)
const API_PARAMS = {
    window_seconds: 2,
    stride_seconds: 1,
    min_confidence: 0.5,
    repeat_gap_seconds: 3,
    discard_tail_seconds: 2,
    min_segment_frames: 10,
};

// Cada predicción individual de la API (en orden de detección)
interface Prediction {
    label: string;
    prob?: number;
    [key: string]: unknown;
}

// Respuesta de los endpoints de narrativa
interface NarrativeResponse {
    count: number;
    predictions: Prediction[];
    narrative: string;
}

// Valores posibles para el campo result_select
type ResultSelection = 'flat' | 'hierarchical' | 'both' | 'none';

export default function SignRecognizer() {
    const [userId, setUserId] = useState<string | null>(null); // ID del usuario autenticado
    const [levelId, setLevelId] = useState<string | null>(null); // Nivel del usuario autenticado

    // Estado del procesamiento y resultados
    const [currentDocId, setCurrentDocId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingError, setProcessingError] = useState<string | null>(null);
    const [flatResponse, setFlatResponse] = useState<NarrativeResponse | null>(null);
    const [hierarchicalResponse, setHierarchicalResponse] = useState<NarrativeResponse | null>(null);

    // Estado de la selección del usuario
    const [resultSelect, setResultSelect] = useState<ResultSelection | null>(null);
    const [isSavingSelection, setIsSavingSelection] = useState(false);
    const [selectionError, setSelectionError] = useState<string | null>(null);

    // Estado del modal con las señas disponibles
    const [showLabelsModal, setShowLabelsModal] = useState(false);
    const [availableLabels, setAvailableLabels] = useState<string[]>([]);
    const [isLoadingLabels, setIsLoadingLabels] = useState(false);
    const [labelsError, setLabelsError] = useState<string | null>(null);

    // Estado de la seña seleccionada dentro del modal (para ver su video de ejemplo)
    const [selectedSign, setSelectedSign] = useState<{
        name: string;
        videoPath: string;
        meaning?: string;
        reference?: string;
    } | null>(null);
    const [isLoadingSign, setIsLoadingSign] = useState(false);
    const [signError, setSignError] = useState<string | null>(null);

    // Busca el video de ejemplo de una seña por su nombre
    const handleSelectLabel = async (label: string) => {
        setIsLoadingSign(true);
        setSignError(null);
        setSelectedSign(null);

        try {
            const q = query(
                collection(db, 'video_example'),
                where('name', '==', label),
                where('status', '==', 'activo'),
                limit(1)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const data = snapshot.docs[0].data() as {
                    name: string;
                    videoPath: string;
                    meaning?: string;
                    reference?: string;
                };
                setSelectedSign({
                    name: data.name ?? label,
                    videoPath: data.videoPath,
                    meaning: data.meaning,
                    reference: data.reference,
                });
            } else {
                setSelectedSign({ name: label, videoPath: '' });
                setSignError(`No se encontró un video de ejemplo para "${label}".`);
            }
        } catch (error) {
            console.error('Error al buscar el video de ejemplo:', error);
            setSignError('Error al cargar el video de ejemplo.');
        } finally {
            setIsLoadingSign(false);
        }
    };

    // Vuelve a la lista de señas dentro del modal
    const handleBackToLabels = () => {
        setSelectedSign(null);
        setSignError(null);
    };

    // Cierra el modal y reinicia la selección interna
    const handleCloseLabelsModal = () => {
        setShowLabelsModal(false);
        setSelectedSign(null);
        setSignError(null);
    };

    // Cargar las señas disponibles desde el JSON (una sola vez)
    useEffect(() => {
        let isMounted = true;

        const fetchLabels = async () => {
            try {
                setIsLoadingLabels(true);
                setLabelsError(null);

                const response = await fetch(LABELS_URL, { cache: 'force-cache' });
                if (!response.ok) {
                    throw new Error(`No se pudo cargar la lista de señas (${response.status}).`);
                }

                const data = await response.json();
                const idToName: Record<string, string> = data?.id_to_name ?? {};

                // Ordena por id numérico para mostrarlas de forma estable
                const labels = Object.entries(idToName)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([, name]) => name);

                if (isMounted) setAvailableLabels(labels);
            } catch (error) {
                if (isMounted) {
                    setLabelsError(
                        error instanceof Error ? error.message : 'Error al cargar las señas disponibles.'
                    );
                }
            } finally {
                if (isMounted) setIsLoadingLabels(false);
            }
        };

        fetchLabels();

        return () => {
            isMounted = false;
        };
    }, []);

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

    // Envía el video a un endpoint de narrativa con los parámetros de procesamiento
    const fetchNarrative = async (endpoint: string, videoUrl: string): Promise<NarrativeResponse> => {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_url: videoUrl, ...API_PARAMS }),
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

        // Procesar ambos modelos en paralelo, tolerante a fallos (una sola llamada por modelo)
        const [flatResult, hierarchicalResult] = await Promise.allSettled([
            fetchNarrative(COLSIGN_ENDPOINT_SIGN_TO_TEXT_FLAT, videoUrl),
            fetchNarrative(COLSIGN_ENDPOINT_SIGN_TO_TEXT_HIERARCHICAL, videoUrl),
        ]);

        const flatData = flatResult.status === 'fulfilled' ? flatResult.value : null;
        const hierarchicalData = hierarchicalResult.status === 'fulfilled' ? hierarchicalResult.value : null;

        setFlatResponse(flatData);
        setHierarchicalResponse(hierarchicalData);

        if (!flatData && !hierarchicalData) {
            setProcessingError('No fue posible procesar el video en ninguno de los modelos. Intenta nuevamente.');
        } else if (!flatData) {
            setProcessingError('El modelo plano no respondió correctamente. Se muestra solo el modelo jerárquico.');
        } else if (!hierarchicalData) {
            setProcessingError('El modelo jerárquico no respondió correctamente. Se muestra solo el modelo plano.');
        }

        // Guardar las respuestas completas y los parámetros de procesamiento (campos independientes)
        try {
            await updateDoc(doc(db, 'signs-to-text-collection', docId), {
                flat_narrative_response: flatData ?? null,
                hierarchical_narrative_response: hierarchicalData ?? null,
                window_seconds: API_PARAMS.window_seconds,
                stride_seconds: API_PARAMS.stride_seconds,
                min_confidence: API_PARAMS.min_confidence,
                repeat_gap_seconds: API_PARAMS.repeat_gap_seconds,
                discard_tail_seconds: API_PARAMS.discard_tail_seconds,
                min_segment_frames: API_PARAMS.min_segment_frames,
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
    };

    const hasResults = Boolean(flatResponse || hierarchicalResponse);

    // Renderiza el contenido de una tarjeta según el estado del procesamiento
    const renderNarrativeContent = (response: NarrativeResponse | null) => {
        if (isProcessing) {
            return (
                <p className="text-blue-600 text-sm animate-pulse">Procesando...</p>
            );
        }
        if (!currentDocId) {
            return <p className="text-gray-400 italic">Aquí se mostrará el resultado.</p>;
        }
        if (!response) {
            return <p className="text-gray-400 italic">Sin respuesta de este modelo.</p>;
        }

        // Lista de labels en el orden de detección
        const detectedLabels = Array.isArray(response.predictions)
            ? response.predictions
                  .map((p) => p?.label)
                  .filter((label): label is string => Boolean(label && label.trim().length > 0))
            : [];

        if (response.narrative && response.narrative.trim().length > 0) {
            return (
                <div className="space-y-2">
                    <p className="text-gray-800 text-lg">{response.narrative}</p>
                    {detectedLabels.length > 0 && (
                        <p className="text-sm text-gray-500">
                            <span className="font-semibold">Señas detectadas:</span>{' '}
                            {detectedLabels.join(', ')}
                        </p>
                    )}
                </div>
            );
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
        <p className="p-2">El módulo señas a texto está diseñado para que el usuario pueda grabar un grupo de señas en videos de máximo 20 segundos el sistema procesará el video y entregara el texto correspondiente a las señas grabadas, el resultado se mostrará en la pantalla, para conocer las señas disponibles{' '}
          <button
            type="button"
            onClick={() => setShowLabelsModal(true)}
            className="text-blue-600 underline font-medium hover:text-blue-800"
          >
            da clic aquí
          </button>.</p>
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
                        </div>
                    )}

                    {/* Las dos tarjetas siempre están visibles */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white shadow rounded-lg p-5">
                            <h3 className="text-lg font-bold text-blue-600 mb-2">Modelo Colsign 154</h3>
                            {renderNarrativeContent(flatResponse)}
                        </div>

                        <div className="bg-white shadow rounded-lg p-5">
                            <h3 className="text-lg font-bold text-blue-600 mb-2">Estrategia Jerárquica</h3>
                            {renderNarrativeContent(hierarchicalResponse)}
                        </div>
                    </div>

                    {/* La votación solo aparece cuando hay resultados */}
                    {hasResults && !isProcessing && (
                        <div className="mt-6 border-t pt-5">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                                ¿Cuál resultado se ajusta mejor a las señas enviadas?
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

        {/* Modal con las señas disponibles */}
        {showLabelsModal && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                onClick={handleCloseLabelsModal}
            >
                <div
                    className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <div className="flex items-center gap-3">
                            {selectedSign && (
                                <button
                                    type="button"
                                    onClick={handleBackToLabels}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    ← Volver
                                </button>
                            )}
                            <h3 className="text-lg font-semibold text-gray-800">
                                {selectedSign
                                    ? `Ejemplo: ${selectedSign.name}`
                                    : `Señas disponibles${availableLabels.length > 0 ? ` (${availableLabels.length})` : ''}`}
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={handleCloseLabelsModal}
                            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                            aria-label="Cerrar"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        {selectedSign ? (
                            // Vista de detalle: video de ejemplo de la seña seleccionada
                            signError ? (
                                <p className="text-red-600 text-center">{signError}</p>
                            ) : selectedSign.videoPath ? (
                                <ExampleVideo
                                    name={selectedSign.name}
                                    meaning={selectedSign.meaning}
                                    videoPath={selectedSign.videoPath}
                                    reference={selectedSign.reference}
                                />
                            ) : (
                                <p className="text-gray-500 text-center">No hay video disponible para esta seña.</p>
                            )
                        ) : isLoadingSign ? (
                            <p className="text-blue-600 text-center animate-pulse">Cargando video de ejemplo...</p>
                        ) : isLoadingLabels ? (
                            <p className="text-blue-600 text-center animate-pulse">Cargando señas...</p>
                        ) : labelsError ? (
                            <p className="text-red-600 text-center">{labelsError}</p>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500 mb-3 text-center">
                                    Selecciona una seña para ver su video de ejemplo.
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {availableLabels.map((label, index) => (
                                        <button
                                            key={`${label}-${index}`}
                                            type="button"
                                            onClick={() => handleSelectLabel(label)}
                                            className="px-3 py-1.5 bg-gray-100 rounded-md text-sm text-gray-700 text-center break-words hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="px-6 py-3 border-t text-right">
                        <button
                            type="button"
                            onClick={handleCloseLabelsModal}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        )}
        </ProtectedRoute>
    );
}
