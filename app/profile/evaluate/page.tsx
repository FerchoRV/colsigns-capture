// components/EvaluationTabs.js
"use client"; // Necesario para componentes con estado en Next.js App Router

import React, { useState } from 'react';

// Importa los componentes que quieres mostrar
import EvaluateAlphabet from "@/app/ui/evaluate/evaluate-alphabet"; // Asumo que este es tu LabelsAlphabet renombrado o un nuevo componente
import EvaluateWordsV2 from "@/app/ui/evaluate/evaluate-wordsv2";
import EvaluateGeneratorSign from "@/app/ui/evaluate/evaluate-generator-sign";
import UserOpinionSurvey from "@/app/ui/evaluate/user-opinion-survey";

// Define un tipo para las pestañas para mayor claridad y seguridad de tipo
type Tab = 'alphabet' | 'words' | 'generator' | 'survey';

const EvaluationTabs: React.FC = () => {
  // Estado para controlar qué pestaña está activa por defecto
  const [activeTab, setActiveTab] = useState<Tab>('alphabet'); // La pestaña 'alphabet' será la inicial

  // Función para renderizar el componente activo
  const renderContent = () => {
    switch (activeTab) {
      case 'alphabet':
        return <EvaluateAlphabet />;
      case 'words':
        return <EvaluateWordsV2 />;
      case 'generator':
        return <EvaluateGeneratorSign />;
      case 'survey':
        return <UserOpinionSurvey />;
      default:
        return <EvaluateAlphabet />; // Fallback por si acaso
    }
  };

  return (
    <div className="w-full p-4 md:p-8 bg-gray-50 rounded-lg shadow-xl">
      <h1 className="text-3xl font-extrabold text-blue-500 mb-6 text-center">Módulos de Evaluación</h1>
      
      {/* Contenedor de los botones de las pestañas */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 border-b-2 border-blue-200 pb-4">
        <button
          onClick={() => setActiveTab('alphabet')}
          className={`
            px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out
            ${activeTab === 'alphabet' 
              ? 'bg-blue-700 text-white shadow-md transform scale-105' 
              : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            }
          `}
        >
          Evaluar Alfabeto
        </button>
        <button
          onClick={() => setActiveTab('words')}
          className={`
            px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out
            ${activeTab === 'words' 
              ? 'bg-blue-700 text-white shadow-md transform scale-105' 
              : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            }
          `}
        >
          Evaluar Palabras
        </button>
        <button
          onClick={() => setActiveTab('generator')}
          className={`
            px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out
            ${activeTab === 'generator' 
              ? 'bg-blue-700 text-white shadow-md transform scale-105' 
              : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            }
          `}
        >
          Generador de Señas
        </button>
        <button
          onClick={() => setActiveTab('survey')}
          className={`
            px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out
            ${activeTab === 'survey' 
              ? 'bg-blue-700 text-white shadow-md transform scale-105' 
              : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            }
          `}
        >
          Encuesta de Opinión
        </button>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="mt-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default EvaluationTabs;