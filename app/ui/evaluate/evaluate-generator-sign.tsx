'use client';
import VisualizeSignComponent from "./visualize-signs";
export default function EvaluateGeneratorSign() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-extrabold text-blue-500 mb-6"> Evaluación Generador de Señas</h1>
      <h2 className="text-xl text-gray-800 mb-4">Este módulo permite visualizar las señas que representan un mensaje de texto para poder trasmitir información y facilitar la comunicación con personas sordas, puedes enviar letras individuales(a,b,c..), palabras(Hola, Qué, Caminar), o frases(Cómo estás, Buenos días, por favor) o combinaciones separados por “,” (Hola,Como estas,diego), para los textos que el sistema no tenga soporte idéntico te entregara el deletreo de la palabra:</h2>
      {/* Aquí puedes agregar el contenido específico para el generador de evaluación de señas */}
      <VisualizeSignComponent />
    </div>
  );
}