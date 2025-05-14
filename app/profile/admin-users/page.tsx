import { Suspense } from 'react';
import Link from 'next/link';
import ColsingLogo from '@/app/ui/colsing-logo';
import ProtectedRoute from "../../components/ProtectedRoute";
import UserSearchAndUpdate from '@/app/ui/admin-user/update-role-id';
 
const RegisterUserAdminPage: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1)]}>
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
          <UserSearchAndUpdate />
        </Suspense>
        
      </div>
    </main>
    </ProtectedRoute>
  );
}

export default RegisterUserAdminPage;