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
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState<Contribution | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Estado para el texto que el usuario escribe en el input
  const [searchTerm, setSearchTerm] = useState<string>(''); 
  // Nuevo estado: término de búsqueda que dispara la consulta al presionar el botón
  const [confirmedSearchTerm, setConfirmedSearchTerm] = useState<string>(''); 

  // Este useEffect se encargará de realizar la consulta a Firebase
  // SOLO cuando 'confirmedSearchTerm' cambie (es decir, cuando se presione el botón)
  useEffect(() => {
    const fetchContributions = async () => {
      setErrorMessage(null); // Limpiar errores previos

      // Solo inicia la carga y realiza la consulta si hay un término de búsqueda confirmado
      if (!confirmedSearchTerm) {
        setContributions([]); // Limpia las contribuciones si el buscador está vacío
        setIsLoading(false); 
        return; // No hagas la consulta a Firebase si no hay término de búsqueda confirmado
      }

      setIsLoading(true); // Iniciar la carga solo si hay término de búsqueda confirmado

      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          // Construye la consulta con ambos filtros: ID de usuario y el término de búsqueda confirmado
          const contributionsQuery = query(
            collection(db, 'sign_data'),
            where('id_user', '==', user.uid), // Filtrar por el ID del usuario autenticado
            where('label', '==', confirmedSearchTerm.toLowerCase()) // Filtrar por el término de búsqueda confirmado (en minúsculas)
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
  }, [confirmedSearchTerm]); // EL EFECTO AHORA DEPENDE DE 'confirmedSearchTerm'

  // Función para manejar el clic del botón de búsqueda
  const handleSearchButtonClick = () => {
    setConfirmedSearchTerm(searchTerm); // Actualiza el término de búsqueda que dispara la consulta
  };

  // Función para manejar la tecla Enter en el input de búsqueda
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchButtonClick();
    }
  };


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

        {/* Campo de búsqueda y botón */}
        <div className="mb-4 flex gap-2"> {/* Usamos flex y gap para alinear input y botón */}
          <input
            type="text"
            placeholder="Nombre de la seña"
            className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown} 
          />
          <button
            onClick={handleSearchButtonClick}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Buscar
          </button>
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

        {/* Lógica de renderizado */}
        {isLoading ? (
          <p>Cargando contribuciones...</p>
        ) : errorMessage ? (
          <p className="text-red-500">{errorMessage}</p>
        ) : (confirmedSearchTerm && contributions.length === 0) ? (
          <p>No se encontraron contribuciones con la seña &quot;{confirmedSearchTerm}&quot;.</p>
        ) : (!confirmedSearchTerm) ? (
          <p>Ingresa el nombre de la seña y presiona &quot;Buscar&quot; para ver tus contribuciones.</p>
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