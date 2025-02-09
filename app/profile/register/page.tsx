import RegisterForm from '@/app/ui/register-form';
import { Suspense } from 'react';
import Link from 'next/link';
import ColsingLogo from '@/app/ui/colsing-logo';
import ProtectedRoute from "../../components/ProtectedRoute";
 
export default function LoginPage() {
  return (
    <ProtectedRoute allowedRoles={[1]}>
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
          <Link
                  href="/profile"
              >
              <div className="w-32 text-white md:w-40">
                  <ColsingLogo />
              </div>
            </Link>
          </div>
        </div>
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
    </ProtectedRoute>
  );
}