'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig'; // Asegúrate de que esta ruta sea correcta

// Define la interfaz para los resultados del video
interface VideoResult {
  name: string; // La palabra o letra del signo
  url: string;  // La URL del video
  type: string; // Para identificar si es Caracter, Palabra, Frase, Separator, NotFound
  originalInput: string; // Para saber a qué parte del input original pertenece
}

const VisualizeSignComponent: React.FC = () => {
  const [inputWord, setInputWord] = useState('');
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Nuevo estado para controlar el índice del video que se está reproduciendo
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  // Referencia al elemento <video> para controlarlo programáticamente
  const videoRef = useRef<HTMLVideoElement>(null);

    // Función que se llama cuando el video actual termina
  const handleVideoEnded = useCallback(() => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(prevIndex => prevIndex + 1);
    } else {
      // Todos los videos han terminado
      // Puedes resetear o mostrar un mensaje de "reproducción completada"
      console.log("Reproducción de la secuencia completada.");
      // setCurrentVideoIndex(0); // Opcional: para volver al inicio
    }
  }, [currentVideoIndex, videos.length]); // ¡Aquí está la clave!

  // Efecto para controlar la reproducción automática del siguiente video
  useEffect(() => {
    if (videoRef.current && videos.length > 0 && currentVideoIndex < videos.length) {
      const currentVideo = videos[currentVideoIndex];
      if (currentVideo.url) { // Solo si tiene una URL válida (no Separator/NotFound)
        videoRef.current.src = currentVideo.url;
        videoRef.current.load(); // Carga el nuevo video
        videoRef.current.play().catch(e => console.error("Error al intentar reproducir video:", e)); // Intenta reproducir
      } else {
        // Si es un Separador o NotFound, "avanza" después de un breve delay para simular pausa
        const timeoutDuration = currentVideo.type === 'Separator' ? 1000 : 500; // 1s para espacio, 0.5s para no encontrado
        setTimeout(() => {
          handleVideoEnded();
        }, timeoutDuration);
      }
    }
  }, [currentVideoIndex, videos, handleVideoEnded]); // Se ejecuta cuando el índice o la lista de videos cambia

  // Función para obtener un signo específico de Firestore
  const fetchSign = async (name: string, type?: string) => {
    const videoExampleRef = collection(db, 'video_example');
    let q;

    if (type) {
      q = query(videoExampleRef, where('name', '==', name), where('type', '==', type));
    } else {
      q = query(videoExampleRef, where('name', '==', name));
    }

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0].data() as { name: string; videoPath: string; type: string };
      return {
        name: docData.name,
        url: docData.videoPath,
        type: docData.type,
        originalInput: name
      } as VideoResult;
    }
    return null;
  };

  const handleSearch = async () => {
    setError('');
    setVideos([]);
    setCurrentVideoIndex(0); // Reinicia el índice al iniciar una nueva búsqueda
    setIsLoading(true);

    const cleanedInput = inputWord.replace(/\s+/g, ' ').trim();
    if (cleanedInput.length === 0) {
      setError('Por favor, ingresa un mensaje.');
      setIsLoading(false);
      return;
    }
    if (cleanedInput.length > 100) {
      setError('El mensaje no puede exceder los 100 caracteres.');
      setIsLoading(false);
      return;
    }
    const allowedCharsRegex = /^[a-zA-Z\s,]+$/;
    if (!allowedCharsRegex.test(cleanedInput)) {
        setError('El mensaje solo puede contener letras, espacios y comas.');
        setIsLoading(false);
        return;
    }

    const parts = cleanedInput.split(',').map(part => part.trim()).filter(part => part.length > 0);
    const allVideoResults: VideoResult[] = [];

    for (const part of parts) {
      if (part.length === 0) continue;

      const exactSign = await fetchSign(part);

      if (exactSign && (exactSign.type === 'Palabra' || exactSign.type === 'Frases')) {
        allVideoResults.push({ ...exactSign, originalInput: part });
      } else {
        const letters = part.split('');
        for (const letter of letters) {
          if (letter === ' ') {
            allVideoResults.push({ name: 'Espacio', url: '', type: 'Separator', originalInput: ' ' });
            continue;
          }

          const charSign = await fetchSign(letter.toLowerCase(), 'Caracter');

          if (charSign) {
            allVideoResults.push({ ...charSign, originalInput: letter });
          } else {
            console.warn(`No se encontró seña para la letra: ${letter}`);
            allVideoResults.push({ name: `${letter.toUpperCase()} (No encontrado)`, url: '', type: 'NotFound', originalInput: letter });
          }
        }
      }
    }

    setVideos(allVideoResults);
    setIsLoading(false);
  };

  const handlePlaySequence = () => {
    if (videos.length > 0) {
      setCurrentVideoIndex(0); // Iniciar desde el primer video
      if (videoRef.current) {
        // Asegurarse de que el video se cargue y se reproduzca
        const firstVideo = videos[0];
        if (firstVideo.url) {
          videoRef.current.src = firstVideo.url;
          videoRef.current.load();
          videoRef.current.play().catch(e => console.error("Error al iniciar la reproducción:", e));
        } else {
          // Si el primer elemento es un separador o no encontrado, simular un delay
          const timeoutDuration = firstVideo.type === 'Separator' ? 1000 : 500;
          setTimeout(() => {
            handleVideoEnded();
          }, timeoutDuration);
        }
      }
    }
  };

  const handlePrevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(prevIndex => prevIndex + 1);
    }
  };

  // Obtener el video actual para mostrar en el reproductor y en la etiqueta
  const currentVideoToDisplay = videos[currentVideoIndex];

  return (
    <main className="p-4 md:p-8 bg-gray-50 rounded-lg shadow-xl max-w-4xl mx-auto my-8">
      <h1 className="text-3xl font-extrabold text-blue-500 mb-6 text-center">Texto a Señas</h1>

      <div className="flex flex-col items-center gap-4">
        {/* Input para ingresar el mensaje */}
        <textarea
          value={inputWord}
          onChange={(e) => setInputWord(e.target.value)}
          placeholder="Ingresa tu mensaje (máximo 100 caracteres), puedes usar comas para separar palabras o frases. Ejemplo: Hola,Como estas,diego"
          rows={4}
          className="px-4 py-2 border rounded-md w-full max-w-xl resize-y focus:ring-blue-500 focus:border-blue-500"
          maxLength={100}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Botón para realizar la búsqueda */}
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className={`
            px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out
            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md'}
          `}
        >
          {isLoading ? 'Generando señas...' : 'Generar Señas'}
        </button>

        {isLoading && <p className="text-blue-600 animate-pulse">Buscando y organizando señas...</p>}

        {/* Sección del Reproductor de Video Unificado */}
        {videos.length > 0 && !isLoading && (
          <div className="w-full max-w-xl bg-white border rounded-lg shadow-lg p-4 mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Reproducción de Señas: {currentVideoToDisplay?.name}
              {currentVideoToDisplay?.type && currentVideoToDisplay.type !== 'Caracter' && currentVideoToDisplay.type !== 'Separator' && currentVideoToDisplay.type !== 'NotFound' && (
                <span className="text-gray-500 text-sm ml-1">({currentVideoToDisplay.type})</span>
              )}
            </h2>

            <div className="flex flex-col items-center gap-4">
                <video
                    ref={videoRef}
                    controls
                    className="w-full h-auto rounded-md mb-4 aspect-video bg-black"
                    onEnded={handleVideoEnded} // Llama a la función cuando el video termina
                >
                    Su navegador no soporta el elemento de video.
                </video>

                {/* Controles de reproducción */}
                <div className="flex justify-center gap-4 mb-4">
                    <button
                        onClick={handlePrevVideo}
                        disabled={currentVideoIndex === 0}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={handlePlaySequence}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Reproducir Secuencia
                    </button>
                    <button
                        onClick={handleNextVideo}
                        disabled={currentVideoIndex === videos.length - 1}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Siguiente
                    </button>
                </div>
                <p className="text-center text-sm text-gray-600">
                    Video {currentVideoIndex + 1} de {videos.length}
                </p>
                {currentVideoToDisplay?.type === 'NotFound' && (
                    <p className="text-red-600 text-sm text-center mt-2">
                        No se encontró un video para &quot;{currentVideoToDisplay.originalInput}&quot;
                    </p>
                )}
                {currentVideoToDisplay?.type === 'Separator' && (
                    <p className="text-gray-500 text-sm text-center mt-2 italic">
                        — ESPACIO DE PAUSA —
                    </p>
                )}
            </div>
          </div>
        )}

        {/* Mensaje si no hay videos después de la búsqueda */}
        {videos.length === 0 && !isLoading && inputWord.length > 0 && (
          <p className="col-span-full text-center text-gray-500 mt-4">
            No se encontraron señas para tu mensaje o palabra. Intenta con otra.
          </p>
        )}
      </div>
    </main>
  );
};

export default VisualizeSignComponent;