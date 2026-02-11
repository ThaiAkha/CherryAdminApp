import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        // You can replace this with a proper loading spinner
        return (
            <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    return <Outlet />;
}
