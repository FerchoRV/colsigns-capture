import Image from "next/image";

export default function HelpPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-500">Toda ayuda cuenta</h1>
      <br />
      <p className="text-gray-700">Esta iniciativa espera entregar una solución que apoye los procesos de comunicación entre personas sordas y oyentes sin conocimiento en lengua de señas, además de hacer conciencia que para una inclusión social de personas sordas debemos interesarnos en este mecanismo de comunicación.</p>
      <br />
      <p className="text-gray-700">Y todos pueden ser parte inicialmente en la captura de datos para entrenar modelos de inteligencia artificial ya que se quiere mejorar la capacidad actual de los modelos y estos se consigue con grandes cantidades de información representativa de señas colombianas, para esto puedes seguir los siguientes pasos:</p>
      <br />
      <p className="text-gray-700">1. Inicia sesión en el sistema actualmente solo se permite iniciar sesión con Google. <a href="/login" className="text-blue-500 hover:underline">Iniciar sesión</a></p>
      <br />      
      <p className="text-gray-700">2. Una vez inicies sesión por primera vez dentro del sistema este te redirigirá a un formulario de registro en donde te pedirá información adicional como el nombre apellido y el nivel de manejo de señas, esta información se utiliza para clasificar los videos que compartas, y en la información de agradecimientos:</p>
      <br />
      <div className="flex justify-center">
        <Image
          src="/information-resources/form-register-r.jpg"
          alt="Registro"
          width={500}
          height={500}
          className="w-1/4 h-auto rounded-lg shadow-md mb-4"
        />       
      </div>
      <p className="text-gray-700">3. Una vez completes el formulario de registro te llevará a tu perfil en donde estará la información que registraste previamente y si necesitas cambiar algo puedes hacerlo utilizando el botón de actualizar información como se ve en la siguiente imagen: </p>
      <br />
      <div className="flex justify-center">
        <Image
          src="/information-resources/profile-colsign-r.jpg"
          alt="profile"
          width={500}
          height={500}
          className="w-1/2 h-auto rounded-lg shadow-md mb-4"
        />        
      </div>
      <br />   
      <p className="text-gray-700">4. Al llegar a este punto ya puedes empezar a compartir tus videos de señas que serán parte del conjunto de datos de entrenamiento una vez sean verificados, para hacer esto debes presionar el botón llamado “Enviar señas” esta se llevará a la siguiente interfaz:</p>
      <br />
      <div className="flex justify-center">
        <Image
          src="/information-resources/send-sign-1-r.jpg"
          alt="send-sign"
          width={500}
          height={500}          
          className="w-1/2 h-auto rounded-lg shadow-md mb-4"
        />        
      </div>
      <br />
      <p className="text-gray-700">5. En esta interfaz debes seleccionar el seña que deseas enviar para esto primero selecciona el tipo de señas que pueden ser caracteres (abecedario-números del 0 al 9), palabras (señas que representa una sola palabra), frases (señas que representan dos o más palabras o expresiones como “a veces”, “muchas gracias”, “buenos días”):</p>
      <br />
      <div className="flex justify-center">
        <Image
          src="/information-resources/send-sign-2-r.jpg"
          alt="send-sign"
          width={500}
          height={500}          
          className="w-1/2 h-auto rounded-lg shadow-md mb-4"
        />        
      </div>
      <br />
      <p className="text-gray-700">6. Una vez selecciones el tipo de seña puedes dar en el botón buscar, este traerá todas las señas disponibles en esa categorías, si deseas filtrar más puedes agregar una letra de la A-Z y de esta manera el sistema solo te mostrara las señas que comiencen por esta como se ve a continuación: </p>
      <br />
      <div className="flex justify-center">
        <Image
          src="/information-resources/send-sign-3-r.jpg"
          alt="send-sign"
          width={500}
          height={500}          
          className="w-1/2 h-auto rounded-lg shadow-md mb-4"
        />        
      </div>
      <br />
      <p className="text-gray-700">7. De la lista de señas que te entregue el sistema debes elegir uno y darle clic sobre él, esto te permitirá acceso al módulo de grabar y de ver el ejemplo de la seña seleccionada como se ve en la siguiente imagen; se recomienda ver el ejemplo de la seña para personas sin experiencia en estos, y practiquen antes de enviar sus videos, para ver el ejemplo solo debes presionar el botón Ver Ejemplo, y para grabar oprimes el botón Encender Cámara, este pedirá permisos para acceder a tu cámara presionar permitir y puedes empezar a grabar. </p>
      <br />
      <div className="flex justify-center">
        <Image
          src="/information-resources/send-sign-4-r.jpg"
          alt="send-sign"
          width={500}
          height={500}          
          className="w-1/2 h-auto rounded-lg shadow-md mb-4"
        />        
      </div>
      <br />
      <p className="text-gray-700">8. Al presionar los botones de Ver Ejemplo y Encender Cámara la interfaz cambia como se puede ver en la siguiente imagen, y se habilita el botón de Iniciar Grabación y el de Apagar Cámara. </p>
      <br />
      <div className="flex justify-center">
        <Image
          src="/information-resources/send-sign-5-r.jpg"
          alt="send-sign"
          width={500}
          height={500}          
          className="w-1/2 h-auto rounded-lg shadow-md mb-4"
        />        
      </div>
      <br />
      <p className="text-gray-700">9. Una vez estes listo y hayas practicado la seña presiona el botón Iniciar Grabación el sistema indica una cuenta regresiva como se ve en la siguiente imagen para que te prepares una vez termina el conteo comienza a grabar y se detiene automáticamente para señas de caracteres el tiempo es de 3 segundos y para palabras y frases es de 5 segundos. </p>
      <br />
      <div className="flex justify-center">
        <Image
          src="/information-resources/send-sign-6-r.jpg"
          alt="send-sign"
          width={500}
          height={500}          
          className="w-1/2 h-auto rounded-lg shadow-md mb-4"
        />
      </div>
      <br />
      <p className="text-gray-700">10. Una vez el video este grabado el sistema te mostrara una vista previa y tienes dos opciones Eliminar lo cual no enviara ninguna información al sistema y puede volver a grabar, o Aceptar para que la información y tu video se envíe al sistema. </p>
      <br />
      <div className="flex justify-center">
        <Image
          src="/information-resources/send-sign-7-r.jpg"
          alt="send-sign"
          width={500}
          height={500}          
          className="w-1/2 h-auto rounded-lg shadow-md mb-4"
        />        
      </div>
      <br />
      <p className="text-gray-700">11. Una vez aceptes el video el sistema te mostrará un mensaje de confirmación a la cual presionar aceptar y te devolverá a la interfaz del paso 8, y puede seguir enviando videos de la misma seña o si quieres enviar una nueva debes presionar el botón limpiar y volver hacer nuevamente todo desde el paso 4. </p>
      <br />
      <div className="flex justify-center">
        <Image
          src="/information-resources/send-sign-8-r.jpg"
          alt="send-sign"
          width={500}
          height={500}          
          className="w-1/2 h-auto rounded-lg shadow-md mb-4"
        />        
      </div>
      <br />
      <p className="text-gray-700">12. Por último, puedes dirigirte a la sección de Contribuciones en donde se mostrarán todos tus videos compartidos, y el estado de ellos, cabe resaltar que solo los videos verificados son los que aran parte del conjunto de datos, esto se verifica por medio de una comparación entre el enviado y el video de ejemplo, o si el usuario tiene un nivel 1 o experto en manejo de señas.</p>
      <br />
      <div className="flex justify-center">
        <Image
          src="/information-resources/page-contributions-r.jpg"
          alt="contributions"
          width={500}
          height={500}          
          className="w-1/2 h-auto rounded-lg shadow-md mb-4"
        />        
      </div>
      <br />
      <p className="text-gray-700">Con esto puede ser arte de esta iniciativa y quien sabe y aprendas algunas señas, todos los videos de ejemplo proporcionados cuentan con un enlace directo al creador por si requieren mas información sobre la lengua de señas colombiana. Si deseas contribuir de otra manera no dudes en ponerte en contacto con nosotros por medio del correo 
        {' '}
                <a
          href="mailto:diegoferivera@unicauca.edu.co"
          className="text-blue-600 underline hover:text-blue-800"
        >
          diegoferivera@unicauca.edu.co
        </a>, muchas gracias por haber llegado hasta aquí y espero contar con tu ayuda.
      </p>
    </div>
  );
}
