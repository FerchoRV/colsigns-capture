'use client';

import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

// Define la interfaz para los datos del video
interface VideoData {
  id: string;
  name: string;
  type: string;
  meaning: string;
  reference: string;
  status: string;
  videoPath: string;
}

export default function SearchExampleVideo() {
  const [searchTerm, setSearchTerm] = useState('');
  const [videoData, setVideoData] = useState<VideoData | null>(null); // Cambiado de `any | null` a `VideoData | null`
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setErrorMessage('Por favor ingresa un nombre para buscar.');
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      const videoExampleCollection = collection(db, 'video_example');
      const q = query(videoExampleCollection, where('name', '==', searchTerm));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const videoDoc = querySnapshot.docs[0];
        setVideoData({
          id: videoDoc.id,
          ...videoDoc.data(),
        } as VideoData); // Asegúrate de que los datos coincidan con la interfaz
      } else {
        setErrorMessage('No se encontró ningún video con ese nombre.');
        setVideoData(null);
      }
    } catch (error) {
      console.error('Error buscando el video:', error);
      setErrorMessage('Error buscando el video.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Buscar Video de Ejemplo</h1>
      <div className="space-y-2">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700">
          Nombre del video
        </label>
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ingresa el nombre del video"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <button
          onClick={handleSearch}
          disabled={isPending}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isPending ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}

      {videoData && (
        <div className="space-y-4 border p-4 rounded-md shadow-sm">
          <h2 className="text-lg font-medium">Información del Video</h2>
          <p><strong>Nombre:</strong> {videoData.name}</p>
          <p><strong>Tipo:</strong> {videoData.type}</p>
          <p><strong>Significado:</strong> {videoData.meaning}</p>
          <p><strong>Fuente:</strong> <a href={videoData.reference} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{videoData.reference}</a></p>
          <p><strong>Estado:</strong> {videoData.status}</p>
          <video controls className="mt-2 w-full">
            <source src={videoData.videoPath} type="video/mp4" />
            Tu navegador no soporta la reproducción de videos.
          </video>
        </div>
      )}
    </div>
  );
}