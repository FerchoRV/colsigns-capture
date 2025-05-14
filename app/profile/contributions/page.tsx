'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from "../../components/ProtectedRoute";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase/firebaseConfig';

// Define la interfaz para las contribuciones
interface Contribution {
  id: string;
  label: string;
  type: string;
  nivel_user: string;
  status_verified: boolean;
  videoPath: string;
}

const ContributionsPage: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]); // Lista de contribuciones del usuario
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Mensaje de error

  useEffect(() => {
    const fetchContributions = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const contributionsQuery = query(
            collection(db, 'sign_data'),
            where('id_user', '==', user.uid) // Filtrar por el ID del usuario autenticado
          );

          const querySnapshot = await getDocs(contributionsQuery);
          const contributionsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Contribution[]; // Asegúrate de que los datos coincidan con la interfaz

          setContributions(contributionsList);
        } else {
          setErrorMessage('No se pudo autenticar al usuario.');
        }
      } catch (error) {
        console.error('Error al obtener las contribuciones:', error);
        setErrorMessage('Error al cargar las contribuciones.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributions();
  }, []);

  return (
    <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1), parseInt(process.env.NEXT_PUBLIC_APP_ROLE_2)]}>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Mis Contribuciones</h1>

        {isLoading ? (
          <p>Cargando contribuciones...</p>
        ) : errorMessage ? (
          <p className="text-red-500">{errorMessage}</p>
        ) : contributions.length === 0 ? (
          <p>No has enviado ningún video aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributions.map((contribution) => (
              <div key={contribution.id} className="p-4 border rounded-lg shadow-md bg-gray-50">
                <h2 className="text-lg font-bold">{contribution.label}</h2>
                <p><strong>Tipo:</strong> {contribution.type}</p>
                <p><strong>Nivel:</strong> {contribution.nivel_user}</p>
                <p><strong>Estado Verificado:</strong> {contribution.status_verified ? 'Sí' : 'No'}</p>
                <video controls className="mt-2 w-full">
                  <source src={contribution.videoPath} type="video/mp4" />
                  Tu navegador no soporta la reproducción de videos.
                </video>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ContributionsPage;