import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { verifyEmail } from '../data/users';

export default function VerifyEmail() {
  const router = useRouter();
  const { token, userId } = router.query;
  const [isVerifying, setIsVerifying] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (token && userId && router.isReady) {
      const verificationResult = verifyEmail(parseInt(userId), token);
      setResult(verificationResult);
      setIsVerifying(false);
    } else if (router.isReady) {
      setResult({ success: false, error: 'Invalid verification link' });
      setIsVerifying(false);
    }
  }, [token, userId, router.isReady]);

  return (
    <>
      <Head>
        <title>Email Verification | E-GIRS</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-mint-primary-blue mb-2">E-GIRS</h1>
            <p className="text-mint-dark-text text-lg">E-Government Index Reporting System</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-mint-medium-gray">
            {isVerifying ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-mint-primary-blue mb-4">
                  Verifying Email...
                </h2>
                <div className="flex justify-center">
                  <svg className="animate-spin h-8 w-8 text-mint-primary-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            ) : result?.success ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-mint-primary-blue mb-2">
                    Email Verified Successfully!
                  </h2>
                  <p className="text-mint-dark-text/70">
                    Your email address has been verified. You can now log in to your account.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="block w-full text-center bg-mint-primary-blue hover:bg-mint-secondary-blue text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-red-600 mb-2">
                    Verification Failed
                  </h2>
                  <p className="text-mint-dark-text/70 mb-4">
                    {result?.error || 'The verification link is invalid or has expired.'}
                  </p>
                </div>
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
                  <p className="text-sm">
                    If you need a new verification link, please contact your administrator or try logging in to request a new one.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="block w-full text-center bg-mint-primary-blue hover:bg-mint-secondary-blue text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Go to Login
                </Link>
              </div>
            )}
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

