'use client';

import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterExampleVideoForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);

    console.log("📤 Enviando datos para crear video de ejemplo:", formData);  // ✅ Log para depuración

    try {
      const res = await fetch('/api/manage_example_videos/create', {
        method: 'POST',
        body: formData,
      });

      console.log("📥 Respuesta del servidor:", res);  // ✅ Log para verificar estado HTTP

      setIsPending(false);

      if (res.ok) {
        const data = await res.json();
        console.log("✅ Video de ejemplo creado correctamente:", data);
        router.push('/profile/admin-signs-data');
      } else {
        const errorData = await res.json();
        console.error("❌ Error en el servidor:", errorData);
        setErrorMessage(errorData.error || 'Error al crear video de ejemplo');
      }
    } catch (error) {
      console.error("🚨 Error en el fetch:", error);
      setErrorMessage("Error de conexión con el servidor.");
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Nombre del signo
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
          Tipo de video
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
      <div>
      {/*<Link
                href="/profile/admin-signs-data/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
            <span>Volver</span> <ArrowLeftIcon className="h-5 w-5 ml-2" />
        </Link>*/}
      </div>
    </form>
  );
}