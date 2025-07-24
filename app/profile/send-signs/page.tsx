"use client";
import LabelsAlphabet from "@/app/ui/send-signs/labels-alphabet";
import React, { useState, useEffect, useCallback } from 'react'; // Agregamos useCallback
import ProtectedRoute from "../../components/ProtectedRoute"; // Mantener si lo usas para enrutamiento
import { collection, query, where, getDocs, doc, getDoc, orderBy} from 'firebase/firestore'; // Importar 'or' si es necesario
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase/firebaseConfig';
import CameraRecorder from '@/app/ui/send-signs/camera-recorder';
import ExampleVideo from '@/app/ui/send-signs/example-video';

// Define la interfaz para las señas
interface Sign {
  id: string;
  name: string;
  type: string;
  status: string;
  videoPath: string;
  meaning?: string; // Opcional
  reference?: string; // Opcional
}

const PagesendSign: React.FC = () => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null); // Letra seleccionada del alfabeto
  const [signs, setSigns] = useState<Sign[]>([]); // Lista de señas obtenidos
  const [selectedSign, setSelectedSign] = useState<Sign | null>(null); // Seña seleccionado
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // ID del usuario autenticado
  const [levelId, setLevelId] = useState<string | null>(null); // Nivel del usuario autenticado
  
  // *** Estado para controlar la visibilidad de CameraRecorder y ExampleVideo ***
  const [showRecordingSections, setShowRecordingSections] = useState(false);

  // Obtener el usuario autenticado y su nivel desde Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        setUserId(user.uid); // Establecer el ID del usuario

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setLevelId(userDoc.data().levelId); // Establecer el nivel del usuario
        } else {
          console.error('El documento del usuario no existe en Firestore.');
        }
      } else {
        console.error('No hay un usuario autenticado.');
        // Considerar redirigir o mostrar un mensaje si no hay usuario
      }
    };

    fetchUserData();
  }, []);

  // Función para buscar señas por la letra seleccionada y tipos
  // Usamos useCallback para memoizar esta función
  const fetchSignsByLetter = useCallback(async (letter: string) => {
    if (!letter.trim()) {
      setErrorMessage('Por favor, selecciona una letra para buscar señas.');
      setSigns([]); // Limpiar señas si no hay letra
      setSelectedSign(null); // Limpiar seña seleccionado
      setShowRecordingSections(false); // Ocultar secciones de grabación
      return;
    }

    setIsPending(true);
    setErrorMessage(null);
    setSigns([]); // Limpiar señas previos
    setSelectedSign(null); // Limpiar seña seleccionado
    setShowRecordingSections(false); // Ocultar secciones de grabación

    try {
      const videoExampleCollection = collection(db, 'video_example');
      
      // Consultar por "Palabra", "Caracter" o "Frases" usando el operador 'in'
      const q = query(
        videoExampleCollection,
        where('type', 'in', ['Palabra', 'Caracter', 'Frases']), // 'in' permite filtrar por varios valores
        where('status', '==', 'activo'),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);

      const signsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sign[];

      // Filtrar en el cliente por la letra inicial después de obtener los tipos deseados
      const filteredByLetter = signsList.filter(sign => 
        sign.name?.toUpperCase().startsWith(letter.toUpperCase())
      );

      setSigns(filteredByLetter);
      if (filteredByLetter.length === 0) {
        setErrorMessage(`No se encontraron señas de palabras, caracteres o frases que comiencen con la letra "${letter}".`);
      }
    } catch (error) {
      console.error('Error buscando los señas:', error);
      setErrorMessage('Error buscando los señas.');
    } finally {
      setIsPending(false);
    }
  }, []); // Dependencias vacías para useCallback ya que no usa estados/props que cambien

  // Efecto para disparar la búsqueda cuando se selecciona una letra
  useEffect(() => {
    if (selectedLetter) {
      fetchSignsByLetter(selectedLetter);
    }
  }, [selectedLetter, fetchSignsByLetter]); // selectedLetter y fetchSignsByLetter son dependencias

  // Función para manejar la selección de una letra del alfabeto
  const handleLetterSelect = (letter: string) => {
    setSelectedLetter(letter);
    // No reseteamos selectedSign aquí, se hace dentro de fetchSignsByLetter
    // y tampoco mostramos las secciones de grabación hasta que se elija una seña específica.
  };

  // Cuando se selecciona una seña de la lista
  const handleSignSelect = (sign: Sign) => {
    setSelectedSign(sign);
    // Ahora activamos la visibilidad de los componentes de cámara/video
    setShowRecordingSections(true); 
  };
  
  // Duración de la grabación basada en el tipo de seña
  const getRecordingDuration = (type: string) => {
    if (type === 'Caracter') return 3000; // 3 segundos
    if (type === 'Palabra') return 3000; // 3 segundos
    if (type === 'Frases') return 5000; // 5 segundos
    return 3000; // Valor por defecto
  };

  return (
    <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1), parseInt(process.env.NEXT_PUBLIC_APP_ROLE_2)]}>
    <div className="p-4"> {/* Añadido padding a la página principal */}
      <h1 className="text-2xl font-extrabold text-blue-500 mb-4">Envia tus Señas</h1>
      
      {/* Componente LabelsAlphabet */}
      <div className="mb-8">
        <h2 className="text-gray-900 mb-4">Selecciona una letra del abecedario para empezar, luego el sistema te entregara las opciones de señas disponibles para grabar y ser parte del conjunto de datos de entrenamiento: </h2>
        <LabelsAlphabet onLetterSelect={handleLetterSelect} selectedLetter={selectedLetter} />
      </div>

      {/* Indicadores de estado y errores */}
      {isPending && (
        <p className="text-blue-600 text-center text-lg mt-4 animate-pulse">Cargando señas...</p>
      )}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <strong className="font-bold">¡Error!</strong>
          <span className="block sm:inline"> {errorMessage}</span>
        </div>
      )}

      {/* Lista de señas encontrados (solo visible si hay señas y no hay error) */}
      {!isPending && !errorMessage && signs.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Señas que empiezan con &quot;{selectedLetter}&quot;</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4">
            {signs.map((sign) => (
              <div
                key={sign.id}
                className={`
                  p-3 border rounded-md cursor-pointer text-center 
                  transition-all duration-200 ease-in-out
                  ${selectedSign?.id === sign.id 
                    ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                    : 'bg-gray-100 hover:bg-blue-100'
                  }
                  border-blue-300
                `}
                onClick={() => handleSignSelect(sign)}
              >
                <span className="font-medium">{sign.name}</span>
                <span className="block text-xs text-gray-400">({sign.type})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Componentes CameraRecorder y ExampleVideo (visibles solo si se ha seleccionado una seña) */}
      {showRecordingSections && selectedSign && userId && levelId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          {/* Componente CameraRecorder */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Grabar Tu Seña: {selectedSign.name}</h2>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              Si tienes dudas de cómo hacer la seña elegida, revisa el video de ejemplo. Recuerda que en cada video solo debe aparecer una persona haciendo la seña y se debe grabar de la cintura hacia arriba, similar al video de ejemplo.
            </p>
            <CameraRecorder
              name={selectedSign.name}
              idSign={selectedSign.id}
              idUser={userId}
              levelId={levelId}
              type={selectedSign.type}
              duration={getRecordingDuration(selectedSign.type)}
            />
          </div>

          {/* Componente ExampleVideo */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Video de Ejemplo: {selectedSign.name}</h2>
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
}

export default PagesendSign;