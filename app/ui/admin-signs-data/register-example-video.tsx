'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { Button } from '@/app/ui/button';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

export default function RegisterExampleVideoForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const typeId = formData.get('typeId') as string;
    const meaning = formData.get('meaning') as string;
    const reference = formData.get('reference') as string; // Nuevo campo
    const file = formData.get('videoExamplePath') as File;

    if (!file) {
      setErrorMessage('Por favor selecciona un archivo de video.');
      setIsPending(false);
      return;
    }

    try {
      // Subir el archivo al Storage
      const storage = getStorage();
      const storageRef = ref(storage, `video_examples/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      //console.log('✅ Archivo subido correctamente:', downloadURL);

      // Guardar los datos en Firestore
      const videoExampleCollection = collection(db, 'video_example');
      await addDoc(videoExampleCollection, {
        name,
        type: typeId === '1' ? 'Caracter' : typeId === '2' ? 'Palabra' : 'Frases',
        meaning,
        reference, // Guardar el nuevo campo
        videoPath: downloadURL,
        status: 'activo', // Estado inicial
        createdAt: new Date(),
      });

      console.log('✅ Datos guardados correctamente en Firestore.');
      setIsPending(false);
      router.push('/profile/admin-signs-data');
    } catch (error) {
      console.error('🚨 Error al registrar el video de ejemplo:', error);
      setErrorMessage('Error al registrar el video de ejemplo.');
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Nombre del seña
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="meaning" className="text-sm font-medium text-gray-700">
          Significado del seña
        </label>
        <input
          id="meaning"
          name="meaning"
          type="text"
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
          placeholder="https://ejemplo.com"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="videoExamplePath" className="text-sm font-medium text-gray-700">
          Seleccionar video de ejemplo (.mp4)
        </label>
        <input
          id="videoExamplePath"
          name="videoExamplePath"
          type="file"
          accept="video/mp4"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="typeId" className="text-sm font-medium text-gray-700">
          Tipo de seña
        </label>
        <select
          id="typeId"
          name="typeId"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="1">Caracter</option>
          <option value="2">Palabra</option>
          <option value="3">Frases</option>
        </select>
      </div>
      {errorMessage && (
        <div className="text-red-600 text-sm">
          <ExclamationCircleIcon className="h-5 w-5 inline" /> {errorMessage}
        </div>
      )}
      <div>
        <Button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isPending}
        >
          {isPending ? 'Enviando...' : 'Crear Video'}
          <ArrowRightIcon className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </form>
  );
}