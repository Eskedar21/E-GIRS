// Users Data Store
// This will be replaced with a database in production

let users = [
  // Example users - In production, passwords would be hashed
  {
    userId: 1,
    username: 'admin',
    email: 'admin@mint.gov.et',
    password: 'Admin123!', // Default password for demo
    officialUnitId: null,
    role: 'MInT Admin',
    isEmailVerified: true,
    isAccountLocked: false,
    isTwoFactorEnabled: false,
    phoneNumber: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    userId: 2,
    username: 'contributor1',
    email: 'contributor@example.gov.et',
    password: 'Contributor123!',
    officialUnitId: 10, // Woreda 1
    role: 'Data Contributor',
    isEmailVerified: true,
    isAccountLocked: false,
    isTwoFactorEnabled: false,
    phoneNumber: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    userId: 3,
    username: 'approver1',
    email: 'approver@example.gov.et',
    password: 'Approver123!',
    officialUnitId: 3, // Addis Ababa City Administration
    role: 'Regional Approver',
    isEmailVerified: true,
    isAccountLocked: false,
    isTwoFactorEnabled: false,
    phoneNumber: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    userId: 4,
    username: 'committee1',
    email: 'committee@mint.gov.et',
    password: 'Committee123!',
    officialUnitId: null,
    role: 'Central Committee Member',
    isEmailVerified: true,
    isAccountLocked: false,
    isTwoFactorEnabled: false,
    phoneNumber: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

// User Roles
export const USER_ROLES = {
  // Regional/Assessment roles
  DATA_CONTRIBUTOR: 'Data Contributor',
  REGIONAL_APPROVER: 'Regional Approver',
  
  // Federal Institute roles
  INSTITUTE_DATA_CONTRIBUTOR: 'Institute Data Contributor',
  FEDERAL_APPROVER: 'Federal Approver',
  
  // Central roles (no unit required)
  CENTRAL_COMMITTEE_MEMBER: 'Central Committee Member',
  CHAIRMAN: 'Chairman (CC)',
  SECRETARY: 'Secretary (CC)',
  
  // Admin roles
  SUPER_ADMIN: 'Super Admin',
  MINT_ADMIN: 'MInT Admin',
  REGIONAL_ADMIN: 'Regional Admin',
  INSTITUTE_ADMIN: 'Institute Admin',
  INITIAL_APPROVER: 'Initial Approver'
};

// Get roles based on unit type
export const getRolesForUnitType = (unitType) => {
  if (!unitType) {
    // Central roles (no unit required)
    return [
      USER_ROLES.CENTRAL_COMMITTEE_MEMBER,
      USER_ROLES.CHAIRMAN,
      USER_ROLES.SECRETARY
    ];
  }
  
  switch (unitType) {
    case 'Federal Institute':
      return [
        USER_ROLES.INSTITUTE_DATA_CONTRIBUTOR,
        USER_ROLES.FEDERAL_APPROVER
      ];
    case 'Region':
    case 'City Administration':
    case 'Zone':
    case 'Sub-city':
    case 'Woreda':
      return [
        USER_ROLES.DATA_CONTRIBUTOR,
        USER_ROLES.REGIONAL_APPROVER
      ];
    default:
      return [];
  }
};

// Get all users
export const getAllUsers = () => {
  return [...users];
};

// Get user by ID
export const getUserById = (userId) => {
  return users.find(user => user.userId === userId);
};

// Get user by username
export const getUserByUsername = (username) => {
  return users.find(user => user.username === username);
};

// Get user by email
export const getUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

// Check if username is unique
export const isUsernameUnique = (username, excludeUserId = null) => {
  const existing = users.find(user => 
    user.username === username && 
    (excludeUserId === null || user.userId !== excludeUserId)
  );
  return !existing;
};

// Check if email is unique
export const isEmailUnique = (email, excludeUserId = null) => {
  const existing = users.find(user => 
    user.email === email && 
    (excludeUserId === null || user.userId !== excludeUserId)
  );
  return !existing;
};

// Validate password complexity
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Create a new user
export const createUser = (userData) => {
  const newUser = {
    userId: users.length > 0 
      ? Math.max(...users.map(u => u.userId)) + 1 
      : 1,
    username: userData.username,
    email: userData.email,
    officialUnitId: userData.officialUnitId || null,
    role: userData.role,
    passwordHash: userData.passwordHash || 'hashed_password_placeholder', // In real app, hash the password
    emailVerificationToken: userData.emailVerificationToken || null,
    isEmailVerified: false,
    isAccountLocked: false,
    isTwoFactorEnabled: false,
    phoneNumber: userData.phoneNumber || null,
    twoFactorSecret: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  return newUser;
};

// Update a user
export const updateUser = (userId, userData) => {
  const index = users.findIndex(user => user.userId === userId);
  if (index !== -1) {
    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    return users[index];
  }
  return null;
};

// Delete a user
export const deleteUser = (userId) => {
  const index = users.findIndex(user => user.userId === userId);
  if (index !== -1) {
    const deleted = users.splice(index, 1)[0];
    return deleted;
  }
  return null;
};

// Get users by unit
export const getUsersByUnit = (unitId) => {
  return users.filter(user => user.officialUnitId === unitId);
};

// Get users by role
export const getUsersByRole = (role) => {
  return users.filter(user => user.role === role);
};

// Validate password for login (simple check for demo - in production use proper hashing)
export const checkPassword = (inputPassword, userPassword) => {
  // In production, this would compare hashed passwords
  return inputPassword === userPassword;
};

