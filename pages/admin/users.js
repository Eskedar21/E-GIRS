import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUnits, UNIT_TYPES } from '../../data/administrativeUnits';
import {
  getAllUsers,
  createUser,
  isUsernameUnique,
  isEmailUnique,
  validatePassword,
  getRolesForUnitType,
  USER_ROLES
} from '../../data/users';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    officialUnitId: '',
    role: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setUsers(getAllUsers());
    setUnits(getAllUnits());
  }, []);

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
    
    // Reset role when unit changes
    if (name === 'officialUnitId') {
      setFormData(prev => ({
        ...prev,
        role: ''
      }));
    }
  };

  const getSelectedUnit = () => {
    if (!formData.officialUnitId) return null;
    return units.find(unit => unit.unitId === parseInt(formData.officialUnitId));
  };

  const getAvailableRoles = () => {
    const selectedUnit = getSelectedUnit();
    if (selectedUnit) {
      return getRolesForUnitType(selectedUnit.unitType);
    }
    // If no unit selected, show central roles
    return getRolesForUnitType(null);
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!isUsernameUnique(formData.username)) {
      newErrors.username = 'Username already exists';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    } else if (!isEmailUnique(formData.email)) {
      newErrors.email = 'Email already exists';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Unit validation (required for non-central roles)
    const selectedUnit = getSelectedUnit();
    const availableRoles = getAvailableRoles();
    const isCentralRole = [USER_ROLES.CENTRAL_COMMITTEE_MEMBER, USER_ROLES.CHAIRMAN, USER_ROLES.SECRETARY].includes(formData.role);
    
    if (!isCentralRole && !formData.officialUnitId) {
      newErrors.officialUnitId = 'Administrative Unit is required for this role';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newUser = createUser({
      username: formData.username.trim(),
      email: formData.email.trim(),
      officialUnitId: formData.officialUnitId ? parseInt(formData.officialUnitId) : null,
      role: formData.role,
      phoneNumber: formData.phoneNumber || null,
      emailVerificationToken: `token_${Date.now()}` // In real app, generate secure token
    });

    setUsers(getAllUsers());
    setSuccessMessage(`User "${newUser.username}" has been created successfully! An email verification link has been sent.`);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      officialUnitId: '',
      role: '',
      phoneNumber: ''
    });
    setShowCreateForm(false);
    
    setTimeout(() => setSuccessMessage(''), 5000);
  };

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
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  {showCreateForm ? 'Cancel' : '+ Create New User'}
                </button>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {successMessage}
              </div>
            )}

            {/* Create User Form */}
            {showCreateForm && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-mint-medium-gray">
                <h2 className="text-2xl font-semibold text-mint-primary-blue mb-6">
                  Create New User
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="username" className="block text-sm font-semibold text-mint-dark-text mb-2">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue ${
                          errors.username ? 'border-red-500' : 'border-mint-medium-gray'
                        }`}
                        placeholder="Enter username"
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-mint-dark-text mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue ${
                          errors.email ? 'border-red-500' : 'border-mint-medium-gray'
                        }`}
                        placeholder="user@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-mint-dark-text mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue ${
                          errors.password ? 'border-red-500' : 'border-mint-medium-gray'
                        }`}
                        placeholder="Enter password"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                      )}
                      <p className="mt-1 text-xs text-mint-dark-text/60">
                        Must be at least 8 characters with uppercase, lowercase, number, and special character
                      </p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-mint-dark-text mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue ${
                          errors.confirmPassword ? 'border-red-500' : 'border-mint-medium-gray'
                        }`}
                        placeholder="Confirm password"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="officialUnitId" className="block text-sm font-semibold text-mint-dark-text mb-2">
                        Administrative Unit
                        {getSelectedUnit() && getSelectedUnit().unitType !== 'Federal Institute' && 
                          getSelectedUnit().unitType !== 'Region' && 
                          getSelectedUnit().unitType !== 'City Administration' ? (
                          <span className="text-red-500">*</span>
                        ) : (
                          <span className="text-mint-dark-text/60"> (Optional for Central Roles)</span>
                        )}
                      </label>
                      <select
                        id="officialUnitId"
                        name="officialUnitId"
                        value={formData.officialUnitId}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue ${
                          errors.officialUnitId ? 'border-red-500' : 'border-mint-medium-gray'
                        }`}
                      >
                        <option value="">Select Administrative Unit (Optional for Central Roles)</option>
                        {units.map((unit) => (
                          <option key={unit.unitId} value={unit.unitId}>
                            {unit.officialUnitName} ({unit.unitType})
                          </option>
                        ))}
                      </select>
                      {errors.officialUnitId && (
                        <p className="mt-1 text-sm text-red-500">{errors.officialUnitId}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-semibold text-mint-dark-text mb-2">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        disabled={!formData.officialUnitId && getAvailableRoles().length === 0}
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue disabled:bg-gray-100 ${
                          errors.role ? 'border-red-500' : 'border-mint-medium-gray'
                        }`}
                      >
                        <option value="">Select Role</option>
                        {getAvailableRoles().map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      {errors.role && (
                        <p className="mt-1 text-sm text-red-500">{errors.role}</p>
                      )}
                      {formData.officialUnitId && getAvailableRoles().length === 0 && (
                        <p className="mt-1 text-sm text-yellow-600">
                          No roles available for this unit type. Please select a different unit.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-semibold text-mint-dark-text mb-2">
                      Phone Number (Optional - for 2FA)
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                      placeholder="+251 9XX XXX XXX"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setFormData({
                          username: '',
                          email: '',
                          password: '',
                          confirmPassword: '',
                          officialUnitId: '',
                          role: '',
                          phoneNumber: ''
                        });
                        setErrors({});
                      }}
                      className="px-6 py-2 border border-mint-medium-gray rounded-lg text-mint-dark-text hover:bg-mint-light-gray transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold rounded-lg transition-colors"
                    >
                      Save User
                    </button>
                  </div>
                </form>
              </div>
            )}

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

