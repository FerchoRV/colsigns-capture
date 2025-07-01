'use client'; 

import React, { useState } from 'react';
import clsx from 'clsx';
import SignRecognizer from '@/app/ui/interpreter-lsc/SignRecognizer';
import VisualizeSignsPage from '@/app/ui/interpreter-lsc/visualize-signs';
import Script from 'next/script';

const GeneralInterpreterLscPage: React.FC = () => {
    const [activeComponent, setActiveComponent] = useState<'signRecognizer' | 'visualizeSigns'>('signRecognizer'); // Estado para alternar componentes

    return (
        
        <main className="flex flex-col items-center gap-4 p-4"> 
            <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" strategy="beforeInteractive" />

            <h1 className="text-2xl font-bold text-blue-500">Prototipo Interprete Colsign</h1>

            {/* Botones para alternar entre los componentes */}
            <div className='flex grid grid-cols-2 grid-grow-1 gap-2 w-full max-w-md'>
            <button

                onClick={() => setActiveComponent('signRecognizer')}
                className={clsx(
                    'w-full px-4 py-2 rounded-md text-white font-medium',
                    activeComponent === 'signRecognizer' ? 'bg-blue-600' : 'bg-gray-400 hover:bg-blue-500'
                )}
            >
                Señas a texto
            </button>
            <button
                onClick={() => setActiveComponent('visualizeSigns')}
                className={clsx(
                    'w-full px-4 py-2 rounded-md text-white font-medium',
                    activeComponent === 'visualizeSigns' ? 'bg-blue-600' : 'bg-gray-400 hover:bg-blue-500'
                )}
            >
                Texto a señas 
            </button>

            </div>

            {/* Renderizar el componente según el estado */}
            <div className="mt-4 w-full">
                {activeComponent === 'signRecognizer' && <SignRecognizer />}
                {activeComponent === 'visualizeSigns' && <VisualizeSignsPage />}
            </div>
        </main>
    );
};

export default GeneralInterpreterLscPage;