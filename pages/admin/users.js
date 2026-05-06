import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUnits, getUnitById, UNIT_TYPES } from '../../data/administrativeUnits';
import { getAllUsers, deleteUser } from '../../data/users';
import { filterUsersByScope, canPerformAction, getAccessibleUnitIds, canManageUserAccount } from '../../utils/permissions';

/** Admin-unit filter dropdown options by role (full list only for top-level admins). */
function getAdminUnitFilterOptions(allUnits, currentUser) {
  if (!currentUser) return allUnits;
  if (currentUser.role === 'Regional Admin') {
    const allowed = new Set(getAccessibleUnitIds(currentUser, allUnits));
    return allUnits.filter(
      (u) => allowed.has(u.unitId) && u.unitType !== UNIT_TYPES.FEDERAL_INSTITUTE
    );
  }
  if (currentUser.role === 'Federal Admin' || currentUser.role === 'Institutional Admin') {
    return allUnits.filter((u) => u.unitType === UNIT_TYPES.FEDERAL_INSTITUTE);
  }
  return allUnits;
}
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
  const [listKey, setListKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAdminUnit, setFilterAdminUnit] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [listVersion, setListVersion] = useState(0);

  const loadUsersData = () => {
    const allUnits = getAllUnits();
    setUnits(() => getAdminUnitFilterOptions(allUnits, user));
    const allUsers = getAllUsers();
    const filtered = user ? filterUsersByScope(user, allUsers, allUnits) : allUsers;
    setUsers(() => filtered);
    setListVersion((v) => v + 1);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  useEffect(() => {
    if (!user) return;
    loadUsersData();
    
    // Refresh when route changes (e.g., coming back from create page)
    const handleRouteChange = (url) => {
      if (url === '/admin/users') {
        // Small delay to ensure localStorage is updated
        setTimeout(() => {
          loadUsersData();
        }, 100);
      }
    };
    
    // Refresh when page becomes visible (e.g., switching tabs or coming back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUsersData();
      }
    };
    
    // Refresh on window focus
    const handleFocus = () => {
      loadUsersData();
    };
    
    // Set up event listeners
    if (router.events) {
      router.events.on('routeChangeComplete', handleRouteChange);
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      if (router.events) {
        router.events.off('routeChangeComplete', handleRouteChange);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [router, user]);

  // Also refresh when router is ready and pathname matches
  useEffect(() => {
    if (user && router.isReady && router.pathname === '/admin/users') {
      loadUsersData();
    }
  }, [router.isReady, router.pathname, user]);

  // Refetch when navigating back to this page (e.g. after edit) so table shows latest data
  useEffect(() => {
    if (router.isReady && router.asPath === '/admin/users') {
      loadUsersData();
    }
  }, [router.isReady, router.asPath]);

  // Clear admin-unit filter if it is no longer a valid option for this role
  useEffect(() => {
    if (filterAdminUnit === '' || filterAdminUnit === 'central') return;
    const id = parseInt(filterAdminUnit, 10);
    if (!Number.isNaN(id) && !units.some((u) => u.unitId === id)) {
      setFilterAdminUnit('');
    }
  }, [units, filterAdminUnit]);

  const handleDeleteClick = (targetUser) => {
    if (!canManageUserAccount(user, targetUser, getAllUnits())) {
      setErrorMessage('You do not have permission to delete this user.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    setUserToDelete(targetUser);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      if (!canManageUserAccount(user, userToDelete, getAllUnits())) {
        setErrorMessage('You do not have permission to delete this user.');
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        setTimeout(() => setErrorMessage(''), 5000);
        return;
      }
      try {
        const deleted = deleteUser(userToDelete.userId);
        if (deleted) {
          loadUsersData();
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

  const handleEditClick = (targetUser) => {
    if (!canManageUserAccount(user, targetUser, getAllUnits())) {
      setErrorMessage('You do not have permission to edit this user.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    router.push(`/admin/users/edit/${targetUser.userId}`);
  };

  const getUnitName = (unitId) => {
    if (!unitId) return 'N/A (Central Role)';
    const fromFilter = units.find((u) => u.unitId === unitId);
    if (fromFilter) return fromFilter.officialUnitName;
    const unit = getUnitById(unitId);
    return unit ? unit.officialUnitName : 'Unknown';
  };

  const formatDateTime = (isoStr) => {
    if (!isoStr) return 'Never';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return '—';
    }
  };

  // Derive displayed list from fresh data (getAllUsers) so newly created users always appear
  const { displayedUsers, totalScopeCount } = useMemo(() => {
    const allUnits = getAllUnits();
    const allUsers = getAllUsers();
    const scopeFiltered = user ? filterUsersByScope(user, allUsers, allUnits) : allUsers;
    const totalScopeCount = scopeFiltered.length;
    let list = [...scopeFiltered];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((u) => {
        const username = (u.username || '').toLowerCase();
        const fullName = (u.fullName || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        return username.includes(q) || fullName.includes(q) || email.includes(q);
      });
    }
    if (filterAdminUnit === 'central') {
      list = list.filter((u) => u.officialUnitId == null);
    } else if (filterAdminUnit) {
      const unitId = parseInt(filterAdminUnit, 10);
      if (!isNaN(unitId)) list = list.filter((u) => u.officialUnitId === unitId);
    }
    if (filterStatus === 'Verified') list = list.filter((u) => !!u.isEmailVerified);
    if (filterStatus === 'Pending') list = list.filter((u) => !u.isEmailVerified);

    if (sortBy === 'createdAt' || sortBy === 'lastLoginAt') {
      list = [...list].sort((a, b) => {
        const aVal = a[sortBy] ? new Date(a[sortBy]).getTime() : 0;
        const bVal = b[sortBy] ? new Date(b[sortBy]).getTime() : 0;
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return { displayedUsers: list, totalScopeCount };
  }, [user, searchQuery, filterAdminUnit, filterStatus, sortBy, sortOrder, listVersion]);

  const showCentralRoleFilter =
    user &&
    ['Super Admin', 'MInT Admin', 'Chairman (CC)'].includes(user.role);

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'MInT Admin', 'Chairman (CC)', 'Regional Admin', 'Federal Admin', 'Institutional Admin']}>
      <Layout title="User Management">
        <div className="flex">
          <Sidebar />
        <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                    User Management
                  </h1>
                  <p className="text-mint-dark-text/70">Create and manage user accounts with role-based access</p>
                </div>
                <div className="flex gap-2">
                  {canPerformAction(user, 'create_user') && (
                    <Button
                      onClick={() => router.push('/admin/users/create')}
                      className="bg-mint-secondary-blue hover:bg-mint-primary-blue"
                    >
                      + Create New User
                    </Button>
                  )}
                </div>
              </div>
            </div>


            {/* Users List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-mint-medium-gray">
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h2 className="text-xl font-semibold text-mint-dark-text">
                    All Users ({displayedUsers.length}{totalScopeCount !== displayedUsers.length ? ` of ${totalScopeCount}` : ''})
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 ml-auto">
                    <input
                      type="search"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-2 border border-mint-medium-gray rounded-lg text-sm text-mint-dark-text placeholder:text-mint-dark-text/60 focus:outline-none focus:ring-2 focus:ring-mint-primary-blue focus:border-transparent min-w-[200px]"
                    />
                    <select
                      value={filterAdminUnit}
                      onChange={(e) => setFilterAdminUnit(e.target.value)}
                      className="px-3 py-2 border border-mint-medium-gray rounded-lg text-sm text-mint-dark-text bg-white focus:outline-none focus:ring-2 focus:ring-mint-primary-blue focus:border-transparent"
                    >
                      <option value="">All admin units</option>
                      {showCentralRoleFilter && (
                        <option value="central">N/A (Central Role)</option>
                      )}
                      {units.map((unit) => (
                        <option key={unit.unitId} value={unit.unitId}>
                          {unit.officialUnitName}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-mint-medium-gray rounded-lg text-sm text-mint-dark-text bg-white focus:outline-none focus:ring-2 focus:ring-mint-primary-blue focus:border-transparent"
                    >
                      <option value="">All statuses</option>
                      <option value="Verified">Verified</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
                {totalScopeCount === 0 ? (
                  <p className="text-mint-dark-text">No users registered yet.</p>
                ) : displayedUsers.length === 0 ? (
                  <p className="text-mint-dark-text">No users match your search or filters.</p>
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
                          <th
                            className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-mint-secondary-blue select-none"
                            onClick={() => handleSort('createdAt')}
                          >
                            Created {sortBy === 'createdAt' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                          </th>
                          <th
                            className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-mint-secondary-blue select-none"
                            onClick={() => handleSort('lastLoginAt')}
                          >
                            Last Login {sortBy === 'lastLoginAt' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody key={listKey} className="bg-white divide-y divide-mint-medium-gray">
                        {displayedUsers.map((u) => {
                          const canManageThisUser = canManageUserAccount(user, u, getAllUnits());
                          return (
                          <tr key={u.userId} className="hover:bg-mint-light-gray">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {u.userId}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-mint-dark-text">
                              {u.username}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {u.email}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {getUnitName(u.officialUnitId)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {u.role}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ minWidth: '120px' }}>
                              <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                                u.isEmailVerified
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {u.isEmailVerified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {formatDateTime(u.createdAt)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {formatDateTime(u.lastLoginAt)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {canManageThisUser ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() => handleEditClick(u)}
                                    variant="outline"
                                    size="sm"
                                    className="text-mint-primary-blue border-mint-primary-blue hover:bg-mint-primary-blue hover:text-white"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteClick(u)}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-mint-dark-text/50">View only</span>
                              )}
                            </td>
                          </tr>
                        );
                        })}
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
