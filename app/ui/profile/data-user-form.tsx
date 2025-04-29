'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebaseConfig';

export default function RegisterDataUserForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const levelId = formData.get('typeId') as string;

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener el valor predeterminado del rol desde la variable de entorno
      const roleId = process.env.NEXT_PUBLIC_APP_ROLE;

      // Guardar información adicional en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        levelId: parseInt(levelId, 10), // Convertir a número si es necesario
        email: user.email,
        roleId: parseInt(roleId, 10), // Guardar el rol predeterminado
        createdAt: new Date(),
      });

      console.log('✅ Datos creados correctamente en Firestore.');
      router.push('/profile');
    } catch (error: unknown) {
      console.error('❌ Error guardando datos en Firestore:', error);
      setErrorMessage((error as Error).message || 'Error guardando datos en Firestore.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
          Apellidos
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="typeId" className="text-sm font-medium text-gray-700">
          Nivel en manejo de signos colombianos
        </label>
        <select
          id="typeId"
          name="typeId"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="1">Experto</option>
          <option value="2">Intermedio</option>
          <option value="3">Novato</option>
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
          {isPending ? 'Enviando...' : 'Enviar Datos'}
        </Button>
      </div>
    </form>
  );
}
