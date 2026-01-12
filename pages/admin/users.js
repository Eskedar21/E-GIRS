import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUnits } from '../../data/administrativeUnits';
import { getAllUsers } from '../../data/users';
import { Button } from '../../components/ui/button';

export default function UserManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    setUsers(getAllUsers());
    setUnits(getAllUnits());
  }, []);

  const getUnitName = (unitId) => {
    if (!unitId) return 'N/A (Central Role)';
    const unit = units.find(u => u.unitId === unitId);
    return unit ? unit.officialUnitName : 'Unknown';
  };

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'MInT Admin']}>
      <Layout title="User Management">
        <div className="flex">
          <Sidebar />
        <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                    User Management
                  </h1>
                  <p className="text-mint-dark-text/70">Create and manage user accounts with role-based access</p>
                </div>
                <Button
                  onClick={() => router.push('/admin/users/create')}
                  className="bg-mint-secondary-blue hover:bg-mint-primary-blue"
                >
                  + Create New User
                </Button>
              </div>
            </div>


            {/* Users List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-mint-medium-gray">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-mint-dark-text mb-4">
                  All Users ({users.length})
                </h2>
                {users.length === 0 ? (
                  <p className="text-mint-dark-text">No users registered yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-mint-medium-gray">
                      <thead className="bg-mint-primary-blue">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            User ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Username
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Administrative Unit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-mint-medium-gray">
                        {users.map((user) => (
                          <tr key={user.userId} className="hover:bg-mint-light-gray">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {user.userId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-mint-dark-text">
                              {user.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {getUnitName(user.officialUnitId)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {user.role}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                user.isEmailVerified
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.isEmailVerified ? 'Verified' : 'Pending Verification'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}

