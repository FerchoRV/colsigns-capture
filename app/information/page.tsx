import React from 'react';

const InformationPage: React.FC = () => {
    return (
        <div>
            <h1>Información del Proyecto</h1>
            
            <section>
                <h2>¿Qué es?</h2>
                <p>Descripción del proyecto...</p>
            </section>
            
            <section>
                <h2>¿Cómo ayudar?</h2>
                <p>Información sobre cómo se puede ayudar...</p>
            </section>
            
            <section>
                <h2>Equipo de Trabajo</h2>
                <p>Detalles sobre el equipo de trabajo...</p>
            </section>
            
            <section>
                <h2>Publicaciones</h2>
                <p>Lista de publicaciones relacionadas con el proyecto...</p>
            </section>
            
            <section>
                <h2>Información de Contacto</h2>
                <p>Detalles de contacto...</p>
            </section>
        </div>
    );
};

export default InformationPage;