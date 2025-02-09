import React from 'react';
import ProtectedRoute from "../../components/ProtectedRoute";

const AdminMetadataPage: React.FC = () => {
    return (
        <ProtectedRoute allowedRoles={[1]}>
        <div>
            <h1>Esta es la página de administracion de la tabla de signos_name</h1>
        </div>
        </ProtectedRoute>
    );
};

export default AdminMetadataPage;