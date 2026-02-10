import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

const TEST_USERS = [
  { username: 'admin', password: 'Admin123!', role: 'MInT Admin', category: 'Admin' },
  { username: 'contributor1', password: 'Contributor123!', role: 'Data Contributor', category: 'Regional' },
  { username: 'institute_contributor', password: 'Institute123!', role: 'Institute Data Contributor', category: 'Federal' },
  { username: 'approver1', password: 'Approver123!', role: 'Regional Approver (Addis Ababa)', category: 'Regional' },
  { username: 'amhara_approver', password: 'Amhara123!', role: 'Regional Approver (Amhara)', category: 'Regional' },
  { username: 'federal_approver', password: 'FederalApp123!', role: 'Federal Approver', category: 'Federal' },
  { username: 'committee1', password: 'Committee123!', role: 'Central Committee Member 1', category: 'Central' },
  { username: 'committee2', password: 'Committee123!', role: 'Central Committee Member 2', category: 'Central' },
  { username: 'committee3', password: 'Committee123!', role: 'Central Committee Member 3', category: 'Central' },
  { username: 'chairman', password: 'Chairman123!', role: 'Chairman (CC)', category: 'Central' },
  { username: 'secretary', password: 'Secretary123!', role: 'Secretary (CC)', category: 'Central' }
];

export default function Login() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showTestCredentials, setShowTestCredentials] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await login(formData.username, formData.password);
      router.push('/dashboard');
    } catch (error) {
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        setLoginError('Your email address has not been verified. Please check your email for the verification link.');
      } else if (error.message === '2FA_REQUIRED') {
        const tempSession = JSON.parse(localStorage.getItem('egirs_pending_2fa') || '{}');
        router.push(`/verify-2fa?userId=${tempSession.userId}`);
        return;
      } else {
        setLoginError(error.message || 'Login failed. Please check your credentials.');
      }
      setIsSubmitting(false);
    }
  };

  const fillTestCredentials = (username, password) => {
    setFormData({ username, password });
    setErrors({});
    setLoginError('');
  };

  return (
    <>
      <Head>
        <title>Login | E-GIRS</title>
      </Head>
      <div className="min-h-screen bg-white flex flex-col lg:flex-row">
        <div className="w-full flex flex-col lg:flex-row min-h-screen">
          {/* Left panel - Login form: full width on small, 50% on lg; larger padding at all sizes */}
          <div className="w-full lg:w-1/2 flex-shrink-0 flex items-center justify-center min-h-0 flex-1 lg:min-h-screen bg-white p-6 sm:p-8 md:p-10 lg:p-16 order-2 lg:order-1">
            <div className="w-full max-w-lg flex flex-col">
            <div className="flex items-center gap-4 mb-10 sm:mb-14">
              <img src="/logo.png" alt="MInT" className="h-12 w-auto object-contain flex-shrink-0" />
              <div className="w-px self-stretch min-h-[2.5rem] bg-mint-primary-blue flex-shrink-0" aria-hidden />
              <div className="flex flex-col justify-center leading-tight">
                <span className="text-xl sm:text-2xl font-bold text-mint-secondary-blue uppercase tracking-tight">E-GIRS</span>
                <span className="text-sm font-bold text-mint-dark-text mt-0.5">E-Government Index Reporting System</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-mint-dark-text mb-3">Welcome Back</h1>
            <p className="text-mint-dark-text/70 text-base mb-8 sm:mb-10">
              Enter your username and password to access your account.
            </p>

            {/* Test credentials - collapsible */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowTestCredentials(!showTestCredentials)}
                className="text-sm font-medium text-mint-primary-blue hover:text-mint-secondary-blue flex items-center gap-1"
              >
                {showTestCredentials ? 'Hide' : 'Show'} test credentials
                <svg className={`w-4 h-4 transition-transform ${showTestCredentials ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showTestCredentials && (
                <div className="mt-3 p-3 bg-mint-light-gray rounded-lg border border-mint-medium-gray max-h-40 overflow-y-auto space-y-2">
                  {TEST_USERS.map((u, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-mint-dark-text/80">{u.role}</span>
                      <button
                        type="button"
                        onClick={() => fillTestCredentials(u.username, u.password)}
                        className="text-mint-primary-blue font-medium hover:underline"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {loginError}
                  {loginError.includes('email address has not been verified') && (
                    <div className="mt-2">
                      <Link href="/resend-verification" className="text-mint-primary-blue hover:underline text-sm">
                        Resend verification email
                      </Link>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label htmlFor="username" className="block text-base font-medium text-mint-dark-text mb-2">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue/50 ${
                    errors.username ? 'border-red-500' : 'border-mint-medium-gray'
                  }`}
                  placeholder="Enter your username"
                />
                {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-base font-medium text-mint-dark-text mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-12 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue/50 ${
                      errors.password ? 'border-red-500' : 'border-mint-medium-gray'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-mint-dark-text cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-mint-medium-gray text-mint-primary-blue focus:ring-mint-primary-blue" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-sm font-medium text-mint-primary-blue hover:text-mint-secondary-blue">
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-mint-primary-blue hover:bg-mint-secondary-blue text-white font-semibold py-3.5 text-base rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Log In'
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-mint-medium-gray flex flex-wrap items-center justify-between gap-2 text-sm text-mint-dark-text/70">
              <span>© 2025 Ministry of Innovation and Technology</span>
              <Link href="#" className="text-mint-primary-blue hover:underline">Privacy Policy</Link>
            </div>
            </div>
          </div>

          {/* Right panel: same image + green overlay on all screen sizes; visible on mobile (top) and lg (right) */}
          <div className="w-full lg:w-1/2 flex-shrink-0 flex flex-col relative overflow-hidden min-w-0 min-h-[36vh] sm:min-h-[40vh] lg:min-h-screen rounded-b-[2rem] sm:rounded-b-[3rem] lg:rounded-none lg:rounded-l-[4rem] xl:rounded-l-[5rem] shadow-[0_8px_24px_rgba(0,0,0,0.08)] lg:shadow-[-8px_0_24px_rgba(0,0,0,0.08)] order-1 lg:order-2">
            <div className="absolute inset-0 z-0 rounded-b-[2rem] sm:rounded-b-[3rem] lg:rounded-l-[4rem] xl:rounded-l-[5rem] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/login.png)' }} />
            <div className="absolute inset-0 z-[1] rounded-b-[2rem] sm:rounded-b-[3rem] lg:rounded-l-[4rem] xl:rounded-l-[5rem] bg-gradient-to-br from-[#0a4f57]/90 via-[#0d6670]/85 to-[#0a4f57]/90" />
            <div className="absolute inset-0 z-[2] rounded-b-[2rem] sm:rounded-b-[3rem] lg:rounded-l-[4rem] xl:rounded-l-[5rem] overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-mint-primary-blue/40 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
