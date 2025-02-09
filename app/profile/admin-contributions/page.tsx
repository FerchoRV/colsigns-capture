import React from 'react';
import ProtectedRoute from "../../components/ProtectedRoute";

const ContributionsAllPage: React.FC = () => {
    return (
        <ProtectedRoute allowedRoles={[1]}>
        <div>
            <h1>Esta es la página de admin para las contribuciones del sistema</h1>
        </div>
        </ProtectedRoute>
    );
};

export default ContributionsAllPage;