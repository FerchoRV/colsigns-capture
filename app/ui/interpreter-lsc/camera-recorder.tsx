// app/ui/send-signs/camera-recorder.js
"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db } from '@/firebase/firebaseConfig';
import { v4 as uuidv4 } from "uuid";
import { VideoCameraSlashIcon } from "@heroicons/react/24/outline";

interface CameraRecorderProps {
    name: string;
    idUser: string;
    levelId: string;
    type: string;
    duration?: number;
    onStream?: (stream: MediaStream) => void;
    // NUEVA PROP: Callback para devolver el ID del documento y la URL del video
    onVideoUploaded?: (docId: string, videoUrl: string) => void; 
    // Deshabilita el inicio de grabación (p. ej. mientras se procesa el video en la API)
    disabled?: boolean;
}

const CameraRecorder: React.FC<CameraRecorderProps> = ({ name='sign-video-to-text', idUser, levelId, type='grupo-señas', duration, onVideoUploaded, disabled = false }) => { // Asegúrate de incluir onVideoUploaded aquí
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const visibilityTipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isCancelledRef = useRef(false); // Marca si la grabación se canceló (no se debe enviar)
    const [recording, setRecording] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [showVisibilityTip, setShowVisibilityTip] = useState(false);

    const startCamera = useCallback(async () => {
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            setStream(userStream);
            if (videoRef.current) {
                videoRef.current.srcObject = userStream;
            }
        } catch (error) {
            console.error("Error al acceder a la cámara:", error);
            alert("Error al acceder a la cámara. Asegúrate de dar permisos."); // Mensaje más amigable
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    }, [stream]);

    // Sube el video grabado a Storage, lo registra en Firestore y notifica al padre
    const uploadRecording = useCallback(async (blob: Blob) => {
        if (!idUser) {
            alert("No hay un usuario autenticado. Inicia sesión antes de enviar el video.");
            return;
        }

        setIsUploading(true);

        try {
            const storage = getStorage();
            const uniqueCode = uuidv4();
            const fileName = `${name}_${uniqueCode}.mp4`;
            const storageRef = ref(storage, `videos-signs-to-text/${fileName}`);
            const snapshot = await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(snapshot.ref);

            console.log("✅ Video subido correctamente:", downloadURL);

            const signDataCollection = collection(db, "signs-to-text-collection");
            const docRef = await addDoc(signDataCollection, {
                userId: idUser, // Debe coincidir con request.auth.uid según las reglas de Firestore
                nivel_user: levelId,
                type,
                videoPath: downloadURL,
                createdAt: new Date(),
            });

            console.log("✅ Información registrada correctamente en Firestore. ID:", docRef.id);

            // LLAMAR AL CALLBACK CON EL ID DEL DOCUMENTO Y LA URL
            if (onVideoUploaded) {
                onVideoUploaded(docRef.id, downloadURL);
            }
        } catch (error) {
            console.error("🚨 Error al subir el video o registrar la información:", error);
            alert("Error al enviar el video. Por favor, revisa la consola para más detalles.");
        } finally {
            setIsUploading(false);
        }
    }, [idUser, name, levelId, type, onVideoUploaded]);

    const startRecording = useCallback(() => {
        if (!stream) {
            alert("Cámara no activa. Por favor, enciende la cámara primero."); // Alerta si no hay stream
            return;
        }

        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        // Al detener (por tiempo o por el usuario), enviar de inmediato (salvo cancelación)
        recorder.onstop = () => {
            setRecording(false);
            if (autoStopTimeoutRef.current) {
                clearTimeout(autoStopTimeoutRef.current);
                autoStopTimeoutRef.current = null;
            }
            // Si se canceló, descartar el video y no enviarlo
            if (isCancelledRef.current) {
                isCancelledRef.current = false;
                return;
            }
            const blob = new Blob(chunks, { type: "video/mp4" });
            uploadRecording(blob);
        };

        recorder.start();
        isCancelledRef.current = false;
        setRecording(true);

        // Detener la grabación automáticamente al cumplir la duración
        autoStopTimeoutRef.current = setTimeout(() => {
            if (recorder.state === 'recording') {
                recorder.stop();
            }
        }, duration);

        mediaRecorderRef.current = recorder;
    }, [stream, duration, uploadRecording]);

    // Detiene la grabación antes de tiempo y envía el video
    const stopRecordingEarly = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            isCancelledRef.current = false;
            mediaRecorderRef.current.stop(); // Dispara onstop -> envío inmediato
        }
    }, []);

    // Cancela la grabación sin enviar el video
    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            isCancelledRef.current = true;
            mediaRecorderRef.current.stop(); // Dispara onstop -> se descarta por la bandera
        }
    }, []);

    // Manejar el contador regresivo
    useEffect(() => {
        if (countdown === null) return;
        if (countdown === 0) {
            setCountdown(null);
            startRecording();
            return;
        }
        const timer = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
        return () => clearTimeout(timer);
    }, [countdown, startRecording]);

    // Atajos de teclado mientras se está grabando:
    // - Enter: enviar el video ahora
    // - Escape o Delete (Suprimir): cancelar sin enviar
    useEffect(() => {
        if (!recording) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                stopRecordingEarly();
            } else if (e.key === 'Escape' || e.key === 'Delete') {
                e.preventDefault();
                cancelRecording();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [recording, stopRecordingEarly, cancelRecording]);

    // Modifica el botón de grabación para iniciar el contador
    const handleStartCountdown = () => {
        if (!isCameraOn) {
            alert("Por favor, enciende la cámara antes de iniciar la grabación.");
            return;
        }
        if (disabled) return; // No iniciar si está deshabilitado (procesando)
        setCountdown(3);
    };

    // Efecto para apagar la cámara cuando el componente se desmonte
    useEffect(() => {
        return () => {
            if (autoStopTimeoutRef.current) {
                clearTimeout(autoStopTimeoutRef.current);
            }
            if (visibilityTipTimeoutRef.current) {
                clearTimeout(visibilityTipTimeoutRef.current);
            }
            stopCamera();
        };
    }, [stopCamera]); // Dependencia stopCamera

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-base font-medium text-blue-600">Tiempo maximo de grabación: {duration ? duration / 1000 : 3} segundos</h2>
            
            {/* Botón para activar/desactivar la cámara */}
            {!isCameraOn ? (
                <div className="flex flex-col items-center gap-4 w-full">
                    {/* Placeholder con ícono de cámara apagada */}
                    <div className="flex items-center justify-center w-full aspect-video bg-gray-100 rounded-lg">
                        <VideoCameraSlashIcon className="w-16 h-16 text-gray-400" />
                    </div>
                    <button
                        onClick={() => {
                            setIsCameraOn(true);
                            startCamera();
                            // Mostrar el mensaje de visibilidad durante 3 segundos
                            setShowVisibilityTip(true);
                            if (visibilityTipTimeoutRef.current) {
                                clearTimeout(visibilityTipTimeoutRef.current);
                            }
                            visibilityTipTimeoutRef.current = setTimeout(() => {
                                setShowVisibilityTip(false);
                            }, 3000);
                        }}
                        className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                        Encender Cámara
                    </button>
                </div>
            ) : (
                <>
                    {/* Video (se oculta si la cámara está apagada) */}
                    {isCameraOn && (
                        <div className="relative w-full bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                            <video ref={videoRef} autoPlay className="w-full h-auto max-h-[70vh] object-contain" /> {/* object-contain respeta la relación de aspecto de la cámara */}
                            {countdown !== null && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-7xl font-bold text-white drop-shadow-lg pointer-events-none select-none bg-black bg-opacity-40 rounded-full px-10 py-2">
                                        {countdown}
                                    </span>
                                </div>
                            )}
                            {showVisibilityTip && (
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] bg-black bg-opacity-70 text-white text-sm text-center px-4 py-2 rounded-lg">
                                    Procura que tu cabeza, hombros y manos estén siempre visibles por la cámara.
                                </div>
                            )}
                            {recording && (
                                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> Grabando
                                </div>
                            )}
                        </div>
                    )}

                    {/* Contenedor de botones */}
                    <div className="flex flex-col items-center gap-2 w-full">
                        <div className="flex gap-4 flex-wrap justify-center">
                            {isUploading ? (
                                <span className="px-4 py-2 text-gray-600 font-medium animate-pulse">
                                    Enviando video...
                                </span>
                            ) : recording ? (
                                <>
                                    <button
                                        onClick={stopRecordingEarly}
                                        className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                                    >
                                        Enviar ahora
                                    </button>
                                    <button
                                        onClick={cancelRecording}
                                        className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200"
                                    >
                                        Cancelar
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleStartCountdown}
                                    className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 ${
                                        countdown !== null || !isCameraOn || disabled
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-green-500 hover:bg-green-600"
                                    }`}
                                    disabled={countdown !== null || !isCameraOn || disabled}
                                >
                                    {disabled
                                        ? "Procesando..."
                                        : countdown !== null
                                        ? `Comenzando en ${countdown}...`
                                        : "Iniciar Grabación"}
                                </button>
                            )}

                            {/* Botón para apagar la cámara (oculto mientras graba o envía) */}
                            {!recording && !isUploading && (
                                <button
                                    onClick={() => {
                                        setIsCameraOn(false);
                                        stopCamera();
                                    }}
                                    className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200"
                                >
                                    Apagar Cámara
                                </button>
                            )}
                        </div>

                        {recording && (
                            <p className="text-sm text-gray-500 text-center">
                                El video se enviará automáticamente al terminar. Presiona <strong>Enter</strong> para enviarlo antes, o <strong>Esc</strong> / <strong>Supr</strong> para cancelar.
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CameraRecorder;