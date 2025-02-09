import React from 'react';
import ProtectedRoute from "../../components/ProtectedRoute";

const SendSignsPage: React.FC = () => {
    return (
         <ProtectedRoute allowedRoles={[1, 2]}>
        <div>
            <h1>Esta es la página para enviar los signos del usuario</h1>
        </div>
        </ProtectedRoute>
    );
};

export default SendSignsPage;