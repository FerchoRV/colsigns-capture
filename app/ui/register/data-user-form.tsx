'use client';

import { useState, FC } from 'react'; // Agregamos FC para tipado
import { useRouter } from 'next/navigation';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button'; // Asumo que esta es tu Button de UI
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/firebaseConfig';

// Importamos el componente del modal
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal'; // Ajusta la ruta si es necesario

const RegisterDataUserForm: FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Estado para controlar la visibilidad del modal
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false); // Estado para controlar si los términos fueron aceptados
  const router = useRouter();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAcceptTerms = () => {
    // Esta función se llama cuando el usuario acepta los términos en el modal
    setTermsAccepted(true); // Marca los términos como aceptados
    setIsModalOpen(false); // Cierra el modal
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // **Validación de Términos y Condiciones**
    if (!termsAccepted) {
      setErrorMessage('Debes leer y aceptar los Términos y Condiciones para continuar.');
      return; // Detiene el envío si los términos no han sido aceptados
    }

    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const levelId = formData.get('typeId') as string;

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      const roleId = process.env.NEXT_PUBLIC_APP_ROLE_2;

      // Guardar información adicional en Firestore, incluyendo status_tyc
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        levelId: parseInt(levelId, 10),
        email: user.email,
        roleId: parseInt(roleId, 10),
        createdAt: new Date(),
        status_tyc: termsAccepted, // ✅ Aquí se guarda el estado de aceptación
      });

      console.log('✅ Datos creados correctamente en Firestore.');
      router.push('/profile');
    } catch (error: unknown) {
      console.error('❌ Error guardando datos en Firestore:', error);
      setErrorMessage((error as Error).message || 'Error guardando datos en Firestore.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow-lg rounded-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Completa tus Datos</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Apellidos
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
          />
        </div>
        <div>
          <label htmlFor="typeId" className="block text-sm font-medium text-gray-700 mb-1">
            Nivel en manejo de señas colombianos
          </label>
          <select
            id="typeId"
            name="typeId"
            required
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
          >
            <option value="">Selecciona un nivel</option> {/* Opción por defecto */}
            <option value="1">Experto</option>
            <option value="2">Intermedio</option>
            <option value="3">Novato</option>
          </select>
        </div>

        {/* --- Sección de Términos y Condiciones --- */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={termsAccepted}
            onChange={() => setTermsAccepted(!termsAccepted)} // Permite desmarcar si ya se aceptó
            className={`h-5 w-5 rounded focus:ring-blue-500 ${termsAccepted ? 'text-green-600' : 'text-gray-300'}`}
          />
          <label htmlFor="acceptTerms" className="text-sm text-gray-700 flex items-center">
            Acepto los{' '}
            <span
              onClick={handleOpenModal}
              className="text-blue-600 hover:text-blue-800 cursor-pointer underline ml-1 font-semibold" // Usamos font-semibold para resaltar
            >
              Términos y Condiciones
            </span>
          </label>
        </div>
        {/* --- Fin Sección de Términos y Condiciones --- */}

      </div>
      {errorMessage && (
        <div className="text-red-600 text-sm flex items-center space-x-2">
          <ExclamationCircleIcon className="h-5 w-5" />
          <span>{errorMessage}</span>
        </div>
      )}
      <div>
        <Button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending || !termsAccepted} // Deshabilita el botón si no ha aceptado
        >
          {isPending ? 'Enviando...' : 'Registrar Datos'}
        </Button>
      </div>

      <TermsAndConditionsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal} // Podrías querer que cerrar sin aceptar no cambie `termsAccepted`
        onAccept={handleAcceptTerms}
      />
    </form>
  );
}

export default RegisterDataUserForm;