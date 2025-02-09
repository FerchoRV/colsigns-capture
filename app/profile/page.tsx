"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // 🔹 Nuevo estado para evitar parpadeo

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser).username);
    } else {
      router.replace("/login"); // 🔹 Usa replace para evitar que vuelva atrás
    }
    
    setLoading(false); // 🔹 Asegura que el estado cambie después de verificar
  }, []);

  //if (loading) return <p>Cargando...</p>; // 🔹 Evita el parpadeo de la redirección

  if (!user) return null; // 🔹 No renderiza nada si está redirigiendo

  return (
    <ProtectedRoute allowedRoles={[1, 2]}>
    <div>
      <h1>Bienvenido, {user}</h1>
      <p>Esta es tu página de perfil.</p>
    </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;


