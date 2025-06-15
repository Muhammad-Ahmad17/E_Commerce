
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

type ProtectedRouteProps = {
  role: 'buyer' | 'vendor';
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== role) {
    // Redirect to the appropriate dashboard based on their role
    if (user?.role === 'buyer') {
      return <Navigate to="/buyer/dashboard" />;
    } else if (user?.role === 'vendor') {
      return <Navigate to="/vendor/dashboard" />;
    } else {
      return <Navigate to="/" />;
    }
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
