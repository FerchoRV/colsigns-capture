'use client'

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: number[] }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user !== null) {
      setIsLoading(false);
    }
  }, [user]);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // 🔹 No hacer nada hasta que termine la carga

    if (!user) {
      console.log("🔴 Usuario no autenticado. Redirigiendo a /profile...");
      router.push("/profile");
    } else if (!allowedRoles.includes(user.role_id)) {
      console.log(`🔴 Acceso denegado a ${user.username} con role_id: ${user.role_id}. Redirigiendo a /profile...`);
      router.push("/profile");
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading) {
    return <div>Cargando...</div>; // 🔹 Muestra un mensaje de carga
  }

  if (!user || !allowedRoles.includes(user.role_id)) {
    return null; // 🔹 No renderiza nada mientras redirige
  }

  return <>{children}</>;
}

