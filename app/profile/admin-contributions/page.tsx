'use client';

import React, { useState } from 'react';
import ProtectedRoute from "../../components/ProtectedRoute";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, limit, startAfter, QueryDocumentSnapshot, DocumentData, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { getStorage, ref, deleteObject } from 'firebase/storage';

interface Video {
  id: string;
  label: string;
  nivel_user: number; // Agregado
  type: string;
  videoPath: string;
}

const ContributionsAllPage: React.FC = () => {
    const [label, setLabel] = useState<string>(''); // Nombre del seña a buscar
    const [videos, setVideos] = useState<Video[]>([]); // Lista de videos encontrados
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null); // Último documento visible para la paginación
    const [isPending, setIsPending] = useState<boolean>(false); // Estado de carga
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Mensaje de error

    const nivelLabels: { [key: number]: string } = {
      1: "Experto",
      2: "Intermedio",
      3: "Novato"
    };

    // Función para buscar videos por nombre de seña
    const handleSearch = async () => {
        if (!label.trim()) {
            setErrorMessage('Por favor ingresa un nombre de seña para buscar.');
            return;
        }

        setIsPending(true);
        setErrorMessage(null);

        try {
            const videosCollection = collection(db, 'sign_data');
            const q = query(
                videosCollection,
                where('label', '==', label),
                where('status_verified', '==', false),
                orderBy('label'), // <-- Agrega esto
                limit(3) // Limitar a 3 resultados por página
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const videosList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    label: doc.data().label,
                    nivel_user: doc.data().nivel_user, // Agregado
                    type: doc.data().type,
                    videoPath: doc.data().videoPath,
                }));
                setVideos(videosList);
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]); // Guardar el último documento visible
            } else {
                setErrorMessage('No se encontraron videos para el seña ingresado.');
                setVideos([]);
            }
        } catch (error) {
            console.error('Error buscando videos:', error);
            setErrorMessage('Error buscando videos.');
        } finally {
            setIsPending(false);
        }
    };

    // Función para cargar más videos (paginación)
    const handleLoadMore = async () => {
        if (!lastVisible) return;

        setIsPending(true);

        try {
            const videosCollection = collection(db, 'sign_data');
            const q = query(
                videosCollection,
                where('label', '==', label),
                where('status_verified', '==', false),
                orderBy('label'), // <-- Agrega esto
                startAfter(lastVisible), // Continuar después del último documento visible
                limit(3) // Limitar a 3 resultados por página
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const videosList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    label: doc.data().label,
                    nivel_user: doc.data().nivel_user, // Agregado
                    type: doc.data().type,
                    videoPath: doc.data().videoPath,
                }));
                setVideos((prevVideos) => [...prevVideos, ...videosList]); // Agregar nuevos videos a la lista existente
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]); // Actualizar el último documento visible
            } else {
                setLastVisible(null); // No hay más resultados
            }
        } catch (error) {
            console.error('Error cargando más videos:', error);
            setErrorMessage('Error cargando más videos.');
        } finally {
            setIsPending(false);
        }
    };

    // Función para verificar un video
    const handleVerify = async (videoId: string) => {
        setIsPending(true);

        try {
            const videoDocRef = doc(db, 'sign_data', videoId);
            await updateDoc(videoDocRef, { status_verified: true }); // Actualizar el campo status_verified a true

            // Actualizar el estado local para reflejar el cambio
            setVideos((prevVideos) =>
                prevVideos.filter((video) => video.id !== videoId) // Eliminar el video verificado de la lista
            );

            alert('Video verificado correctamente.');
        } catch (error) {
            console.error('Error verificando el video:', error);
            alert('Error verificando el video.');
        } finally {
            setIsPending(false);
        }
    };

    // Función para eliminar video y archivo
    const handleDelete = async (video: Video) => {
      setIsPending(true);
      try {
        // Eliminar documento de Firestore
        await updateDoc(doc(db, 'sign_data', video.id), { deleted: true }); // Opcional: marca como eliminado antes de borrar
        await deleteDoc(doc(db, 'sign_data', video.id));
        // Eliminar archivo de Storage
        const storage = getStorage();
        const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
        let fileRefPath = '';
        if (video.videoPath.startsWith(baseUrl)) {
          const parts = video.videoPath.split('/o/');
          if (parts.length > 1) {
            fileRefPath = decodeURIComponent(parts[1].split('?')[0]);
          }
        } else {
          fileRefPath = video.videoPath;
        }
        if (fileRefPath) {
          const fileRef = ref(storage, fileRefPath);
          await deleteObject(fileRef);
        }
        setVideos((prev) => prev.filter((v) => v.id !== video.id));
        alert('Video eliminado correctamente.');
      } catch (error) {
        console.error('Error eliminando el video:', error);
        alert('Error eliminando el video.');
      } finally {
        setIsPending(false);
      }
    };

    // Función para limpiar la búsqueda
    const handleClear = () => {
        setLabel('');
        setVideos([]);
        setLastVisible(null);
        setErrorMessage(null);
    };

    return (
        <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1)]}>
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">Administrar Contribuciones</h1>

                {/* Buscador */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                            Buscar videos por nombre de seña
                        </label>
                        <input
                            id="label"
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Nombre del seña"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleSearch}
                                disabled={isPending}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {isPending ? 'Buscando...' : 'Buscar'}
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>

                    {/* Mostrar errores */}
                    {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}

                    {/* Lista de videos */}
                    {videos.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {videos.map((video) => (
                                <div key={video.id} className="p-4 border rounded-lg shadow-md bg-gray-50">
                                    <h2 className="text-lg font-bold">Etiqueta: {video.label}</h2>
                                    <p><strong>Nivel de usuario:</strong> {nivelLabels[video.nivel_user] || video.nivel_user}</p>
                                    <p><strong>Tipo:</strong> {video.type}</p>
                                    <video controls className="mt-2 w-full">
                                        <source src={video.videoPath} type="video/mp4" />
                                        Tu navegador no soporta la reproducción de videos.
                                    </video>
                                    <button
                                        onClick={() => handleVerify(video.id)}
                                        disabled={isPending}
                                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        {isPending ? 'Verificando...' : 'Verificar'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(video)}
                                        disabled={isPending}
                                        className="mt-2 ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        {isPending ? 'Eliminando...' : 'Eliminar'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Botón para cargar más */}
                    {lastVisible && (
                        <button
                            onClick={handleLoadMore}
                            disabled={isPending}
                            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            {isPending ? 'Cargando...' : 'Cargar más'}
                        </button>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ContributionsAllPage;