import { Navigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const token = useAppStore((state) => state.token);

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
