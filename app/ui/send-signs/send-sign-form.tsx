import React from 'react';
import { Button } from '@/app/ui/button';


const FormSendSigns: React.FC = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 rounded-lg">
            {/* Primera sección */}
                <div>
                    <h1 className='text-center p-1'> Seleccionar Tipo de signo </h1>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                    <label htmlFor="typeSignId" className="text-sm font-medium text-gray-700">
                        
                    </label>
                    <select
                        id="typeSignId"
                        name="typeId"
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                    <option value="1">Caracteres</option>
                    <option value="2">Palabras</option>
                    <option value="3">Freases</option>
                    </select>
                    </div>
            </div>
            {/* Primera sección */}
            <div>
                <h1 className='text-center p-1'> Seleccionar signo </h1>
                <div className="bg-white p-4 rounded-lg shadow-md">
                lista de signos
                </div>
            </div>
            {/* Segunda sección */}

            <div>
                <h1 className='text-center p-1'> Número de capturas </h1>
                <div className="bg-white p-4 rounded-lg shadow-md">
                10
                </div>
            </div>
            {/* Tercera sección */}
            <div>
                <h1 className='text-center p-1'> Capturas enviadas </h1>
                <div className="bg-white p-4 rounded-lg shadow-md">
                0
                </div>
            </div>

            <div>
                <Button
                  
                >
                    Enviar Datos
                </Button>
              </div>

        </div>

    );
};

export default FormSendSigns;
