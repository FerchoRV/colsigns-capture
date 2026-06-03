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
    const fetchNarrative = async (endpoint: string, videoUrl: string): Promise<NarrativeResponse> => {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_url: videoUrl }),
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

        // Procesar ambos modelos en paralelo de forma tolerante a fallos
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

        // Guardar las respuestas completas en el documento ya creado
        try {
            await updateDoc(doc(db, 'signs-to-text-collection', docId), {
                flat_narrative_response: flatData ?? null,
                hierarchical_narrative_response: hierarchicalData ?? null,
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
            return <p className="text-blue-600 animate-pulse">Procesando...</p>;
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
        <p className="p-2">Solo puedes enviar un video de máximo 15 segundos, pero si necesitas menos tiempo al momento de grabar puedes presionar el botón enviar o la tecla enter y se enviará lo grabado hasta el momento o para cancelar la grabación presiona escape o el botón cancelar, al finalizar el sistema te pedirá votar cual resultado es correcto, para hacer seguimiento de los resultados.</p>
        
        <div className="flex flex-col md:flex-row gap-6 mt-6">
            {/* Columna izquierda: grabación */}
            <div className="w-full md:w-1/2">
                <CameraRecorder
                    name='sign-video-to-text'
                    idUser={userId ?? ''}
                    levelId={levelId ?? ''}
                    type='grupo-señas'
                    duration={15000}
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
