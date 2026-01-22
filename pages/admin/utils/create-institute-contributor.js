import { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import Sidebar from '../../../components/Sidebar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ensureInstituteContributorExists, getUserByUsername } from '../../../data/users';

export default function CreateInstituteContributor() {
  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if account exists on mount
    const existingUser = getUserByUsername('institute_contributor');
    if (existingUser) {
      setAccountStatus({
        exists: true,
        user: existingUser,
        message: 'Institute Contributor account already exists'
      });
    } else {
      setAccountStatus({
        exists: false,
        message: 'Institute Contributor account does not exist'
      });
    }
  }, []);

  const handleCreateAccount = () => {
    setLoading(true);
    try {
      const user = ensureInstituteContributorExists();
      setAccountStatus({
        exists: true,
        user: user,
        message: 'Institute Contributor account created successfully!'
      });
    } catch (error) {
      setAccountStatus({
        exists: false,
        error: error.message,
        message: 'Error creating account'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'MInT Admin']}>
      <Layout title="Create Institute Contributor Account">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                  Institute Contributor Account
                </h1>
                <p className="text-mint-dark-text/70">
                  Create or verify the Institute Data Contributor account
                </p>
              </div>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-mint-primary-blue">
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {accountStatus && (
                    <>
                      <div className={`p-4 rounded-lg ${
                        accountStatus.exists 
                          ? 'bg-green-100 border border-green-400 text-green-700' 
                          : 'bg-yellow-100 border border-yellow-400 text-yellow-700'
                      }`}>
                        <p className="font-semibold">{accountStatus.message}</p>
                        {accountStatus.error && (
                          <p className="mt-2 text-sm">{accountStatus.error}</p>
                        )}
                      </div>

                      {accountStatus.exists && accountStatus.user && (
                        <div className="bg-mint-light-gray p-4 rounded-lg">
                          <h3 className="font-semibold text-mint-dark-text mb-3">Account Details:</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-mint-dark-text/70">Username:</span>
                              <span className="font-semibold">{accountStatus.user.username}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-mint-dark-text/70">Email:</span>
                              <span className="font-semibold">{accountStatus.user.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-mint-dark-text/70">Role:</span>
                              <span className="font-semibold">{accountStatus.user.role}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-mint-dark-text/70">Unit ID:</span>
                              <span className="font-semibold">{accountStatus.user.officialUnitId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-mint-dark-text/70">Email Verified:</span>
                              <span className={`font-semibold ${accountStatus.user.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                                {accountStatus.user.isEmailVerified ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-xs text-yellow-800">
                                <strong>Default Password:</strong> Institute123!
                              </p>
                              <p className="text-xs text-yellow-800 mt-1">
                                Please change this password after first login.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {!accountStatus.exists && (
                        <div className="flex justify-center">
                          <Button
                            onClick={handleCreateAccount}
                            disabled={loading}
                            className="bg-mint-secondary-blue hover:bg-mint-primary-blue"
                          >
                            {loading ? 'Creating...' : 'Create Institute Contributor Account'}
                          </Button>
                        </div>
                      )}
                    </>
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
