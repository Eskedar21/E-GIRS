import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserById,
  enable2FA,
  disable2FA,
  updateUser,
  checkPassword,
  isUsernameUnique,
  validatePassword
} from '../data/users';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';

export default function Profile() {
  const router = useRouter();
  const { user, updateSessionUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newUsername, setNewUsername] = useState('');
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!user?.userId) return;
    const fullUserData = getUserById(user.userId);
    setUserData(fullUserData);
    if (fullUserData) {
      setPhoneNumber(fullUserData.phoneNumber || '');
      setNewUsername(fullUserData.username);
    }
  }, [user?.userId]);


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

  const handleSaveUsername = (e) => {
    e?.preventDefault();
    setUsernameError('');
    setError('');
    setSuccess('');

    const trimmed = newUsername.trim();
    if (!trimmed) {
      setUsernameError('Username is required');
      return;
    }
    if (trimmed.length > 50) {
      setUsernameError('Username must be 50 characters or less');
      return;
    }
    if (!userData || trimmed === userData.username) {
      setUsernameError('Enter a new username to save');
      return;
    }
    if (!isUsernameUnique(trimmed, user.userId)) {
      setUsernameError('This username is already taken');
      return;
    }

    setIsSavingUsername(true);
    try {
      const updated = updateUser(user.userId, { username: trimmed });
      if (updated) {
        updateSessionUser({ username: trimmed });
        setUserData(getUserById(user.userId));
        setSuccess('Username updated. Use this username the next time you sign in (including on other devices).');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setUsernameError('Could not update username. Please try again.');
      }
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleSavePassword = (e) => {
    e?.preventDefault();
    setPasswordError('');
    setError('');
    setSuccess('');

    if (!userData) return;
    if (!checkPassword(currentPassword, userData.password)) {
      setPasswordError('Current password is incorrect');
      return;
    }
    if (!newPassword) {
      setPasswordError('Enter a new password');
      return;
    }
    const pw = validatePassword(newPassword);
    if (!pw.isValid) {
      setPasswordError(pw.errors[0]);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from your current password');
      return;
    }

    setIsSavingPassword(true);
    try {
      const updated = updateUser(user.userId, { password: newPassword });
      if (updated) {
        setUserData(getUserById(user.userId));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess('Password updated successfully.');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setPasswordError('Could not update password. Please try again.');
      }
    } finally {
      setIsSavingPassword(false);
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

              <Card className="mb-6 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-mint-primary-blue">Username and password</CardTitle>
                  <CardDescription>
                    Update your sign-in name or password. After changing your username, use the new name to log in everywhere.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <form onSubmit={handleSaveUsername} className="space-y-4">
                    <div>
                      <Label htmlFor="new-username" className="mb-2">Username</Label>
                      <Input
                        id="new-username"
                        value={newUsername}
                        onChange={(e) => {
                          setNewUsername(e.target.value);
                          setUsernameError('');
                        }}
                        maxLength={50}
                        className={usernameError ? 'border-red-500' : ''}
                        autoComplete="username"
                      />
                      {usernameError && <p className="mt-1 text-sm text-red-600">{usernameError}</p>}
                    </div>
                    <Button
                      type="submit"
                      disabled={isSavingUsername}
                      className="bg-mint-primary-blue hover:bg-mint-secondary-blue"
                    >
                      {isSavingUsername ? 'Saving...' : 'Save username'}
                    </Button>
                  </form>

                  <div className="border-t border-gray-200 pt-6">
                    <form onSubmit={handleSavePassword} className="space-y-4">
                      <div>
                        <Label htmlFor="current-password" className="mb-2">Current password</Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => {
                              setCurrentPassword(e.target.value);
                              setPasswordError('');
                            }}
                            className={passwordError ? 'border-red-500 pr-10' : 'pr-10'}
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-mint-dark-text/70 hover:text-mint-dark-text"
                          >
                            {showCurrentPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="new-password" className="mb-2">New password</Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              setPasswordError('');
                            }}
                            className="pr-10"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-mint-dark-text/70 hover:text-mint-dark-text"
                          >
                            {showNewPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-mint-dark-text/60">
                          At least 8 characters with uppercase, lowercase, number, and special character
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="confirm-password" className="mb-2">Confirm new password</Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setPasswordError('');
                            }}
                            className="pr-10"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-mint-dark-text/70 hover:text-mint-dark-text"
                          >
                            {showConfirmPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>
                      {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                      <Button
                        type="submit"
                        disabled={isSavingPassword}
                        className="bg-mint-primary-blue hover:bg-mint-secondary-blue"
                      >
                        {isSavingPassword ? 'Saving...' : 'Save password'}
                      </Button>
                    </form>
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

