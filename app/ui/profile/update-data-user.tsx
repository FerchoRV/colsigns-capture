'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebaseConfig';

interface UserData {
  firstName: string;
  lastName: string;
  levelId: number;
}

export default function UpdateDataUserForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null); // Especifica el tipo de userData
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Usuario no autenticado');

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data() as UserData; // Especifica el tipo de los datos obtenidos
          setUserData(data);
        } else {
          console.warn('⚠️ No se encontraron datos del usuario en Firestore.');
        }
      } catch (error) {
        console.error('❌ Error obteniendo datos del usuario:', error);
        setErrorMessage('Error al cargar los datos del usuario.');
      }
    };

    fetchUserData();
  }, []);

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

      // Actualizar información del usuario en Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        firstName,
        lastName,
        levelId: parseInt(levelId, 10), // Convertir a número si es necesario
      });

      console.log('✅ Datos actualizados correctamente en Firestore.');
      router.push('/profile'); // Redirigir al perfil después de actualizar
    } catch (error: unknown) {
      console.error('❌ Error actualizando datos en Firestore:', error);
      setErrorMessage((error as Error).message || 'Error actualizando datos en Firestore.');
    } finally {
      setIsPending(false);
    }
  };

  if (!userData) {
    return <p>Cargando datos del usuario...</p>;
  }

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
          defaultValue={userData.firstName || ''}
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
          defaultValue={userData.lastName || ''}
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
          defaultValue={userData.levelId.toString() || '1'}
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
          {isPending ? 'Actualizando...' : 'Actualizar Datos'}
        </Button>
      </div>
    </form>
  );
}
