import SearchExampleVideo from '@/app/ui/admin-signs-data/search-example-video';
import { Suspense } from 'react';
import ProtectedRoute from "../../../components/ProtectedRoute";
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

 
export default function SearchExampleVideoPage() {
  return (
    <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1)]}>
    <main className="flex min-h-screen flex-col p-6">
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <p>
            <strong>Buscar Video, </strong> esta seccion es para buscar la infromacion de videos de ejemplo de los señas colombianos que se desan capturar {' '}
          </p>
          <Link
            href="/profile/admin-signs-data"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
          >
            <span>Volver</span> <ArrowLeftIcon className="w-5 md:w-6" />
          </Link>
        </div>
        <div className="flex items-center justify-center md:h-screen">
        <Suspense>
          <SearchExampleVideo />
        </Suspense>
        </div>
      </div>
    </main>
    </ProtectedRoute>
  );
}