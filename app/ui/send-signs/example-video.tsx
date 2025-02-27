"use client";

import React, { useState } from "react";

const ExampleVideo: React.FC = () => {
    const [showVideo, setShowVideo] = useState(false);

    // Ruta del video en el servidor
    const videoSrc = "/example-videos/hola.mp4";

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-md w-full">
            {/* Video aparece arriba del botón */}
            {showVideo && (
                <video controls className="w-full h-64 bg-black rounded-lg">
                    <source src={videoSrc} type="video/mp4" />
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
