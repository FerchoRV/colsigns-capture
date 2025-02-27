import React from 'react';
import ProtectedRoute from "../../components/ProtectedRoute";
import FormSendSigns from "@/app/ui/send-signs/send-sign-form";
import CameraRecorder from '@/app/ui/send-signs/camera-recorder';
import ExampleVideo from '@/app/ui/send-signs/example-video';

const SendSignsPage: React.FC = () => {
    return (
         <ProtectedRoute allowedRoles={[1, 2]}>
            <div className="flex grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                {/* Primera fila: ocupa las dos columnas en pantallas grandes */}
                    <div className="flex sm:col-span-2 bg-gray-50 p-4 rounded-lg">
                    <FormSendSigns /> 
                    </div>
        
                {/* Segunda fila: dos columnas en pantallas grandes */}
                    <div className="flex grid bg-gray-50 p-4 rounded-lg gap-2 p-2">
                        <p>Solo empieza grabar cuando se envie la infomacion del signo poravor</p>                                       
                        <CameraRecorder />
                    </div>
                    <div className="flex w-full h-32 grid bg-gray-50 p-4 rounded-lg gap-2 p-2">
                        <p>Para ver el video de ejemplo del signos pulse el siguiente boton</p>                                       
                        <ExampleVideo />
                    </div>
            </div>
        </ProtectedRoute>
    );
};

export default SendSignsPage;