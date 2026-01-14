import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { validatePasswordResetToken, resetPassword, validatePassword } from '../data/users';

export default function ResetPassword() {
  const router = useRouter();
  const { token, userId } = router.query;
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    if (token && userId) {
      const validation = validatePasswordResetToken(parseInt(userId), token);
      if (!validation.valid) {
        setTokenError(validation.error);
      }
      setIsValidating(false);
    } else if (router.isReady) {
      setTokenError('Invalid reset link');
      setIsValidating(false);
    }
  }, [token, userId, router.isReady]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setErrors({ password: passwordValidation.errors[0] });
      return;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = resetPassword(parseInt(userId), token, formData.password);
      
      if (result.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: error.message || 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <>
        <Head>
          <title>Reset Password | E-GIRS</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="text-center">
            <p className="text-mint-dark-text">Validating reset link...</p>
          </div>
        </div>
      </>
    );
  }

  if (tokenError) {
    return (
      <>
        <Head>
          <title>Reset Password | E-GIRS</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-mint-medium-gray">
              <h2 className="text-2xl font-bold text-mint-primary-blue mb-6 text-center">
                Invalid Reset Link
              </h2>
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p className="text-sm">{tokenError}</p>
              </div>
              <Link
                href="/forgot-password"
                className="block w-full text-center bg-mint-primary-blue hover:bg-mint-secondary-blue text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <Head>
          <title>Password Reset Successful | E-GIRS</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-mint-medium-gray">
              <h2 className="text-2xl font-bold text-mint-primary-blue mb-6 text-center">
                Password Reset Successful
              </h2>
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
                <p className="text-sm">Your password has been reset successfully. Redirecting to login...</p>
              </div>
              <Link
                href="/login"
                className="block w-full text-center bg-mint-primary-blue hover:bg-mint-secondary-blue text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Reset Password | E-GIRS</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-mint-primary-blue mb-2">E-GIRS</h1>
            <p className="text-mint-dark-text text-lg">E-Government Index Reporting System</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-mint-medium-gray">
            <h2 className="text-2xl font-bold text-mint-primary-blue mb-6 text-center">
              Reset Your Password
            </h2>

            {errors.general && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                <p className="text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-mint-dark-text mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue transition-all ${
                    errors.password ? 'border-red-500' : 'border-mint-medium-gray'
                  }`}
                  placeholder="Enter new password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-mint-dark-text/60">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-mint-dark-text mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue transition-all ${
                    errors.confirmPassword ? 'border-red-500' : 'border-mint-medium-gray'
                  }`}
                  placeholder="Confirm new password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
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
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>

              <div className="text-center">
                <Link href="/login" className="text-sm font-medium text-mint-primary-blue hover:text-mint-secondary-blue">
                  ← Back to Login
                </Link>
              </div>
            </form>
          </div>

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

