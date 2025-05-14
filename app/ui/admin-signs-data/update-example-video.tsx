'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { Button } from '@/app/ui/button';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

export default function UpdateExampleVideoForm() {
  const [searchName, setSearchName] = useState(''); // Campo para buscar por nombre
  const [videoId, setVideoId] = useState<string | null>(null); // ID del documento encontrado
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState('1');
  const [meaning, setMeaning] = useState('');
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState('activo');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  // Buscar el documento por nombre
  const handleSearch = async () => {
    if (!searchName.trim()) {
      setErrorMessage('Por favor ingresa un nombre para buscar.');
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      const videoExampleCollection = collection(db, 'video_example');
      const q = query(videoExampleCollection, where('name', '==', searchName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const videoDoc = querySnapshot.docs[0];
        setVideoId(videoDoc.id); // Guardar el ID del documento
        const videoData = videoDoc.data();
        setName(videoData.name || '');
        setTypeId(
          videoData.type === 'Caracter' ? '1' : videoData.type === 'Palabra' ? '2' : '3'
        );
        setMeaning(videoData.meaning || '');
        setReference(videoData.reference || '');
        setStatus(videoData.status || 'activo');
      } else {
        setErrorMessage('No se encontró ningún video con ese nombre.');
        setVideoId(null);
      }
    } catch (error) {
      console.error('Error buscando el video:', error);
      setErrorMessage('Error buscando el video.');
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!videoId) {
      setErrorMessage('No se ha seleccionado un video para actualizar.');
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      const videoDocRef = doc(db, 'video_example', videoId);

      // Actualizar los datos en Firestore
      await updateDoc(videoDocRef, {
        name,
        type: typeId === '1' ? 'Caracter' : typeId === '2' ? 'Palabra' : 'Frases',
        meaning,
        reference,
        status,
        updatedAt: new Date(), // Fecha de actualización
      });

      console.log('✅ Datos actualizados correctamente en Firestore.');
      setIsPending(false);
      router.push('/profile/admin-signs-data'); // Redirigir después de la actualización
    } catch (error) {
      console.error('🚨 Error al actualizar el video de ejemplo:', error);
      setErrorMessage('Error al actualizar el video de ejemplo.');
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Actualizar Video de Ejemplo</h1>
      <div className="space-y-2">
        <label htmlFor="searchName" className="block text-sm font-medium text-gray-700">
          Buscar por nombre del signo
        </label>
        <input
          id="searchName"
          type="text"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          placeholder="Ingresa el nombre del signo"
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

      {videoId && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nombre del signo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="meaning" className="text-sm font-medium text-gray-700">
              Significado del signo
            </label>
            <input
              id="meaning"
              name="meaning"
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="reference" className="text-sm font-medium text-gray-700">
              Fuente del ejemplo (URL)
            </label>
            <input
              id="reference"
              name="reference"
              type="url"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="https://ejemplo.com"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="typeId" className="text-sm font-medium text-gray-700">
              Tipo de signo
            </label>
            <select
              id="typeId"
              name="typeId"
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="1">Caracter</option>
              <option value="2">Palabra</option>
              <option value="3">Frases</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="activo">Activo</option>
              <option value="pausa">Pausa</option>
              <option value="completo">Completo</option>
            </select>
          </div>
          <div>
            <Button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isPending}
            >
              {isPending ? 'Actualizando...' : 'Actualizar Video'}
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}