'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebaseConfig';

interface User {
  uid: string;
  email: string;
  roleId: number;
}
export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: number[];
}) {
  const [user, setUser] = useState<User>(null); // Estado para almacenar los datos del usuario
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obtener los datos adicionales del usuario desde Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Convertir roleId a número si es necesario
            const roleId = parseInt(userData.roleId, 10); // Asegurarse de que sea un número
            setUser({ ...userData, roleId, uid: firebaseUser.uid, email: firebaseUser.email || '' }); // Combinar datos de Firestore con el UID y agregar email
          } else {
            console.error('❌ El documento del usuario no existe en Firestore.');
            setUser(null);
          }
        } catch (error) {
          console.error('❌ Error obteniendo datos del usuario:', error);
          setUser(null);
        }
      } else {
        setUser(null); // Usuario no autenticado
      }
      setIsLoading(false); // Finalizar la carga
    });

    return () => unsubscribe(); // Limpiar el listener al desmontar el componente
  }, []);

  useEffect(() => {
    if (isLoading) return; // No hacer nada mientras se carga

    if (!user) {
      console.log('🔴 Usuario no autenticado. Redirigiendo a /login...');
      router.push('/login'); // Redirigir a la página de inicio de sesión si no está autenticado
    } else if (!allowedRoles.includes(user.roleId)) {
      console.log(
        `🔴 Acceso denegado a ${user.email} con roleId: ${user.roleId}. Redirigiendo a /unauthorized...`
      );
      router.push('/unauthorized'); // Redirigir si el rol no está permitido
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading) {
    return <div>Cargando...</div>; // Mostrar un mensaje de carga mientras se obtienen los datos
  }

  if (!user || !allowedRoles.includes(user.roleId)) {
    return null; // No renderizar nada mientras redirige
  }

  return <>{children}</>;
}

