"use client";

import React, { useRef, useState, useEffect } from "react";

const CameraRecorder: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [recording, setRecording] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);

    // Función para iniciar la cámara
    const startCamera = async () => {
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(userStream);
            if (videoRef.current) {
                videoRef.current.srcObject = userStream;
            }
        } catch (error) {
            console.error("Error al acceder a la cámara:", error);
        }
    };

    // Función para detener la cámara
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    };

    // Efecto para manejar la cámara
    useEffect(() => {
        if (isCameraOn) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => stopCamera();
    }, [isCameraOn]);

    // Función para iniciar la grabación
    const startRecording = () => {
        if (!stream) return;

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

        // Detener la grabación después de 10 segundos
        setTimeout(() => {
            recorder.stop();
            setRecording(false);
        }, 10000);

        mediaRecorderRef.current = recorder;
    };

    // Función para eliminar la grabación
    const deleteRecording = () => {
        setVideoUrl(null);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-md">
            {/* Botón para activar/desactivar la cámara */}
            {!isCameraOn ? (
                <button
                    onClick={() => setIsCameraOn(true)}
                    className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                    Encender Cámara
                </button>
            ) : (
                <>
                    {/* Video (se oculta si la cámara está apagada) */}
                    <video ref={videoRef} autoPlay className="w-full h-64 bg-black rounded-lg" />

                    {/* Contenedor de botones */}
                    <div className="flex gap-4">
                        {/* Botón de grabación */}
                        {!videoUrl && (
                            <button
                                onClick={recording ? undefined : startRecording}
                                className={`px-4 py-2 text-white rounded-lg ${
                                    recording || !isCameraOn
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-500 hover:bg-blue-600"
                                }`}
                                disabled={recording || !isCameraOn}
                            >
                                {recording ? "Grabando..." : "Iniciar Grabación"}
                            </button>
                        )}

                        {/* Botón para apagar la cámara */}
                        <button
                            onClick={() => setIsCameraOn(false)}
                            className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                        >
                            Apagar Cámara
                        </button>
                    </div>
                </>
            )}

            {/* Mostrar video grabado */}
            {videoUrl && (
                <div className="flex flex-col items-center gap-2">
                    <video src={videoUrl} controls className="w-full h-64 bg-black rounded-lg" />
                    <div className="flex gap-4">
                        <button
                            onClick={() => alert("Video guardado en la ruta específica")}
                            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                        >
                            Aceptar
                        </button>
                        <button
                            onClick={deleteRecording}
                            className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CameraRecorder;
