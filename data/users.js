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
  // Generate email verification token if not provided
  const emailVerificationToken = userData.emailVerificationToken || generateEmailVerificationToken();
  
  const newUser = {
    userId: users.length > 0 
      ? Math.max(...users.map(u => u.userId)) + 1 
      : 1,
    username: userData.username,
    email: userData.email,
    password: userData.password || userData.passwordHash, // Store password (in production, hash it)
    officialUnitId: userData.officialUnitId || null,
    role: userData.role,
    passwordHash: userData.passwordHash || 'hashed_password_placeholder', // In real app, hash the password
    emailVerificationToken: emailVerificationToken,
    isEmailVerified: false,
    isAccountLocked: false,
    isTwoFactorEnabled: false,
    phoneNumber: userData.phoneNumber || null,
    twoFactorSecret: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // In production, send verification email
  // For demo, log the verification link
  console.log(`Email verification link for ${newUser.email}: /verify-email?token=${emailVerificationToken}&userId=${newUser.userId}`);
  
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

// Generate email verification token
export const generateEmailVerificationToken = () => {
  // Generate a secure random token
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
};

// Get email verification link for a user
export const getEmailVerificationLink = (userId) => {
  const user = getUserById(userId);
  if (!user || !user.emailVerificationToken) {
    return null;
  }
  
  // In production, this would be the full URL
  // For demo, return relative path
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/verify-email?token=${user.emailVerificationToken}&userId=${userId}`;
  }
  return `/verify-email?token=${user.emailVerificationToken}&userId=${userId}`;
};

// Resend email verification (generate new token)
export const resendEmailVerification = (email) => {
  const user = getUserByEmail(email);
  if (!user) {
    // Don't reveal if user exists for security
    return { success: true };
  }
  
  if (user.isEmailVerified) {
    return { success: false, error: 'Email is already verified' };
  }
  
  // Generate new verification token
  const newToken = generateEmailVerificationToken();
  updateUser(user.userId, {
    emailVerificationToken: newToken
  });
  
  // In production, send email
  // For demo, log the link
  const link = typeof window !== 'undefined' 
    ? `${window.location.origin}/verify-email?token=${newToken}&userId=${user.userId}`
    : `/verify-email?token=${newToken}&userId=${user.userId}`;
  console.log(`Email verification link for ${email}: ${link}`);
  
  return { success: true, link, userId: user.userId };
};

// Verify email with token
export const verifyEmail = (userId, token) => {
  const user = getUserById(userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  if (user.emailVerificationToken !== token) {
    return { success: false, error: 'Invalid verification token' };
  }
  
  // Check if token is expired (24 hours)
  const tokenAge = Date.now() - parseInt(token.split('_')[1]);
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  if (tokenAge > maxAge) {
    return { success: false, error: 'Verification token has expired' };
  }
  
  // Verify email
  updateUser(userId, {
    isEmailVerified: true,
    emailVerificationToken: null
  });
  
  return { success: true };
};

// Generate password reset token
export const generatePasswordResetToken = (email) => {
  const user = getUserByEmail(email);
  if (!user) {
    // Don't reveal if user exists for security
    return { success: true };
  }
  
  const token = `prt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
  
  updateUser(user.userId, {
    passwordResetToken: token,
    passwordResetExpires: expiresAt
  });
  
  // In production, send email with reset link
  // For demo, we'll log it (in real app, send via email service)
  console.log(`Password reset link for ${email}: /reset-password?token=${token}&userId=${user.userId}`);
  
  return { success: true, token, userId: user.userId };
};

// Validate password reset token
export const validatePasswordResetToken = (userId, token) => {
  const user = getUserById(userId);
  if (!user || !user.passwordResetToken) {
    return { valid: false, error: 'Invalid reset token' };
  }
  
  if (user.passwordResetToken !== token) {
    return { valid: false, error: 'Invalid reset token' };
  }
  
  // Check if token is expired
  if (new Date(user.passwordResetExpires) < new Date()) {
    return { valid: false, error: 'Reset token has expired' };
  }
  
  return { valid: true };
};

// Reset password with token
export const resetPassword = (userId, token, newPassword) => {
  const validation = validatePasswordResetToken(userId, token);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  // Validate password complexity
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return { success: false, error: passwordValidation.errors[0] };
  }
  
  // Update password and clear reset token
  updateUser(userId, {
    password: newPassword, // In production, hash this
    passwordResetToken: null,
    passwordResetExpires: null
  });
  
  return { success: true };
};

// Generate OTP for 2FA
export const generateOTP = () => {
  // Generate 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP for user (in production, use Redis or similar with expiration)
const otpStore = new Map(); // userId -> { otp, expiresAt }

// Send OTP via SMS (mock implementation)
export const sendOTP = (phoneNumber, userId) => {
  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  
  otpStore.set(userId, { otp, expiresAt });
  
  // In production, integrate with SMS gateway
  // For demo, log the OTP
  console.log(`OTP for user ${userId} (${phoneNumber}): ${otp}`);
  
  return { success: true, otp }; // In production, don't return OTP
};

// Verify OTP
export const verifyOTP = (userId, inputOTP) => {
  const stored = otpStore.get(userId);
  if (!stored) {
    return { valid: false, error: 'No OTP found. Please request a new one.' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(userId);
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }
  
  if (stored.otp !== inputOTP) {
    return { valid: false, error: 'Invalid OTP' };
  }
  
  // OTP is valid, remove it
  otpStore.delete(userId);
  return { valid: true };
};

// Enable 2FA for user
export const enable2FA = (userId, phoneNumber) => {
  const user = getUserById(userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  // Validate phone number format (basic validation)
  if (!phoneNumber || phoneNumber.trim().length < 10) {
    return { success: false, error: 'Invalid phone number' };
  }
  
  updateUser(userId, {
    isTwoFactorEnabled: true,
    phoneNumber: phoneNumber.trim()
  });
  
  return { success: true };
};

// Disable 2FA for user
export const disable2FA = (userId) => {
  const user = getUserById(userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  updateUser(userId, {
    isTwoFactorEnabled: false,
    twoFactorSecret: null
  });
  
  return { success: true };
};

