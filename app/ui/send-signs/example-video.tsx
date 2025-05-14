"use client";

import React, { useState } from "react";

interface ExampleVideoProps {
    name: string; // Nombre del signo
    meaning: string; // Significado del signo
    videoPath: string; // URL del video
    reference: string; // Enlace a más información
}

const ExampleVideo: React.FC<ExampleVideoProps> = ({ name, meaning, videoPath, reference }) => {
    const [showVideo, setShowVideo] = useState(false);

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-md w-full">
            {/* Información del signo */}
            <h3 className="text-lg font-bold">Nombre Signo: {name}</h3>
            <p className="text-sm text-gray-700">Significado: {meaning}</p>

            {/* Enlace a más información */}
            <a
                href={reference}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline text-sm"
            >
                Más información
            </a>

            {/* Video aparece arriba del botón */}
            {showVideo && (
                <video controls className="w-full h-64 bg-black rounded-lg">
                    <source src={videoPath} type="video/mp4" />
                    Tu navegador no soporta la reproducción de videos.
                </video>
            )}

            {/* Botón dinámico: Ver Ejemplo / Cerrar Video */}
            <button
                onClick={() => setShowVideo(!showVideo)}
                className={`px-4 py-2 text-white rounded-lg transition-all ${
                    showVideo ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
                {showVideo ? "Cerrar Video" : "Ver Ejemplo"}
            </button>
        </div>
    );
};

export default ExampleVideo;
