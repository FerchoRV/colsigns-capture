// app/ui/send-signs/camera-recorder.js
"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db } from '@/firebase/firebaseConfig';
import { v4 as uuidv4 } from "uuid";

interface CameraRecorderProps {
    name: string;
    idSign: string;
    idUser: string;
    levelId: string;
    type: string;
    duration?: number;
    onStream?: (stream: MediaStream) => void;
    // NUEVA PROP: Callback para devolver el ID del documento y la URL del video
    onVideoUploaded?: (docId: string, videoUrl: string) => void; 
}

const CameraRecorder: React.FC<CameraRecorderProps> = ({ name, idSign, idUser, levelId, type, duration, onVideoUploaded }) => { // Asegúrate de incluir onVideoUploaded aquí
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [recording, setRecording] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

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

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/mp4" });
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
        };

        recorder.start();
        setRecording(true);

        // Detener la grabación después de la duración especificada
        setTimeout(() => {
            if (recorder.state === 'recording') { // Asegurarse de que sigue grabando
                recorder.stop();
            }
            setRecording(false);
        }, duration);

        mediaRecorderRef.current = recorder;
    }, [stream, duration]);

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

    // Modifica el botón de grabación para iniciar el contador
    const handleStartCountdown = () => {
        if (!isCameraOn) {
            alert("Por favor, enciende la cámara antes de iniciar la grabación.");
            return;
        }
        setCountdown(3);
    };

    const deleteRecording = () => {
        setVideoUrl(null);
        // Opcional: Si quieres reiniciar la cámara después de eliminar
        // setIsCameraOn(false);
        // stopCamera();
    };

    const handleAccept = async () => {
        if (!videoUrl) {
            alert("No hay video para enviar.");
            return;
        }

        setIsUploading(true);

        try {
            const response = await fetch(videoUrl);
            const blob = await response.blob();

            const storage = getStorage();
            const uniqueCode = uuidv4();
            const fileName = `${name}_${uniqueCode}.mp4`;
            const storageRef = ref(storage, `sign_videos_evaluate/${name}/${fileName}`); // Ruta más organizada en Storage
            const snapshot = await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(snapshot.ref);

            console.log("✅ Video subido correctamente:", downloadURL);

            const signDataCollection = collection(db, "sign_data");
            const docRef = await addDoc(signDataCollection, { // Captura la referencia del documento
                label: name,
                id_sign: idSign,
                id_user: idUser,
                nivel_user: levelId,
                type,
                videoPath: downloadURL,
                status_verified: false,
                createdAt: new Date(),
            });

            console.log("✅ Información registrada correctamente en Firestore. ID:", docRef.id);
            alert("Video enviado correctamente.");
            setVideoUrl(null); // Limpiar el video grabado

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
    };

    // Efecto para apagar la cámara cuando el componente se desmonte
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]); // Dependencia stopCamera

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-base font-medium">Tiempo de grabación: {duration ? duration / 1000 : 3} segundos</h2>
            
            {/* Botón para activar/desactivar la cámara */}
            {!isCameraOn ? (
                <button
                    onClick={() => {
                        setIsCameraOn(true);
                        startCamera();
                    }}
                    className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                    Encender Cámara
                </button>
            ) : (
                <>
                    {/* Video (se oculta si la cámara está apagada) */}
                    {isCameraOn && (
                        <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden"> {/* Añadido bg-gray-200 para ver el área */}
                            <video ref={videoRef} autoPlay className="w-full h-full object-cover" /> {/* object-cover para que llene el espacio */}
                            {countdown !== null && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-7xl font-bold text-white drop-shadow-lg pointer-events-none select-none bg-black bg-opacity-40 rounded-full px-10 py-2">
                                        {countdown}
                                    </span>
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
                    <div className="flex gap-4 flex-wrap justify-center"> {/* flex-wrap para responsividad */}
                        {/* Botón de grabación */}
                        {!videoUrl && (
                            <button
                                onClick={handleStartCountdown} // Llama a handleStartCountdown
                                className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 ${
                                    recording || countdown !== null || !isCameraOn
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-green-500 hover:bg-green-600" // Cambiado a verde para grabar
                                }`}
                                disabled={recording || countdown !== null || !isCameraOn}
                            >
                                {recording
                                    ? "Grabando..."
                                    : countdown !== null
                                    ? `Comenzando en ${countdown}...`
                                    : "Iniciar Grabación"}
                            </button>
                        )}

                        {/* Botón para apagar la cámara */}
                        <button
                            onClick={() => {
                                setIsCameraOn(false);
                                stopCamera();
                                setVideoUrl(null); // Limpiar video si apaga cámara
                            }}
                            className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200"
                        >
                            Apagar Cámara
                        </button>
                    </div>
                </>
            )}

            {/* Mostrar video grabado */}
            {videoUrl && (
                <div className="flex flex-col items-center gap-2 w-full max-w-md">
                    <video src={videoUrl} controls className="w-full h-64 bg-black rounded-lg" />
                    <div className="flex gap-4">
                        <button
                            onClick={handleAccept}
                            disabled={isUploading}
                            className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 ${
                                isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                            }`}
                        >
                            {isUploading ? "Subiendo..." : "Aceptar y Enviar"}
                        </button>
                        <button
                            onClick={deleteRecording}
                            className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200"
                        >
                            Eliminar Grabación
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CameraRecorder;