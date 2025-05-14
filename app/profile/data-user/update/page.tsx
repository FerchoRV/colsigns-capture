import { Suspense } from 'react';
import ProtectedRoute from "@/app/components/ProtectedRoute";
import UpdateDataUserForm from '@/app/ui/profile/update-data-user';

// ajustar para usar nd poitnd e up´date
export default function LoginPage() {
  return (
    <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1),parseInt(process.env.NEXT_PUBLIC_APP_ROLE_2)]}>
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <Suspense>
          <UpdateDataUserForm />
        </Suspense>
      </div>
    </main>
    </ProtectedRoute>
  );
}