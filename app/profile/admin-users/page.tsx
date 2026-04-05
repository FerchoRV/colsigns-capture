import { Suspense } from 'react';
import ProtectedRoute from "../../components/ProtectedRoute";
import UserSearchAndUpdate from '@/app/ui/admin-user/update-role-id';
 
const RegisterUserAdminPage: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1)]}>
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">

        <Suspense>
          <UserSearchAndUpdate />
        </Suspense>
        
      </div>
    </main>
    </ProtectedRoute>
  );
}

export default RegisterUserAdminPage;