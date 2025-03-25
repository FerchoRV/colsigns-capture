import { Suspense } from 'react';
import ProtectedRoute from "@/app/components/ProtectedRoute";
import RegisterDataUserForm from '@/app/ui/profile/data-user-form';

// ajustar para usar nd poitnd e up´date
export default function LoginPage() {
  return (
    <ProtectedRoute allowedRoles={[1, 2]}>
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <Suspense>
          <RegisterDataUserForm />
        </Suspense>
      </div>
    </main>
    </ProtectedRoute>
  );
}