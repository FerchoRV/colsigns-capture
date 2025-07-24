// app/ui/evaluate/labels-alphabet.js
import React from 'react';

// Añade 'onLetterSelect', 'selectedLetter' y 'signType' como props
export default function LabelsWordsV2({ onLetterSelect, selectedLetter}) { 
  const letters = [
    'Sordo', 'Hola', 'Bien', 'Mal', 'Adiós', 'Bienvenido', 'Gracias', 'Perdón', 'Permiso','Yo', 'Tú', 'Él', 'Ella', 'Nosotros', 'Usted', 'Ustedes', 'Qué','Cuando', 'Dónde','Cómo','Quién','Cuánto', 'Cuál', 'Buenos días', 'Buenas tardes', 'Buenas noches', 'Cómo estás', 'Por favor'
  ];

  return (
    <div 
      className="
        grid 
        grid-cols-3         /* 5 columnas en pantallas pequeñas */
        md:grid-cols-8      /* 6 columnas en pantallas medianas */
        lg:grid-cols-12     /* 12 columnas en pantallas grandes */
        gap-4 p-5
      "
    >
      {letters.map((letter, index) => (
        <button
          key={index}
          className={`
            p-4 h-16 flex items-center justify-center 
            text-lg font-bold text-white rounded-md cursor-pointer
            shadow-md 
            transition-all duration-200 ease-in-out /* Asegura la animación */
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
            ${selectedLetter === letter 
              ? 'bg-blue-700 hover:bg-blue-800' // Estilo para letra seleccionada
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700' // Estilo normal
            }
          `}
          // Dispara la función onLetterSelect enviando la letra Y el tipo de seña
          onClick={() => onLetterSelect(letter)} 
        >
          {letter}
        </button>
      ))}
    </div>
  );
}