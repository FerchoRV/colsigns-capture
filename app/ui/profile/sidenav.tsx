"use client";

import Link from 'next/link';
import NavLinksUser from '@/app/ui/profile/nav-links-user';
import NavLinksAdmin from './nav-links-admin';
import ColsingLogo from '@/app/ui/colsing-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/firebase/firebaseConfig';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SideNav() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; roleId?} | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            //console.log("Datos del usuario obtenidos de Firestore:", userData);

            // Asegúrate de que roleId sea un número
            const roleId = userData.roleId ? parseInt(userData.roleId, 10) : undefined;

            setUser({
              id: firebaseUser.uid,
              roleId,
            });
          } else {
            console.warn('⚠️ No se encontraron datos del usuario en Firestore.');
            setUser(null);
          }
        } catch (error) {
          console.error('❌ Error obteniendo datos del usuario:', error);
          setUser(null);
        }
      } else {
        console.log('🔴 Usuario no autenticado. Redirigiendo a /login...');
        router.replace('/login'); // Redirige si no está autenticado
      }
    });

    return () => unsubscribe(); // Limpia el listener al desmontar el componente
  }, [router]);

  const logout = async () => {
    try {
      await auth.signOut();
      console.log('✅ Sesión cerrada correctamente');
      router.replace('/login');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          <ColsingLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinksUser />
        {user?.roleId === parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1) && <NavLinksAdmin />}
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>

        {user && (
          <button
            onClick={logout}
            className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        )}
      </div>
    </div>
  );
}

