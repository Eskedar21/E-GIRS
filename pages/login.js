import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

// Test user credentials for demo
const TEST_USERS = [
  { username: 'admin', password: 'Admin123!', role: 'MInT Admin', category: 'Admin' },
  { username: 'contributor1', password: 'Contributor123!', role: 'Data Contributor', category: 'Regional' },
  { username: 'institute_contributor', password: 'Institute123!', role: 'Institute Data Contributor', category: 'Federal' },
  { username: 'federal_contributor', password: 'Federal123!', role: 'Federal Data Contributor', category: 'Federal' },
  { username: 'approver1', password: 'Approver123!', role: 'Regional Approver (Addis Ababa)', category: 'Regional' },
  { username: 'amhara_approver', password: 'Amhara123!', role: 'Regional Approver (Amhara)', category: 'Regional' },
  { username: 'federal_approver', password: 'FederalApp123!', role: 'Federal Approver', category: 'Federal' },
  { username: 'initial_approver', password: 'Initial123!', role: 'Initial Approver', category: 'Regional' },
  { username: 'committee1', password: 'Committee123!', role: 'Central Committee Member', category: 'Central' },
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
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showTestCredentials, setShowTestCredentials] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(formData.username, formData.password);
      router.push('/dashboard');
    } catch (error) {
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        setLoginError('Your email address has not been verified. Please check your email for the verification link.');
      } else if (error.message === '2FA_REQUIRED') {
        // Redirect to 2FA verification page
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
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="w-full max-w-md">
          {/* Logo/Header Section */}
          <div className="mb-8">
            {/* Logo and Title Row */}
            <div className="flex items-center justify-center gap-4 mb-4">
              {/* Logo */}
              <img 
                src="/logo.png" 
                alt="Ministry of Innovation and Technology Logo" 
                className="h-16 w-auto object-contain"
              />
              {/* Vertical Separator */}
              <div className="h-16 w-0.5 bg-mint-primary-blue"></div>
              {/* System Name */}
              <div className="text-left">
                <h1 className="text-2xl font-bold text-mint-primary-blue leading-tight">E-GIRS</h1>
                <p className="text-base font-normal text-mint-primary-blue leading-tight">E-Government Index Reporting System</p>
              </div>
            </div>
          </div>

          {/* Test Credentials Info */}
          <div className="mb-4 bg-[#0d6670]/10 border border-[#0d6670]/20 rounded-lg p-4">
            <button
              type="button"
              onClick={() => setShowTestCredentials(!showTestCredentials)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="text-sm font-semibold text-[#0d6670]">
                Test User Credentials (Click to {showTestCredentials ? 'hide' : 'show'})
              </span>
              <svg
                className={`w-5 h-5 text-[#0d6670] transform transition-transform ${showTestCredentials ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showTestCredentials && (
              <div className="mt-4 space-y-4">
                {/* Group by category */}
                {['Admin', 'Regional', 'Federal', 'Central'].map((category) => {
                  const categoryUsers = TEST_USERS.filter(u => u.category === category);
                  if (categoryUsers.length === 0) return null;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <h4 className="text-xs font-bold text-[#0d6670] uppercase tracking-wider">
                        {category} Roles
                      </h4>
                      {categoryUsers.map((testUser, index) => (
                        <div
                          key={index}
                          className="bg-white border border-[#0d6670]/20 rounded-lg p-3 flex items-center justify-between hover:border-[#0d6670]/40 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-mint-dark-text">{testUser.role}</p>
                            <p className="text-xs text-mint-dark-text/70 mt-1">
                              Username: <span className="font-mono font-semibold">{testUser.username}</span>
                            </p>
                            <p className="text-xs text-mint-dark-text/70">
                              Password: <span className="font-mono font-semibold">{testUser.password}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => fillTestCredentials(testUser.username, testUser.password)}
                            className="ml-4 px-3 py-1.5 bg-mint-primary-blue hover:bg-mint-secondary-blue text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Use
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-mint-primary-blue mb-6 text-center">
              Sign In to Your Account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {loginError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {loginError}
                  {loginError.includes('email address has not been verified') && (
                    <div className="mt-2">
                      <Link href="/resend-verification" className="text-blue-600 hover:text-blue-800 underline text-sm">
                        Resend verification email
                      </Link>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-mint-dark-text mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue transition-all ${
                    errors.username ? 'border-red-500' : 'border-mint-medium-gray'
                  }`}
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-mint-dark-text mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue transition-all ${
                      errors.password ? 'border-red-500' : 'border-mint-medium-gray'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
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
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-mint-primary-blue focus:ring-mint-primary-blue border-mint-medium-gray rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-mint-dark-text">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-mint-primary-blue hover:text-mint-secondary-blue">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full bg-gradient-to-r from-mint-primary-blue to-mint-secondary-blue text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-mint-medium-gray">
              <p className="text-center text-sm text-mint-dark-text/70">
                Need help? Contact{' '}
                <a href="#" className="font-medium text-mint-primary-blue hover:text-mint-secondary-blue">
                  System Administrator
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center space-y-1">
            <p className="text-mint-dark-text/70 text-sm">
              © 2025 Ministry of Innovation and Technology. All rights reserved.
            </p>
            <p className="text-mint-dark-text/70 text-sm">
              Developed by <span className="font-semibold text-mint-primary-blue">360ground</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

