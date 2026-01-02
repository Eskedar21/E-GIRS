import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { getUserByEmail } from '../data/users';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    setIsLoading(true);
    
    // Check if user exists
    const user = getUserByEmail(email);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (user) {
        // In a real app, send password reset email
        setSuccess(true);
      } else {
        // Don't reveal if email exists for security
        setSuccess(true);
      }
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>Forgot Password | E-GIRS</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="w-full max-w-md">
          {/* Logo/Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-mint-primary-blue mb-2">E-GIRS</h1>
            <p className="text-mint-dark-text text-lg">E-Government Index Reporting System</p>
          </div>

          {/* Password Recovery Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-mint-medium-gray">
            <h2 className="text-2xl font-bold text-mint-primary-blue mb-6 text-center">
              Reset Your Password
            </h2>

            {success ? (
              <div className="space-y-6">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                  <p className="text-sm">
                    If an account with that email exists, we've sent a password reset link to your email address.
                    Please check your inbox and follow the instructions to reset your password.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="block w-full text-center bg-mint-primary-blue hover:bg-mint-secondary-blue text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-sm text-mint-dark-text/70 text-center mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-mint-dark-text mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue transition-all ${
                      error ? 'border-red-500' : 'border-mint-medium-gray'
                    }`}
                    placeholder="Enter your email"
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-mint-primary-blue to-mint-secondary-blue text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                <div className="text-center">
                  <Link href="/login" className="text-sm font-medium text-mint-primary-blue hover:text-mint-secondary-blue">
                    ← Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-mint-dark-text/70 text-sm">
              © 2025 Ministry of Innovation and Technology. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

