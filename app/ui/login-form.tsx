'use client';

import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth';
import { doc, setDoc, getDoc, DocumentData } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebaseConfig';

export default function LoginForm() {
  //const searchParams = useSearchParams();
  //const callbackUrl = decodeURIComponent(searchParams.get('callbackUrl') || '/profile');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsPending(true);
    setErrorMessage(null);

    try {
      // 🔹 Iniciar sesión con Google
      const provider = new GoogleAuthProvider();
      const userCredential: UserCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      console.log("Usuario autenticado con Google:", user);

      // 🔹 Verificar si es la primera vez que inicia sesión
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc: DocumentData = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Si no existe el documento del usuario, guardar información básica y redirigir a registro
        await setDoc(userDocRef, {
          email: user.email,
          name: user.displayName,
          createdAt: new Date(),
        });
        console.log("Primera vez que inicia sesión con Google. Redirigiendo a /register...");
        router.push('/register');
      } else {
        // Si ya existe, redirigir a la URL de callback
        console.log("Usuario existente. Redirigiendo a su perfil");
        router.push('/profile');
      }
    } catch (error: unknown) {
      console.error("Error en inicio de sesión con Google:", error);
      setErrorMessage((error as Error).message || 'Error en inicio de sesión con Google');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className= "mb-3 text-2xl">
          Por favor inicia sesión para continuar.
        </h1>

        {/* 🔹 Mensaje indicando que solo se permite iniciar sesión con Google */}
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
          <ExclamationCircleIcon className="inline h-5 w-5 mr-2" />
          Solo puedes iniciar sesión con Google.
        </div>

        {/* 🔹 Botón para iniciar sesión con Google */}
        <Button
          type="button"
          className="mt-4 w-full bg-blue-500 hover:bg-blue-400"
          onClick={handleGoogleLogin}
          disabled={isPending}
        >
          {isPending ? "Iniciando sesión con Google..." : "Iniciar sesión con Google"}
          <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>

        {/* 🔹 Mostrar error en caso de fallo */}
        {errorMessage && (
          <div className="flex h-8 items-end space-x-1 mt-2" aria-live="polite" aria-atomic="true">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
