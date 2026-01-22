import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { getUserById, enable2FA, disable2FA, updateUser } from '../data/users';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';

export default function Profile() {
  const router = useRouter();
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      const fullUserData = getUserById(user.userId);
      setUserData(fullUserData);
      if (fullUserData) {
        setPhoneNumber(fullUserData.phoneNumber || '');
      }
    }
  }, [user]);


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
        setSuccess('Two-Factor Authentication has been enabled successfully!');
        // Refresh user data
        const updatedUser = getUserById(user.userId);
        setUserData(updatedUser);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to enable 2FA. Please try again.');
    } finally {
      setIsEnabling(false);
    }
  };


  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication? This will reduce your account security.')) {
      return;
    }

    setIsDisabling(true);
    setError('');
    
    try {
      const result = disable2FA(user.userId);
      if (result.success) {
        setSuccess('Two-Factor Authentication has been disabled.');
        const updatedUser = getUserById(user.userId);
        setUserData(updatedUser);
        setPhoneNumber(updatedUser.phoneNumber || '');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to disable 2FA. Please try again.');
    } finally {
      setIsDisabling(false);
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
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
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
                        disabled={isDisabling}
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        {isDisabling ? 'Disabling...' : 'Disable 2FA'}
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
                      <Button
                        onClick={handleEnable2FA}
                        disabled={isEnabling || !phoneNumber.trim()}
                        className="bg-mint-primary-blue hover:bg-mint-secondary-blue"
                      >
                        {isEnabling ? 'Enabling...' : 'Enable 2FA'}
                      </Button>
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

