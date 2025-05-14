'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { checkAdminRole } from 'hooks/authUtils';

const UserSearchAndUpdate: React.FC = () => {
  const [email, setEmail] = useState('');
  const [userData, setUserData] = useState<{ firstName: string; lastName: string; roleId: number; id?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      const admin = await checkAdminRole();
      setIsAdmin(admin);
      if (!admin) {
        setErrorMessage('No tienes permisos para acceder a esta funcionalidad.');
      }
    };

    verifyAdmin();
  }, []);

  const handleSearch = async () => {
    if (!isAdmin) {
      setErrorMessage('No tienes permisos para realizar esta acción.');
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setUserData({
          ...userDoc.data(),
          id: userDoc.id, // Guarda el UID del documento
        } as { firstName: string; lastName: string; roleId: number; id: string });
      } else {
        setErrorMessage('Usuario no encontrado.');
        setUserData(null);
      }
    } catch (error) {
      console.error('Error buscando usuario:', error);
      setErrorMessage('Error buscando usuario.');
    } finally {
      setIsPending(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!isAdmin) {
      setErrorMessage('No tienes permisos para realizar esta acción.');
      return;
    }

    if (!userData || !userData.id) return;

    setIsPending(true);
    setErrorMessage(null);

    try {
      const userDocRef = doc(db, 'users', userData.id);
      await updateDoc(userDocRef, { roleId: userData.roleId });

      console.log('RoleID actualizado correctamente.');
      setErrorMessage('Rol actualizado correctamente.');
    } catch (error) {
      console.error('Error actualizando roleID:', error);
      setErrorMessage('Error actualizando roleID.');
    } finally {
      setIsPending(false);
    }
  };

  if (!isAdmin) {
    return <p className="text-red-600 text-sm">{errorMessage}</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Buscar usuario por correo electrónico
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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

      {userData && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Nombre: {userData.firstName}</p>
            <p className="text-sm font-medium text-gray-700">Apellido: {userData.lastName}</p>
            <p className="text-sm font-medium text-gray-700">
              Rol actual: {userData.roleId === parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1)
                ? 'Administrador'
                : userData.roleId === parseInt(process.env.NEXT_PUBLIC_APP_ROLE_2)
                ? 'Colaborador'
                : userData.roleId === parseInt(process.env.NEXT_PUBLIC_APP_ROLE_3)
                ? 'Bloqueado'
                : 'Desconocido'}
            </p>
          </div>

          <div>
            <label htmlFor="roleID" className="block text-sm font-medium text-gray-700">
              Actualizar Rol
            </label>
            <select
              id="roleID"
              value={userData.roleId}
              onChange={(e) =>
                setUserData((prev) => (prev ? { ...prev, roleId: parseInt(e.target.value) } : null))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value={parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1)}>Administrador</option>
              <option value={parseInt(process.env.NEXT_PUBLIC_APP_ROLE_2)}>Colaborador</option>
              <option value={parseInt(process.env.NEXT_PUBLIC_APP_ROLE_3)}>Bloquear</option>
            </select>
          </div>

          <button
            onClick={handleUpdateRole}
            disabled={isPending}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {isPending ? 'Actualizando...' : 'Actualizar Rol'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserSearchAndUpdate;