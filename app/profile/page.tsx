"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseConfig';

interface UserData{
  firstName: string;
  lastName: string;
  levelId: number;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [user] = useState<{ username: string; id: string; roleId?: number; email?: string } | null>(null);
  const [userData, setUserData] = useState<UserData>(null);
  const [loading] = useState(true);

  // Memoizar allowedRoles para evitar que cambie en cada render
  const allowedRoles = useMemo(() => [1, 2], []);

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
  
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("Datos del usuario obtenidos de Firestore:", userData);
            if (userData && userData.firstName && userData.lastName && userData.levelId) {
              setUserData(userData as UserData); // Cast to UserData after validation
            } else {
              console.warn('⚠️ Datos del usuario incompletos en Firestore.');
              setUserData(null);
            }
          } else {
            console.warn('⚠️ No se encontraron datos del usuario en Firestore.');
            setUserData(null);
          }
        } catch (error) {
          console.error('❌ Error obteniendo datos del usuario:', error);
          setUserData(null);
        }
      } else {
        console.log('🔴 Usuario no autenticado. Redirigiendo a /login...');
        router.replace('/login'); // Redirige si no está autenticado
      }
    });
  
    return () => unsubscribe(); // Limpia el listener al desmontar el componente
  }, [router]);

  useEffect(() => {
    if (loading) return ; // No hacer nada mientras se carga
  
    if (!user) {
      console.log('🔴 Usuario no autenticado. Redirigiendo a /login...');
      router.push('/login'); // Redirigir a la página de inicio de sesión si no está autenticado
    } else {
      console.log("✅ Usuario autenticado:", user);
      console.log("🔍 Validando roleId:", user.roleId);
  
      if (!allowedRoles.includes(user.roleId)) {
        console.log(
          `🔴 Acceso denegado a ${user.email} con roleId: ${user.roleId}. Redirigiendo a /unauthorized...`
        );
        router.push('/unauthorized'); // Redirigir si el rol no está permitido
      }
    }
  }, [user, loading, allowedRoles, router]);

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex min-h-screen flex-col p-6 max-w-3xl">
      
        {userData === null ? (
          <div>
            <p>No se encontró datos de usuario. Por favor, envia tu información para continuar, esto es de gran ayuda para esta investigacion, ademas de lo contrario tus videos no se tendran en cuenta gracias.</p>
            <Link
              href="/profile/data-user/create"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span>Enviar infromacion</span>
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        ) : (
          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Datos</h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.firstName}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Apellido</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.lastName}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Nivel de Manejo de Signos</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userData.levelId === 1 ? "Experto" : userData.levelId === 2 ? "Intermedio" : "Novato"}
                    </dd>
                  </div>
                </dl>
                <div>
                <Link
              href="/profile/data-user/update"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span>Actualizar información</span>
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
            </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;


