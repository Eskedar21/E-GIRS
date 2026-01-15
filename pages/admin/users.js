import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUnits } from '../../data/administrativeUnits';
import { getAllUsers, deleteUser } from '../../data/users';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';

export default function UserManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setUsers(getAllUsers());
    setUnits(getAllUnits());
  }, []);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      try {
        const deleted = deleteUser(userToDelete.userId);
        if (deleted) {
          setUsers(getAllUsers());
          setSuccessMessage(`User "${deleted.username}" has been deleted successfully.`);
          setDeleteDialogOpen(false);
          setUserToDelete(null);
          setTimeout(() => setSuccessMessage(''), 5000);
        } else {
          setErrorMessage('Failed to delete user. Please try again.');
          setTimeout(() => setErrorMessage(''), 5000);
        }
      } catch (error) {
        setErrorMessage(error.message || 'An error occurred while deleting the user.');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    }
  };

  const handleEditClick = (user) => {
    router.push(`/admin/users/edit/${user.userId}`);
  };

  const getUnitName = (unitId) => {
    if (!unitId) return 'N/A (Central Role)';
    const unit = units.find(u => u.unitId === unitId);
    return unit ? unit.officialUnitName : 'Unknown';
  };

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'MInT Admin', 'Chairman (CC)']}>
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
                    <table className="w-full divide-y divide-mint-medium-gray">
                      <thead className="bg-mint-primary-blue">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            User ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Username
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Administrative Unit
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider" style={{ minWidth: '120px' }}>
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-mint-medium-gray">
                        {users.map((user) => (
                          <tr key={user.userId} className="hover:bg-mint-light-gray">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {user.userId}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-mint-dark-text">
                              {user.username}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {user.email}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {getUnitName(user.officialUnitId)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {user.role}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ minWidth: '120px' }}>
                              <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                                user.isEmailVerified
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.isEmailVerified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleEditClick(user)}
                                  variant="outline"
                                  size="sm"
                                  className="text-mint-primary-blue border-mint-primary-blue hover:bg-mint-primary-blue hover:text-white"
                                >
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => handleDeleteClick(user)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {errorMessage}
              </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-xl text-red-600">Delete User</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this user? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                {userToDelete && (
                  <div className="py-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Username:</span> {userToDelete.username}</p>
                      <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Email:</span> {userToDelete.email}</p>
                      <p className="text-sm text-gray-600"><span className="font-semibold">Role:</span> {userToDelete.role}</p>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeleteDialogOpen(false);
                      setUserToDelete(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteConfirm}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}

