import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = ['all'] }) {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (!hasRole(allowedRoles)) {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, isLoading, allowedRoles, router]); // Removed hasRole from deps as it's memoized

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mint-light-gray">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-primary-blue mx-auto"></div>
          <p className="mt-4 text-mint-dark-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!hasRole(allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mint-light-gray">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-mint-dark-text">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
}

