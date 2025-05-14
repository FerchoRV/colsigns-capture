'use client';

import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/firebaseConfig';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Cerrar sesión con Firebase
      console.log('✅ Sesión cerrada correctamente');
      router.push('/login'); // Redirigir al usuario a la página de inicio de sesión
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold text-red-600">Acceso denegado</h1>
      <p className="text-gray-700 mt-2">No tienes permiso para acceder a esta página.</p>
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Cerrar sesión
      </button>
    </div>
  );
}