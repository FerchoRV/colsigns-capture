'use client';

import React, { useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

const VisualizeAlphabetComponent: React.FC = () => {
  const [inputWord, setInputWord] = useState('');
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');

  const validateWord = (word: string) => {
    const regex = /^[a-zA-Z]{1,20}$/; // Solo letras, sin espacios ni caracteres especiales, máximo 20 caracteres
    return regex.test(word);
  };

  const handleSearch = async () => {
    setError('');
    setVideos([]);

    // Validar la palabra ingresada
    if (!validateWord(inputWord)) {
      setError('La palabra debe tener máximo 20 caracteres, sin espacios ni caracteres especiales.');
      return;
    }

    // Normalizar la palabra a minúsculas y descomponerla en caracteres
    const normalizedWord = inputWord.toLowerCase();
    const letters = normalizedWord.split('');

    try {
      const videoResults = [];

      // Consultar la colección `video_example` para cada letra
      for (const letter of letters) {
        const videoExampleRef = collection(db, 'video_example');
        const q = query(videoExampleRef, where('name', '==', letter));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          videoResults.push({
            name: doc.data().name,
            url: doc.data().videoPath,
          });
        });
      }

      // Actualizar el estado con los resultados
      setVideos(videoResults);
    } catch (error) {
      console.error('Error al consultar la colección:', error);
      setError('Hubo un problema al realizar la consulta.');
    }
  };

  return (
    <main>
      <div className="flex flex-col items-center gap-4 p-4">
        {/* Input para ingresar la palabra */}
        <input
          type="text"
          value={inputWord}
          onChange={(e) => setInputWord(e.target.value)}
          placeholder="Ingresa una palabra"
          className="px-4 py-2 border rounded-md w-full max-w-md"
        />
        {error && <p className="text-red-500">{error}</p>}

        {/* Botón para realizar la búsqueda */}
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Ver señas
        </button>

        {/* Mostrar los resultados en tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {videos.map((video, index) => (
            <div key={index} className="border rounded-md p-4 shadow-md">
              <video src={video.url} controls className="w-full h-auto rounded-md" />
              <p className="mt-2 text-center font-medium">{video.name}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default VisualizeAlphabetComponent;