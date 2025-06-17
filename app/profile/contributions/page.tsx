'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from "../../components/ProtectedRoute";
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase/firebaseConfig';
import { getStorage, ref, deleteObject } from 'firebase/storage';

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
  const [isLoading, setIsLoading] = useState(false); // Cambiado a false para que no cargue inicialmente
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Mensaje de error
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState<Contribution | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // Nuevo estado para el término de búsqueda

  // Estado para un debounce controlado
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Efecto para aplicar el debounce al término de búsqueda
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Debounce de 500ms

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Modificación clave aquí: el useEffect para cargar datos
  useEffect(() => {
    const fetchContributions = async () => {
      setErrorMessage(null); // Limpiar errores previos

      // Solo inicia la carga si hay un término de búsqueda (debounced)
      if (!debouncedSearchTerm) {
        setContributions([]); // Limpia las contribuciones si el buscador está vacío
        setIsLoading(false); // Asegúrate de que el estado de carga esté en false
        return; // No hagas la consulta a Firebase si no hay término de búsqueda
      }

      setIsLoading(true); // Iniciar la carga solo si hay término de búsqueda

      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          // Construye la consulta: debe coincidir con el ID del usuario Y el label
          const contributionsQuery = query(
            collection(db, 'sign_data'),
            where('id_user', '==', user.uid), // Filtrar por el ID del usuario autenticado
            where('label', '==', debouncedSearchTerm.toLowerCase()) // Filtrar por el término de búsqueda (en minúsculas)
          );

          const querySnapshot = await getDocs(contributionsQuery);
          const contributionsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Contribution[];

          setContributions(contributionsList);
        } else {
          setErrorMessage('No se pudo autenticar al usuario.');
        }
      } catch (error) {
        console.error('Error al obtener las contribuciones:', error);
        setErrorMessage('Error al cargar las contribuciones. Revisa la consola para más detalles.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributions();
  }, [debouncedSearchTerm]); // El efecto se ejecuta cuando cambia el término de búsqueda debounced


  // Eliminar contribución y archivo de Storage (sin cambios)
  const handleDelete = async (contribution: Contribution) => {
    setErrorMessage(null);
    try {
      await deleteDoc(doc(db, 'sign_data', contribution.id));
      const storage = getStorage();
      const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
      let fileRefPath = '';
      if (contribution.videoPath.startsWith(baseUrl)) {
        const parts = contribution.videoPath.split('/o/');
        if (parts.length > 1) {
          fileRefPath = decodeURIComponent(parts[1].split('?')[0]);
        }
      } else {
        fileRefPath = contribution.videoPath;
      }
      if (fileRefPath) {
        const fileRef = ref(storage, fileRefPath);
        await deleteObject(fileRef);
      }
      // Actualiza la lista en el cliente, no recarga de Firestore
      setContributions((prev) => prev.filter((c) => c.id !== contribution.id));
      setSuccessMessage('Eliminado con éxito');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (error) {
      console.error(error);
      setErrorMessage('Error al eliminar la contribución.');
    }
    setShowConfirm(false);
    setToDelete(null);
  };

  const nivelLabels: { [key: number]: string } = {
    1: "Experto",
    2: "Intermedio",
    3: "Novato"
  };

  return (
    <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1), parseInt(process.env.NEXT_PUBLIC_APP_ROLE_2)]}>
      <div className="p-4">
        <h1 className="text-xl text-blue-500 font-bold mb-4">Mis Contribuciones</h1>

        {/* Campo de búsqueda */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por etiqueta (seña)..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">{successMessage}</div>
        )}

        {/* Popup de confirmación */}
        {showConfirm && toDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <p>¿Estás seguro de que deseas eliminar esta contribución?</p>
              <div className="mt-4 flex gap-2">
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDelete(toDelete)}
                >
                  Sí, eliminar
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => { setShowConfirm(false); setToDelete(null); }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modificación en la lógica de renderizado inicial */}
        {isLoading ? (
          <p>Cargando contribuciones...</p>
        ) : errorMessage ? (
          <p className="text-red-500">{errorMessage}</p>
        ) : (debouncedSearchTerm && contributions.length === 0) ? (
          <p>No se encontraron contribuciones de la seña &quot;{debouncedSearchTerm}&quot;.</p>
        ) : (!debouncedSearchTerm) ? (
          <p>Introduce el nombre de la seña para ver tus contribuciones.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributions.map((contribution) => (
              <div key={contribution.id} className="p-4 border rounded-lg shadow-md bg-gray-50">
                <h2 className="text-lg font-bold">Seña: {contribution.label}</h2>
                <p><strong>Tipo:</strong> {contribution.type}</p>
                <p><strong>Nivel:</strong> {nivelLabels[contribution.nivel_user] || contribution.nivel_user}</p>
                <p><strong>Estado Verificado:</strong> {contribution.status_verified ? 'Sí' : 'No'}</p>
                <video controls className="mt-2 w-full">
                  <source src={contribution.videoPath} type="video/mp4" />
                  Tu navegador no soporta la reproducción de videos.
                </video>
                {!contribution.status_verified && (
                  <button
                    onClick={() => { setShowConfirm(true); setToDelete(contribution); }}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ContributionsPage;