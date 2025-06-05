import React from 'react';
import ProtectedRoute from "../../components/ProtectedRoute";
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const AdminMetadataPage: React.FC = () => {
    return (
        <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1)]}>
            <main className="flex min-h-screen flex-col p-6">

                <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
                    <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
                    <p>
                        <strong>Administrar videos de ejemplo de señas colombianos, </strong> esta seccion permite administrar los videos de ejemplo de la aplicacion para realziar la captura de datos {' '}
                    </p>
                    <Link
                        href="/profile/admin-signs-data/create"
                        className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
                    >
                    <span>Cargar video</span> <ArrowRightIcon className="w-5 md:w-6" />
                    </Link>
                    <Link
                        href="/profile/admin-signs-data/update"
                        className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
                    >
                    <span>Editar video</span> <ArrowRightIcon className="w-5 md:w-6" />
                    </Link>
                    <Link
                        href="/profile/admin-signs-data/delete"
                        className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
                    >
                    <span>Eliminar video</span> <ArrowRightIcon className="w-5 md:w-6" />
                    </Link>
                    <Link
                        href="/profile/admin-signs-data/search"
                        className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
                    >
                    <span>Buscar video</span> <ArrowRightIcon className="w-5 md:w-6" />
                    </Link>
                
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
};

export default AdminMetadataPage;