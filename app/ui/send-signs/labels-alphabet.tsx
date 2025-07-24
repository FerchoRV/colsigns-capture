// components/LabelsAlphabet.js (o donde lo tengas)
import React from 'react';

// Añade 'onLetterSelect' y 'selectedLetter' como props
export default function LabelsAlphabet({ onLetterSelect, selectedLetter }) { 
  const letters = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  ];

  return (
    <div 
      className="
        grid 
        grid-cols-5         /* 5 columnas en pantallas pequeñas */
        md:grid-cols-6      /* 6 columnas en pantallas medianas */
        lg:grid-cols-12     /* 12 columnas en pantallas grandes */
        gap-4 p-5
      "
    >
      {letters.map((letter, index) => (
        <button
          key={index}
          // Añade lógica para resaltar la letra seleccionada
          className={`
            p-4 h-8 flex items-center justify-center 
            text-lg font-bold text-white rounded-md cursor-pointer
            shadow-md transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
            ${selectedLetter === letter 
              ? 'bg-blue-700 hover:bg-blue-800' // Estilo para letra seleccionada
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700' // Estilo normal
            }
          `}
          // Dispara la función onLetterSelect al hacer clic
          onClick={() => onLetterSelect(letter)} 
        >
          {letter}
        </button>
      ))}
    </div>
  );
}