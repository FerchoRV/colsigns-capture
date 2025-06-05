// components/TermsAndConditionsModal.tsx
import React, { useState, useRef, useEffect, FC } from 'react';

// Definimos la interfaz para las props del componente
interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TermsAndConditionsModal: FC<TermsAndConditionsModalProps> = ({ isOpen, onClose, onAccept }) => {
  const contentRef = useRef<HTMLDivElement>(null); // Tipamos el useRef para un div
  const [canAccept, setCanAccept] = useState<boolean>(false); // Tipamos el estado a boolean

  useEffect(() => {
    if (isOpen) {
      setCanAccept(false);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0; // Asegurarse de que el scroll esté al inicio al abrir
      }
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 20; // 20px de margen
      setCanAccept(atBottom);
    }
  };

  const handleAcceptClick = () => {
    if (canAccept) {
      onAccept();
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    // Tailwind CSS classes reemplazan los estilos en línea y el <style jsx>
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-11/12 max-w-2xl max-h-[90vh] flex flex-col">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Términos y Condiciones</h2>
        <div
          className="flex-grow overflow-y-auto border border-gray-300 p-4 mb-6 bg-gray-50 text-gray-700 leading-relaxed text-sm"
          onScroll={handleScroll}
          ref={contentRef}
        >
          {/* Aquí va tu texto largo de términos y condiciones */}
          <p className="font-semibold mb-4">Fecha de Última Actualización: 5 de junio de 2025</p>
          <p className="mb-3">
            Bienvenido/a a Colsign, una plataforma diseñada para facilitar la comunicación bidireccional entre personas sordas y oyentes en Colombia, y para ofrecer un espacio de aprendizaje de Lengua de Señas Colombiana. Nuestro objetivo es contribuir al desarrollo de intérpretes autónomos de lengua de señas mediante la creación de un conjunto de datos de acceso abierto para la comunidad científica.
          </p>
          <p className="mb-3">
            Al registrarse y utilizar el sistema Colsign, usted acepta y se compromete a cumplir con los siguientes Términos y Condiciones de Uso. Si no está de acuerdo con estos términos, le rogamos no utilizar el sistema.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-4">1. Aceptación de los Términos y Condiciones</h3>
          <p className="mb-3">
            Al acceder, navegar o utilizar la plataforma Colsign, usted manifiesta su consentimiento expreso e informado con todos los términos y condiciones aquí descritos. La aceptación de estos Términos es un requisito indispensable para el acceso y uso de las funcionalidades del sistema.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-4">2. Recopilación y Uso de Datos Personales</h3>
          <p className="mb-3">
            Colsign recopila y utiliza ciertos datos personales con las siguientes finalidades y bajo las condiciones que se detallan a continuación:
          </p>
          <ul className="list-disc pl-10 mb-4"> {/* 'list-disc' para viñetas circulares, 'pl-10' para indentación extra de la lista */}
            <li>
              <p>
                <strong className="font-semibold">Nombre y Apellido (o Pseudónimo):</strong> Se recopilan con el propósito exclusivo de reconocimiento y agradecimiento a su participación en el proyecto, así como para el envío de notificaciones personalizadas. En ninguna circunstancia estos datos se vincularán directamente con los videos de señas aportados, buscando preservar su anonimato en relación con el contenido visual. Usted tiene la libertad de proporcionar su nombre y apellido real o utilizar un pseudónimo o apodo. El uso de estos datos es meramente testimonial para reconocer su contribución.
              </p>
            </li>
            <li>
              <p>
                <strong className="font-semibold">Nivel de Manejo de Signos:</strong> Esta información se recopila con el fin de categorizar y organizar los videos de señas aportados, permitiendo una clasificación eficiente para los fines de investigación y desarrollo del conjunto de datos.
              </p>
            </li>
            <li>
              <p>
                <strong className="font-semibold">Correo Electrónico:</strong> Es un dato esencial para su registro, autenticación y, de ser necesario, como medio de notificación importante por parte de Colsign. Su dirección de correo electrónico se mantendrá confidencial y no será compartida ni formará parte del conjunto de datos que se liberará a la comunidad científica.
              </p>
            </li>
          </ul>
          <h3 className="text-xl font-semibold mt-6 mb-4">3. Aportación y Gestión de Videos de Señas</h3>
          <p className="mb-3">
            La contribución de videos de señas es completamente voluntaria. Usted decide si desea enviar videos para el proyecto o no. Los siguientes puntos rigen la gestión de los videos que usted decida aportar:
          </p>
          <ul className="list-disc pl-10 mb-4"> {/* 'list-disc' para viñetas circulares, 'pl-10' para indentación extra de la lista */}
            <li>
              <p>
                <strong className="font-semibold">Potestad sobre Videos No Verificados:</strong> Mientras un video no haya sido sometido al proceso de verificación y aprobación por parte de Colsign, usted conserva la total potestad sobre dicho contenido. Esto significa que puede eliminar los videos no verificados en cualquier momento desde su cuenta de usuario.
              </p>
            </li>
            <li>
              <p>
                <strong className="font-semibold">Incorporación al Dataset y Carácter Irreversible:</strong> Una vez que un video ha sido <strong>verificado y aprobado</strong> por Colsign, pasa a formar parte integral del conjunto de datos del proyecto. A partir de este momento, <strong>no será posible eliminar dicho video del conjunto de datos</strong>. Al enviar videos, usted entiende y acepta que, si estos son verificados, está dando su consentimiento expreso para que formen parte del conjunto de datos de acceso abierto que será liberado a la comunidad científica al finalizar el proyecto. El objetivo de este conjunto de datos es el desarrollo de intérpretes autónomos y la investigación en el campo de la Lengua de Señas Colombiana.
              </p>
            </li>
          </ul>
          <h3 className="text-xl font-semibold mt-6 mb-4">4. Notificaciones y Comunicaciones</h3>
          <p className="mb-3">
            Usted acepta que el correo electrónico proporcionado durante el registro será el medio principal para recibir notificaciones y comunicaciones importantes relacionadas con el sistema Colsign y el proyecto. Es su responsabilidad mantener su dirección de correo electrónico actualizada.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-4">5. Reconocimiento a Colaboradores</h3>
          <p className="mb-3">
            Los usuarios que cuenten con videos verificados e incorporados al conjunto de datos aceptan que el Nombre y Apellido (o pseudónimo) que hayan proporcionado se incluirán en la sección de <strong>Agradecimientos o Colaboradores</strong> del sistema Colsign, con el fin de realizar una mención pública de su valiosa contribución al proyecto.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-4">6. Inactividad de la Cuenta</h3>
          <p className="mb-3">
            Colsign opera con recursos limitados. Para una gestión eficiente, las cuentas de usuarios que presenten periodos prolongados de inactividad podrían ser puestas en pausa, lo que resultaría en una suspensión temporal de su acceso al sistema. Para restablecer el acceso, el usuario deberá comunicarse con Colsign a través del correo electrónico diegoferivera@unicauca.edu.co, indicando la dirección de correo electrónico con la que está registrado en el sistema.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-4">7. Rechazo de los Términos</h3>
          <p className="mb-3">
            El rechazo de estos Términos y Condiciones de Uso impide el acceso y la participación en el sistema Colsign. Si no acepta estos términos, no podrá registrarse ni utilizar las funcionalidades de la plataforma.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-4">8. Contacto</h3>
          <p className="mb-3">
            Para cualquier consulta o solicitud de información adicional relacionada con estos Términos y Condiciones, o con el tratamiento de sus datos, por favor, póngase en contacto con nosotros a través del siguiente correo electrónico: <strong>diegoferivera@unicauca.edu.co</strong>.
          </p>
        </div>
        <button
          onClick={handleAcceptClick}
          disabled={!canAccept}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed self-center"
        >
          Aceptar Términos y Condiciones
        </button>
      </div>
    </div>
  );
};

export default TermsAndConditionsModal;