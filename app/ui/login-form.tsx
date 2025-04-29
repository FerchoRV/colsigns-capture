'use client';

import { lusitana } from '@/app/ui/fonts';
import { AtSymbolIcon, KeyIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getRedirectResult } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebaseConfig';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = decodeURIComponent(searchParams.get('callbackUrl') || '/profile');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          console.log("Usuario autenticado con Google:", user);

          // 🔹 Verificar si es la primera vez que inicia sesión
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            // Si no existe el documento del usuario, guardar información básica y redirigir a registro
            await setDoc(userDocRef, {
              email: user.email,
              name: user.displayName,
              createdAt: new Date(),
            });
            console.log("Primera vez que inicia sesión con Google. Redirigiendo a /register...");
            router.push("/register");
          } else {
            // Si ya existe, redirigir a la URL de callback
            console.log("Usuario existente. Redirigiendo a su perfil");
            router.push("/profile");
          }
        }
      } catch (error) {
        console.error("Error manejando el resultado de redirección:", error);
      }
    };

    handleRedirectResult();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // 🔹 Iniciar sesión con Firebase Authentication (correo y contraseña)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Usuario autenticado:", user);

      // 🔹 Verificar si es la primera vez que inicia sesión
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Si no existe el documento del usuario, redirigir a la página de registro
        console.log("Primera vez que inicia sesión. Redirigiendo a /register...");
        router.push('/register');
      } else {
        // Si ya existe, redirigir a la URL de callback
        console.log("Usuario existente. Redirigiendo a su perfil:");
        router.push('/profile');
      }
    } catch (error: any) {
      console.error("Error en inicio de sesión:", error);
      setErrorMessage(error.message || 'Error en inicio de sesión');
    } finally {
      setIsPending(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsPending(true);
    setErrorMessage(null);

    try {
      // 🔹 Iniciar sesión con Google
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      console.log("Usuario autenticado con Google:", user);

      // 🔹 Verificar si es la primera vez que inicia sesión
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

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
    } catch (error: any) {
      console.error("Error en inicio de sesión con Google:", error);
      setErrorMessage(error.message || 'Error en inicio de sesión con Google');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Por favor inicia sesión para continuar.
        </h1>
        <div className="w-full">
          <div>
            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="email">
              Correo
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        <input type="hidden" name="redirectTo" value={callbackUrl} />

        <Button className="mt-4 w-full" aria-disabled={isPending} disabled={isPending}>
          {isPending ? "Iniciando sesión..." : "Log in"}
          <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>

        {/* 🔹 Botón para iniciar sesión con Google */}
        <Button
          type="button"
          className="mt-4 w-full bg-red-500 hover:bg-red-600"
          onClick={handleGoogleLogin}
          disabled={isPending}
        >
          {isPending ? "Iniciando sesión con Google..." : "Iniciar sesión con Google"}
        </Button>

        {/* 🔹 Mostrar error en caso de fallo */}
        {errorMessage && (
          <div className="flex h-8 items-end space-x-1 mt-2" aria-live="polite" aria-atomic="true">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500">{errorMessage}</p>
          </div>
        )}
      </div>
    </form>
  );
}
