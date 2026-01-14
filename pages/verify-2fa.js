import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { verifyOTP, sendOTP, getUserById } from '../data/users';
import { getUnitById } from '../data/administrativeUnits';

export default function Verify2FA() {
  const router = useRouter();
  const { userId } = router.query;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = useState(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (userId && router.isReady) {
      const userData = getUserById(parseInt(userId));
      if (userData) {
        setUser(userData);
        // Auto-send OTP on page load
        handleResendOTP();
      } else {
        router.push('/login');
      }
    }
  }, [userId, router.isReady]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendOTP = async () => {
    if (!user || !user.phoneNumber) {
      setError('Phone number not found');
      return;
    }

    setIsSending(true);
    setError('');
    
    try {
      const result = sendOTP(user.phoneNumber, user.userId);
      if (result.success) {
        setCountdown(60); // 60 second countdown
        // In demo, show OTP in console (remove in production)
        alert(`Demo: OTP sent to ${user.phoneNumber}. Check console for OTP: ${result.otp}`);
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otp.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (otp.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = verifyOTP(user.userId, otp);
      
      if (result.valid) {
        // Complete login session after 2FA verification
        // Get unit information if user has a unit
        let unitInfo = null;
        if (user.officialUnitId) {
          unitInfo = getUnitById(user.officialUnitId);
        }

        const userSession = {
          userId: user.userId,
          username: user.username,
          email: user.email,
          role: user.role,
          officialUnitId: user.officialUnitId,
          unitInfo: unitInfo,
          unitType: unitInfo ? unitInfo.unitType : null
        };
        
        localStorage.setItem('egirs_user', JSON.stringify(userSession));
        localStorage.removeItem('egirs_pending_2fa');
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Head>
          <title>2FA Verification | E-GIRS</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="text-center">
            <p className="text-mint-dark-text">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>2FA Verification | E-GIRS</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-mint-primary-blue mb-2">E-GIRS</h1>
            <p className="text-mint-dark-text text-lg">E-Government Index Reporting System</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-mint-medium-gray">
            <h2 className="text-2xl font-bold text-mint-primary-blue mb-6 text-center">
              Two-Factor Authentication
            </h2>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6">
              <p className="text-sm">
                We've sent a 6-digit verification code to <strong>{user.phoneNumber}</strong>. 
                Please enter it below to complete your login.
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-mint-dark-text mb-2">
                  Verification Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                    setError('');
                  }}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue transition-all text-center text-2xl tracking-widest font-mono ${
                    error ? 'border-red-500' : 'border-mint-medium-gray'
                  }`}
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="off"
                />
                <p className="mt-2 text-xs text-mint-dark-text/60 text-center">
                  Enter the 6-digit code sent to your phone
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-mint-primary-blue to-mint-secondary-blue text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify Code'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isSending || countdown > 0}
                  className="text-sm font-medium text-mint-primary-blue hover:text-mint-secondary-blue disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Sending...' : countdown > 0 ? `Resend code in ${countdown}s` : 'Resend verification code'}
                </button>
              </div>

              <div className="text-center pt-4 border-t border-mint-medium-gray">
                <Link href="/login" className="text-sm font-medium text-mint-dark-text/70 hover:text-mint-primary-blue">
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

