import React from 'react';
import SignRecognizer from '@/app/ui/interpreter-lsc/SignRecognizer';
import Script from 'next/script';



const SignsToTextPage: React.FC = () => {
    return (
        <main>
            <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" strategy="beforeInteractive" />
            <h1 className="text-2xl font-bold text-blue-500">Instrucciones y recomendaciones</h1>
            <p className="text-gray-700">Este módulo permite probar los modelos obtenidos en este proyecto, actualmente solo están disponibles dos uno para reconocer el abecedario y otro de palabras que actualmente solo tiene 28 señas básicas del diccionario básico de lengua de señas colombiana.</p>
            <br />            
            <p className="text-gray-700">Actualmente solo se permite enviar una seña a la vez para cada modelo, si el botón de encender Cámara no se hablita al cargar esta página recargue nuevamente, una vez la cámara este encendida y la imagen se vea con fluides presione cualquier botón entre Abecedario y Palabras, el sistema inmediatamente procesa 30 fotogramas y envía los puntos de control al sistema tenga en cuenta que en ningún momento se envía sus imágenes o video a los modelos ya que no son necesarios, luego espere unos segundo y recibir a su predicción de la seña, si desea enviar una nueva, recarga la página nuevamente para evitar conflictos.</p>
            <SignRecognizer />
        </main>
    );
};

export default SignsToTextPage;