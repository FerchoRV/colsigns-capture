'use client';
import ProtectedRoute from "../../components/ProtectedRoute";
import UserOpinionSurvey from "../../ui/evaluate/user-opinion-survey";
export default function UserSurveyPage() {
    return (
        <ProtectedRoute allowedRoles={[parseInt(process.env.NEXT_PUBLIC_APP_ROLE_1), parseInt(process.env.NEXT_PUBLIC_APP_ROLE_3)]}>
            <div>                
                <UserOpinionSurvey />
            </div>
        </ProtectedRoute>
    );
}