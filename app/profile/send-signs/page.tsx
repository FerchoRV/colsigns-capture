'use client';
import React, { useState, useEffect } from 'react';
import ProtectedRoute from "../../components/ProtectedRoute";
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase/firebaseConfig';
import CameraRecorder from '@/app/ui/send-signs/camera-recorder';
import ExampleVideo from '@/app/ui/send-signs/example-video';

// Define la interfaz para los señas
interface Sign {
  id: string;
  name: string;
  type: string;
  status: string;
  videoPath: string;
  meaning?: string; // Opcional
  reference?: string; // Opcional
}

const SendSignsPage: React.FC = () => {
  const [typeId, setTypeId] = useState(''); // Tipo de seña seleccionado
  const [signs, setSigns] = useState<Sign[]>([]); // Lista de señas obtenidos
  const [selectedSign, setSelectedSign] = useState<Sign | null>(null); // seña seleccionado
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // ID del usuario autenticado
  const [levelId, setLevelId] = useState<string | null>(null); // Nivel del usuario autenticado
  const [startsWith, setStartsWith] = useState(''); // Letra inicial del seña

  // Obtener el usuario autenticado y su nivel desde Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        setUserId(user.uid); // Establecer el ID del usuario

        // Obtener el nivel del usuario desde Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setLevelId(userDoc.data().levelId); // Establecer el nivel del usuario
        } else {
          console.error('El documento del usuario no existe en Firestore.');
        }
      } else {
        console.error('No hay un usuario autenticado.');
      }
    };

    fetchUserData();
  }, []);

  // Buscar señas por tipo y estado activo
  const handleSearch = async () => {
    if (!typeId.trim()) {
      setErrorMessage('Por favor selecciona un tipo de seña.');
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      const videoExampleCollection = collection(db, 'video_example');
      const q = query(
        videoExampleCollection,
        where('type', '==', typeId),
        where('status', '==', 'activo')
      );
      const querySnapshot = await getDocs(q);

      const signsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sign[]; // Asegúrate de que los datos coincidan con la interfaz

      setSigns(signsList);
      if (signsList.length === 0) {
        setErrorMessage('No se encontraron señas con el tipo seleccionado.');
      }
    } catch (error) {
      console.error('Error buscando los señas:', error);
      setErrorMessage('Error buscando los señas.');
    } finally {
      setIsPending(false);
    }
  };

  // Limpiar la búsqueda y los datos seleccionados
  const handleClear = () => {
    setTypeId('');
    setSigns([]);
    setSelectedSign(null);
    setErrorMessage(null);
    setStartsWith(''); // Limpiar la letra también
  };

  const getRecordingDuration = (type: string) => {
  if (type === 'Caracter') return 3000; // 3 segundos
  if (type === 'Palabra' || type === 'Frases') return 5000; // 5 segundos
  return 5000; // Valor por defecto
  };

  const filteredSigns = startsWith
    ? signs.filter(sign => sign.name?.toUpperCase().startsWith(startsWith))
    : signs;

  return (
    <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1), parseInt(process.env.NEXT_PUBLIC_APP_ROLE_2)]}>
      <div className="flex flex-col gap-4 p-4">
        {/* Buscar señas */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h1 className="text-xl font-bold">Buscar señas</h1>
          <div className="space-y-2">
            <label htmlFor="typeId" className="block text-sm font-medium text-gray-700">
              Tipo de seña
            </label>
            <select
              id="typeId"
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Selecciona un tipo</option>
              <option value="Caracter">Caracter</option>
              <option value="Palabra">Palabra</option>
              <option value="Frases">Frases</option>
            </select>
            <div>
              <label htmlFor="startsWith" className="block text-sm font-medium text-gray-700">
                ¿Con qué letra empieza? (A-Z, Ñ)
              </label>
              <input
                id="startsWith"
                type="text"
                maxLength={1}
                value={startsWith}
                onChange={(e) => {
                  // Solo permitir letras A-Z y Ñ, mayúsculas
                  const val = e.target.value.toUpperCase();
                  if (/^[A-ZÑ]?$/.test(val)) setStartsWith(val);
                }}
                className="block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder=""
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={isPending}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isPending ? 'Buscando...' : 'Buscar'}
              </button>
              <button
                onClick={handleClear}
                className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Limpiar
              </button>
            </div>
          </div>
          {errorMessage && <p className="text-red-600 text-sm mt-2">{errorMessage}</p>}
        </div>

        {/* Lista de señas */}
        {filteredSigns.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-bold">señas encontrados</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4">
              {filteredSigns.map((sign) => (
                <div
                  key={sign.id}
                  className={`p-2 border rounded-md cursor-pointer text-center transition-colors ${
                    selectedSign?.id === sign.id ? 'bg-blue-100' : 'bg-white'
                  }`}
                  onClick={() => setSelectedSign(sign)}
                >
                  {sign.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje si no hay señas para la letra seleccionada */}
        {signs.length > 0 && filteredSigns.length === 0 && startsWith && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mt-2 text-center">
            No hay señas de palabras o frases que comiencen por la letra seleccionada.
          </div>
        )}

        {/* Componentes habilitados al seleccionar un seña */}
        {selectedSign && userId && levelId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Componente CameraRecorder */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-bold">Grabar Video</h2>
              <p>Si tiene dudas de comó hacer el seña elegido revisa el ejemplo, tener en cuenta que en cada video solo debe aparecer una sola persona haciendo el seña y se debe grabar de la cintura hacia arriba similar a como el video de ejemplo.</p>
              <CameraRecorder
                name={selectedSign.name} // Nombre del seña seleccionado
                idSign={selectedSign.id} // ID del seña seleccionado
                idUser={userId} // ID del usuario autenticado
                levelId={levelId} // Nivel del usuario autenticado
                type={selectedSign.type} // Tipo del seña seleccionado
                duration={getRecordingDuration(selectedSign.type)}
              />
            </div>

            {/* Componente ExampleVideo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-bold">Video de Ejemplo</h2>
              <ExampleVideo
                name={selectedSign.name}
                meaning={selectedSign.meaning}
                videoPath={selectedSign.videoPath}
                reference={selectedSign.reference}
              />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default SendSignsPage;