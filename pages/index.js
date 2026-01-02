import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-mint-light-gray">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-primary-blue mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-mint-primary-blue mb-4">Loading...</h1>
        <p className="text-mint-dark-text">Redirecting...</p>
      </div>
    </div>
  );
}

