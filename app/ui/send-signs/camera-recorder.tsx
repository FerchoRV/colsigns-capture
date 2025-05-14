"use client";

import React, { useRef, useState, useCallback } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid"; // Para generar un identificador único

interface CameraRecorderProps {
    name: string; // Nombre del signo
    idSign: string; // ID del signo del video de ejemplo
    idUser: string; // ID del usuario que envía el video
    levelId: string; // Nivel del usuario que envía el video
    type: string; // Tipo del video de ejemplo
    onStream?: (stream: MediaStream) => void;
}

const CameraRecorder: React.FC<CameraRecorderProps> = ({ name, idSign, idUser, levelId, type }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [recording, setRecording] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Función para iniciar la cámara
    const startCamera = useCallback(async () => {
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            setStream(userStream);
            if (videoRef.current) {
                videoRef.current.srcObject = userStream;
            }
        } catch (error) {
            console.error("Error al acceder a la cámara:", error);
        }
    }, []);

    // Función para detener la cámara
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    }, [stream]);

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

        // Detener la grabación después de 5 segundos
        setTimeout(() => {
            recorder.stop();
            setRecording(false);
        }, 5000);

        mediaRecorderRef.current = recorder;
    };

    // Función para eliminar la grabación
    const deleteRecording = () => {
        setVideoUrl(null);
    };

    // Función para subir el video al Storage y registrar en Firestore
    const handleAccept = async () => {
        if (!videoUrl) return;

        setIsUploading(true);

        try {
            // Crear un blob a partir de la URL del video
            const response = await fetch(videoUrl);
            const blob = await response.blob();

            // Subir el video al Storage
            const storage = getStorage();
            const uniqueCode = uuidv4(); // Generar un identificador único
            const fileName = `${name}_${uniqueCode}.mp4`;
            const storageRef = ref(storage, `${name}/${fileName}`);
            const snapshot = await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(snapshot.ref);

            console.log("✅ Video subido correctamente:", downloadURL);

            // Registrar la información en Firestore
            const signDataCollection = collection(db, "sign_data");
            await addDoc(signDataCollection, {
                label: name,
                id_sign: idSign,
                id_user: idUser,
                nivel_user: levelId,
                type,
                videoPath: downloadURL,
                status_verified: false, // Estado por defecto: false
                createdAt: new Date(),
            });

            console.log("✅ Información registrada correctamente en Firestore.");
            alert("Video enviado correctamente.");
            setVideoUrl(null); // Limpiar el video grabado
        } catch (error) {
            console.error("🚨 Error al subir el video o registrar la información:", error);
            alert("Error al enviar el video.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-md">
            {/* Botón para activar/desactivar la cámara */}
            {!isCameraOn ? (
                <button
                    onClick={() => {
                        setIsCameraOn(true);
                        startCamera();
                    }}
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
                            onClick={() => {
                                setIsCameraOn(false);
                                stopCamera();
                            }}
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
                            onClick={handleAccept}
                            disabled={isUploading}
                            className={`px-4 py-2 text-white rounded-lg ${
                                isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                            }`}
                        >
                            {isUploading ? "Subiendo..." : "Aceptar"}
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
