import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { getUserById, enable2FA, disable2FA, sendOTP, verifyOTP, updateUser } from '../data/users';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { InputOTP } from '../components/ui/input-otp';

export default function Profile() {
  const router = useRouter();
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (user) {
      const fullUserData = getUserById(user.userId);
      setUserData(fullUserData);
      if (fullUserData) {
        setPhoneNumber(fullUserData.phoneNumber || '');
      }
    }
  }, [user]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleEnable2FA = async () => {
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    // Basic phone number validation
    if (phoneNumber.trim().length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsEnabling(true);
    setError('');
    
    try {
      const result = enable2FA(user.userId, phoneNumber);
      if (result.success) {
        // Send OTP for verification
        const otpResult = sendOTP(phoneNumber, user.userId);
        if (otpResult.success) {
          setShowOTPInput(true);
          setCountdown(60);
          // In demo, show OTP
          alert(`Demo: OTP sent to ${phoneNumber}. Check console for OTP: ${otpResult.otp}`);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to enable 2FA. Please try again.');
    } finally {
      setIsEnabling(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setIsVerifying(true);
    
    try {
      const result = verifyOTP(user.userId, otp);
      if (result.valid) {
        // 2FA is already enabled, just verified
        setSuccess('Two-Factor Authentication has been enabled successfully!');
        setShowOTPInput(false);
        setOtp('');
        // Refresh user data
        const updatedUser = getUserById(user.userId);
        setUserData(updatedUser);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!userData || !userData.phoneNumber) {
      setError('Phone number not found');
      return;
    }

    setIsSending(true);
    setError('');
    
    try {
      const result = sendOTP(userData.phoneNumber, user.userId);
      if (result.success) {
        setCountdown(60);
        alert(`Demo: OTP sent to ${userData.phoneNumber}. Check console for OTP: ${result.otp}`);
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication? This will reduce your account security.')) {
      return;
    }

    setError('');
    
    try {
      const result = disable2FA(user.userId);
      if (result.success) {
        setSuccess('Two-Factor Authentication has been disabled.');
        const updatedUser = getUserById(user.userId);
        setUserData(updatedUser);
        setPhoneNumber('');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to disable 2FA. Please try again.');
    }
  };

  const handleUpdatePhoneNumber = async () => {
    if (!phoneNumber.trim() || phoneNumber.trim().length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setError('');
    
    try {
      updateUser(user.userId, { phoneNumber: phoneNumber.trim() });
      setSuccess('Phone number updated successfully.');
      const updatedUser = getUserById(user.userId);
      setUserData(updatedUser);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to update phone number. Please try again.');
    }
  };

  if (!user || !userData) {
    return (
      <ProtectedRoute>
        <Layout title="Profile">
          <div className="flex">
            <Sidebar />
            <main className="flex-grow ml-64 p-8">
              <p>Loading...</p>
            </main>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout title="My Profile">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                  My Profile
                </h1>
                <p className="text-mint-dark-text/70">Manage your account settings and security</p>
              </div>

              {/* Success Message */}
              {success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {success}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Account Information */}
              <Card className="mb-6 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-mint-primary-blue">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-mint-dark-text/70">Username</Label>
                    <p className="text-mint-dark-text font-medium">{userData.username}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-mint-dark-text/70">Email</Label>
                    <p className="text-mint-dark-text font-medium">{userData.email}</p>
                    <div className="mt-1">
                      {userData.isEmailVerified ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Not Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-mint-dark-text/70">Role</Label>
                    <p className="text-mint-dark-text font-medium">{userData.role}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-mint-primary-blue">Two-Factor Authentication (2FA)</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account by enabling 2FA via SMS
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-mint-dark-text">2FA Status</p>
                      <p className="text-sm text-mint-dark-text/70">
                        {userData.isTwoFactorEnabled 
                          ? 'Two-Factor Authentication is enabled'
                          : 'Two-Factor Authentication is disabled'}
                      </p>
                    </div>
                    {userData.isTwoFactorEnabled ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Enabled
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        Disabled
                      </Badge>
                    )}
                  </div>

                  {userData.isTwoFactorEnabled ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-semibold text-mint-dark-text">Phone Number</Label>
                        <p className="text-mint-dark-text font-medium">{userData.phoneNumber || 'Not set'}</p>
                      </div>
                      <Button
                        onClick={handleDisable2FA}
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        Disable 2FA
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="phone" className="mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="tel"
                          id="phone"
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            setError('');
                          }}
                          placeholder="+251 9XX XXX XXX"
                          className={error && !phoneNumber ? 'border-red-500' : ''}
                        />
                        <p className="mt-1 text-xs text-mint-dark-text/60">
                          Enter your mobile phone number to receive verification codes
                        </p>
                      </div>

                      {!showOTPInput ? (
                        <Button
                          onClick={handleEnable2FA}
                          disabled={isEnabling || !phoneNumber.trim()}
                          className="bg-mint-primary-blue hover:bg-mint-secondary-blue"
                        >
                          {isEnabling ? 'Enabling...' : 'Enable 2FA'}
                        </Button>
                      ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                          <div>
                            <Label className="mb-4 block text-center">
                              Verification Code <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex justify-center">
                              <InputOTP
                                value={otp}
                                onChange={(e) => {
                                  setOtp(e.target.value);
                                  setError('');
                                }}
                                maxLength={6}
                                className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
                              />
                            </div>
                            <p className="mt-4 text-xs text-mint-dark-text/60 text-center">
                              Enter the 6-digit code sent to {phoneNumber}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={isVerifying || otp.length !== 6}
                              className="bg-mint-primary-blue hover:bg-mint-secondary-blue"
                            >
                              {isVerifying ? 'Verifying...' : 'Verify & Enable'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleResendOTP}
                              disabled={isSending || countdown > 0}
                            >
                              {isSending ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : 'Resend Code'}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowOTPInput(false);
                                setOtp('');
                                setError('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

