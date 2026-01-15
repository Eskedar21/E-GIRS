import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Sidebar from '../../../components/Sidebar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import { getAllUnits } from '../../../data/administrativeUnits';
import {
  createUser,
  isUsernameUnique,
  isEmailUnique,
  validatePassword,
  getRolesForUnitType,
  getEmailVerificationLink,
  USER_ROLES
} from '../../../data/users';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';

export default function CreateUser() {
  const router = useRouter();
  const { user } = useAuth();
  const [units, setUnits] = useState([]);
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
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
    // If current user is Chairman (CC), they can only create Central Committee Member and Secretary
    if (user && user.role === 'Chairman (CC)') {
      return [USER_ROLES.CENTRAL_COMMITTEE_MEMBER, USER_ROLES.SECRETARY];
    }
    
    // If current user is Super Admin or MInT Admin, they can create any role
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
    const isCentralRole = [USER_ROLES.CENTRAL_COMMITTEE_MEMBER, USER_ROLES.CHAIRMAN, USER_ROLES.SECRETARY].includes(formData.role);
    
    // Chairman can create Central Committee Members and Secretary without unit assignment
    if (user?.role === 'Chairman (CC)') {
      // No unit required for roles created by Chairman
    } else if (!isCentralRole && !formData.officialUnitId) {
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
      password: formData.password, // In production, hash this
      officialUnitId: formData.officialUnitId ? parseInt(formData.officialUnitId) : null,
      role: formData.role,
      phoneNumber: formData.phoneNumber || null
      // emailVerificationToken is auto-generated by createUser
    });

    // Get verification link for display (demo only)
    const verificationLink = getEmailVerificationLink(newUser.userId);
    const linkMessage = verificationLink 
      ? `\n\nEmail Verification Link (Demo):\n${verificationLink}\n\nNote: In production, this link would be sent via email.`
      : '';
    
    setSuccessMessage(`User "${newUser.username}" has been created successfully! An email verification link has been sent.${linkMessage}`);
    
    // Redirect to users list after 2 seconds
    setTimeout(() => {
      router.push('/admin/users');
    }, 2000);
  };

  const handleCancel = () => {
    router.push('/admin/users');
  };

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'MInT Admin', 'Chairman (CC)']}>
      <Layout title="Create New User">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                    User Management
                  </h1>
                  <p className="text-mint-dark-text/70">Create and manage user accounts with role-based access</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-mint-medium-gray"
                >
                  Cancel
                </Button>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {successMessage}
                </div>
              )}

              {/* Create User Form */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-mint-primary-blue">
                    Create New User
                  </CardTitle>
                  <CardDescription>
                    {user?.role === 'Chairman (CC)' 
                      ? 'Create accounts for Central Committee Members and Secretary'
                      : 'Fill in the required information to create a new user account'}
                  </CardDescription>
                  {user?.role === 'Chairman (CC)' && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> As Chairman, you can create accounts for <strong>Central Committee Members</strong> and <strong>Secretary (CC)</strong> only.
                      </p>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="username" className="mb-2">
                          Username <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className={errors.username ? 'border-red-500' : ''}
                          placeholder="Enter username"
                        />
                        {errors.username && (
                          <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email" className="mb-2">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={errors.email ? 'border-red-500' : ''}
                          placeholder="user@example.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="password" className="mb-2">
                          Password <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                            placeholder="Enter password"
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
                        <p className="mt-1 text-xs text-mint-dark-text/60">
                          Must be at least 8 characters with uppercase, lowercase, number, and special character
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="mb-2">
                          Confirm Password <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                            placeholder="Confirm password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            {showConfirmPassword ? (
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
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="officialUnitId" className="mb-2">
                          Administrative Unit
                          {user?.role === 'Chairman (CC)' ? (
                            <span className="text-mint-dark-text/60"> (Not required for Central Committee roles)</span>
                          ) : getSelectedUnit() && getSelectedUnit().unitType !== 'Federal Institute' && 
                            getSelectedUnit().unitType !== 'Region' && 
                            getSelectedUnit().unitType !== 'City Administration' ? (
                            <span className="text-red-500">*</span>
                          ) : (
                            <span className="text-mint-dark-text/60"> (Optional for Central Roles)</span>
                          )}
                        </Label>
                        <Select
                          id="officialUnitId"
                          name="officialUnitId"
                          value={formData.officialUnitId}
                          onChange={handleInputChange}
                          className={errors.officialUnitId ? 'border-red-500' : ''}
                          disabled={user?.role === 'Chairman (CC)'}
                        >
                          <option value="">{user?.role === 'Chairman (CC)' ? 'Not required for Central Committee roles' : 'Select Administrative Unit (Optional for Central Roles)'}</option>
                          {units.map((unit) => (
                            <option key={unit.unitId} value={unit.unitId}>
                              {unit.officialUnitName} ({unit.unitType})
                            </option>
                          ))}
                        </Select>
                        {errors.officialUnitId && (
                          <p className="mt-1 text-sm text-red-500">{errors.officialUnitId}</p>
                        )}
                        {user?.role === 'Chairman (CC)' && (
                          <p className="mt-1 text-xs text-mint-dark-text/60">
                            Central Committee Members and Secretary do not require an administrative unit assignment.
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="role" className="mb-2">
                          Role <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          disabled={user?.role === 'Chairman (CC)' ? false : (!formData.officialUnitId && getAvailableRoles().length === 0)}
                          className={errors.role ? 'border-red-500' : ''}
                        >
                          <option value="">Select Role</option>
                          {getAvailableRoles().map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </Select>
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
                      <Label htmlFor="phoneNumber" className="mb-2">
                        Phone Number (Optional - for 2FA)
                      </Label>
                      <Input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+251 9XX XXX XXX"
                      />
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-mint-secondary-blue hover:bg-mint-primary-blue"
                      >
                        Save User
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

