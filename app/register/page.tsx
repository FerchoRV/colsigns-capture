import { Suspense } from 'react';
import RegisterDataUserForm from '@/app/ui/register/data-user-form';
import Link from 'next/link';
import ColsingLogo from '@/app/ui/colsing-logo';
 
export default function LoginPage() {
  return (
    
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
                  <div className="w-32 text-white md:w-36">
                    <Link
                          href="/"
                      >
                      <div className="w-32 text-white md:w-40">
                          <ColsingLogo />
                      </div>
                    </Link>
                  </div>
        </div>
          <h1 className= "mb-3 text-2xl">
          Debes estar autenticado para enviar tus datos.
        </h1>
        <Suspense>
          <RegisterDataUserForm />
        </Suspense>
      </div>
    </main>
    
  );
}