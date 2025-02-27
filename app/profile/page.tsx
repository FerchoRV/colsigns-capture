"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; id: string } | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
  
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({ username: parsedUser.username, id: parsedUser.id });
  
        const getUserData = async () => {
          setLoading(true);
          const data = await fetchUserData(parsedUser.id);
          setUserData(data); // Si no hay datos, será null
          setLoading(false);
        };
  
        getUserData();
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.replace("/login");
      }
    } else {
      router.replace("/login");
    }
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/data_user/read-user?id=${userId}`);
  
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("⚠️ Usuario sin datos, debe actualziar la información.");
          return null; // Retorna null en lugar de lanzar error
        }
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      return null;
    }
  };

  

  if (loading) return <p>Cargando...</p>;

  if (!user) return null;

  

  return (
    <ProtectedRoute allowedRoles={[1, 2]}>
      <div className="flex min-h-screen flex-col p-6 max-w-3xl">
      
        {userData === null ? (
          <div>
            <p>No se encontró datos de usuario. Por favor, envia tu información para continuar, esto es de gran ayuda para esta investigacion, ademas d elo contrario tus videos no se tendran en cuenta gracias.</p>
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
                      {userData.level === 1 ? "Experto" : userData.level === 2 ? "Intermedio" : "Novato"}
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


