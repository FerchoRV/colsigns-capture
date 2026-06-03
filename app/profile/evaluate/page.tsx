// components/EvaluationTabs.js
"use client"; // Necesario para componentes con estado en Next.js App Router

import React, { useState } from 'react';
import ProtectedRoute from "../../components/ProtectedRoute";
// Importa los componentes que quieres mostrar

import EvaluateColsign45154 from "@/app/ui/evaluate/evaluate-colsign-45-154";
import EvaluateColsignBiSimetrico from "@/app/ui/evaluate/evaluate-colsgin-simetrico";
import EvaluateColsignBiAsimetrico from "@/app/ui/evaluate/evaluate-colsign-asimetrico";
import EvaluateColsignStaticV2 from "@/app/ui/evaluate/evaluate-colsign-static-v2";
import EvaluateColsignUnimanualV2 from "@/app/ui/evaluate/evaluate-colsign-unimanual-v2";

// Define un tipo para las pestañas para mayor claridad y seguridad de tipo
type Tab = | 'colsign-45-154' | 'colsign-bi-simetrico' | 'colsign-bi-asimetrico' | 'colsign-static-v2' | 'colsign-unimanual-v2';

const EvaluationTabs: React.FC = () => {
  // Estado para controlar qué pestaña está activa por defecto
  const [activeTab, setActiveTab] = useState<Tab>('colsign-45-154'); // La pestaña 'alphabet' será la inicial

  // Función para renderizar el componente activo
  const renderContent = () => {
    switch (activeTab) {      
      case 'colsign-45-154':
        return <EvaluateColsign45154 />;
      case 'colsign-bi-simetrico':
        return <EvaluateColsignBiSimetrico />;
      case 'colsign-bi-asimetrico':
        return <EvaluateColsignBiAsimetrico />;
      case 'colsign-static-v2':
        return <EvaluateColsignStaticV2 />;
      case 'colsign-unimanual-v2':
        return <EvaluateColsignUnimanualV2 />;
      default:
        return <EvaluateColsign45154 />; // Fallback por si acaso
    }
  };

  return (
    <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1), parseInt(process.env.NEXT_PUBLIC_APP_ROLE_3)]}>
    <div className="w-full p-4 md:p-8 bg-gray-50 rounded-lg shadow-xl">
      <h1 className="text-3xl font-extrabold text-blue-500 mb-6 text-center">Módulos de Evaluación</h1>
      
      {/* Contenedor de los botones de las pestañas */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 border-b-2 border-blue-200 pb-4">
        <button
          onClick={() => setActiveTab('colsign-45-154')}
          className={`
            px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out
            ${activeTab === 'colsign-45-154' 
              ? 'bg-blue-700 text-white shadow-md transform scale-105' 
              : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            }
          `}
        >
          Colsign 154 señas
        </button>        
        <button
          onClick={() => setActiveTab('colsign-bi-simetrico')}
          className={`
            px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out
            ${activeTab === 'colsign-bi-simetrico' 
              ? 'bg-blue-700 text-white shadow-md transform scale-105' 
              : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            }
          `}
        >
          Señas simetricas
        </button>
        <button
          onClick={() => setActiveTab('colsign-bi-asimetrico')}
          className={`
            px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out
            ${activeTab === 'colsign-bi-asimetrico' 
              ? 'bg-blue-700 text-white shadow-md transform scale-105' 
              : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            }
          `}
        >
          Señas asimetricas
        </button>
        <button
          onClick={() => setActiveTab('colsign-static-v2')}
          className={`
            px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out
            ${activeTab === 'colsign-static-v2' 
              ? 'bg-blue-700 text-white shadow-md transform scale-105' 
              : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            }
          `}
        >
          Señas estaticas
        </button>
        <button
          onClick={() => setActiveTab('colsign-unimanual-v2')}
          className={`
            px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out
            ${activeTab === 'colsign-unimanual-v2' 
              ? 'bg-blue-700 text-white shadow-md transform scale-105' 
              : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            }
          `}
        >
          Señas unimanuales
        </button>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="mt-8">
        {renderContent()}
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default EvaluationTabs;