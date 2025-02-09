import React from 'react';
import ProtectedRoute from "../../components/ProtectedRoute";

const ContributionsPage: React.FC = () => {
    return (
        <ProtectedRoute allowedRoles={[1, 2]}>
        <div>
            <h1>Esta es la página de contribuciones del usuario</h1>
        </div>
        </ProtectedRoute>
    );
};

export default ContributionsPage;