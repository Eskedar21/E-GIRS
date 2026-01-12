import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';

export default function Layout({ children, title = 'E-GIRS' }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <>
      <Head>
        <title>{title} | E-GIRS</title>
      </Head>
      <div className="min-h-screen flex flex-col bg-white">
        <header className="bg-white text-mint-dark-text fixed top-0 left-0 right-0 z-50 h-16 shadow-md border-b border-mint-medium-gray">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
                <h1 className="text-xl font-bold tracking-wide text-mint-primary-blue">E-GIRS</h1>
                <span className="text-sm font-light text-mint-dark-text/70">E-Government Index Reporting System</span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              {user && (
                <>
                  <NotificationCenter />
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-mint-primary-blue text-white flex items-center justify-center">
                      <span className="text-sm font-semibold">{getUserInitials()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-mint-dark-text">{user.username}</span>
                      <span className="text-xs text-mint-dark-text/60">{user.role}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-sm font-medium text-mint-dark-text hover:text-mint-primary-blue transition-colors px-3 py-1 rounded hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="flex-grow pt-16 text-mint-dark-text">
          {children}
        </main>
        <footer className="bg-white border-t border-mint-medium-gray text-mint-dark-text py-4 px-6 text-center text-sm shadow-inner">
          <div className="max-w-7xl mx-auto">
            <p className="text-mint-dark-text">
              © 2025 Ministry of Innovation and Technology. All rights reserved.
            </p>
            <p className="text-mint-dark-text/70 mt-1">
              Developed by <span className="font-semibold text-mint-primary-blue">360ground</span>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

