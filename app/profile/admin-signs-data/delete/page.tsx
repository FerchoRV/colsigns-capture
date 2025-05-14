import React from 'react';
import ProtectedRoute from "@/app/components/ProtectedRoute";

const DeleteExamplePage: React.FC = () => {
    return (
        <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1)]}>
        <div>
            <h1>Esta es la página para eliminar videos de ejemplo actualmente no es permitido</h1>
        </div>
        </ProtectedRoute>

    );
};

export default DeleteExamplePage;