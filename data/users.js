// Users Data Store with localStorage persistence
// This will be replaced with a database in production

const STORAGE_KEY = 'egirs_users';

// Default users (only used if localStorage is empty)
const defaultUsers = [
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
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
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
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    userId: 3,
    username: 'approver1',
    email: 'addis.approver@addisababa.gov.et',
    password: 'Approver123!',
    officialUnitId: 10, // Addis Ababa City Administration
    role: 'Regional Approver',
    isEmailVerified: true,
    isAccountLocked: false,
    isTwoFactorEnabled: false,
    phoneNumber: null,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
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
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    userId: 6,
    username: 'amhara_approver',
    email: 'amhara.approver@amhara.gov.et',
    password: 'Amhara123!',
    officialUnitId: 21, // Amhara Region
    role: 'Regional Approver',
    isEmailVerified: true,
    isAccountLocked: false,
    isTwoFactorEnabled: false,
    phoneNumber: null,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    userId: 7,
    username: 'institute_contributor',
    email: 'institute.contributor@health.gov.et',
    password: 'Institute123!',
    officialUnitId: 2, // Ministry of Health
    role: 'Institute Data Contributor',
    isEmailVerified: true,
    isAccountLocked: false,
    isTwoFactorEnabled: false,
    phoneNumber: null,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    userId: 9,
    username: 'federal_approver',
    email: 'federal.approver@health.gov.et',
    password: 'FederalApp123!',
    officialUnitId: 2, // Ministry of Health
    role: 'Federal Approver',
    isEmailVerified: true,
    isAccountLocked: false,
    isTwoFactorEnabled: false,
    phoneNumber: null,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    userId: 10,
    username: 'chairman',
    email: 'chairman@mint.gov.et',
    password: 'Chairman123!',
    officialUnitId: null,
    role: 'Chairman (CC)',
    isEmailVerified: true,
    isAccountLocked: false,
    isTwoFactorEnabled: false,
    phoneNumber: null,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    userId: 11,
    username: 'secretary',
    email: 'secretary@mint.gov.et',
    password: 'Secretary123!',
    officialUnitId: null,
    role: 'Secretary (CC)',
    isEmailVerified: true,
    isAccountLocked: false,
    isTwoFactorEnabled: false,
    phoneNumber: null,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
];

// Load users from localStorage or use defaults
const loadUsers = () => {
  if (typeof window === 'undefined') {
    // Server-side: return defaults
    return [...defaultUsers];
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all users have required fields
      let storedUsers = parsed.map(user => ({
        ...user,
        emailVerificationToken: user.emailVerificationToken || null,
        passwordResetToken: user.passwordResetToken || null,
        passwordResetExpires: user.passwordResetExpires || null,
        isEmailVerified: user.isEmailVerified !== undefined ? user.isEmailVerified : false,
        isAccountLocked: user.isAccountLocked !== undefined ? user.isAccountLocked : false,
        isTwoFactorEnabled: user.isTwoFactorEnabled !== undefined ? user.isTwoFactorEnabled : false,
      }));
      
      // Merge with default users - update existing users from defaults and add new ones
      const defaultUserIds = new Set(defaultUsers.map(u => u.userId));
      const defaultUsernames = new Set(defaultUsers.map(u => u.username));
      const storedUserIds = new Set(storedUsers.map(u => u.userId));
      const storedUsernames = new Set(storedUsers.map(u => u.username));
      
      // Separate stored users into: default users (to be updated) and custom users (to be preserved)
      const defaultStoredUsers = storedUsers.filter(storedUser => 
        defaultUserIds.has(storedUser.userId) || defaultUsernames.has(storedUser.username)
      );
      const customStoredUsers = storedUsers.filter(storedUser => 
        !defaultUserIds.has(storedUser.userId) && !defaultUsernames.has(storedUser.username)
      );
      
      // Update existing default users from defaults (to ensure password and other fields are correct)
      const updatedDefaultUsers = defaultStoredUsers.map(storedUser => {
        const defaultUser = defaultUsers.find(du => du.userId === storedUser.userId || du.username === storedUser.username);
        if (defaultUser) {
          // Merge: keep stored user's data but update with default user's password and critical fields
          return {
            ...storedUser,
            password: defaultUser.password, // Always use default password
            role: defaultUser.role, // Always use default role
            email: defaultUser.email, // Always use default email
            officialUnitId: defaultUser.officialUnitId, // Always use default unit
            isEmailVerified: defaultUser.isEmailVerified !== undefined ? defaultUser.isEmailVerified : storedUser.isEmailVerified,
            isAccountLocked: defaultUser.isAccountLocked !== undefined ? defaultUser.isAccountLocked : storedUser.isAccountLocked,
            isTwoFactorEnabled: defaultUser.isTwoFactorEnabled !== undefined ? defaultUser.isTwoFactorEnabled : storedUser.isTwoFactorEnabled,
          };
        }
        return storedUser;
      });
      
      // Add new users from defaults that don't exist in stored
      const newUsersFromDefaults = defaultUsers.filter(du => 
        !storedUserIds.has(du.userId) && !storedUsernames.has(du.username)
      );
      
      // Combine: updated default users + custom stored users (newly created) + new default users
      const finalUsers = [...updatedDefaultUsers, ...customStoredUsers, ...newUsersFromDefaults];
      
      // Always save to ensure localStorage is synced with defaults
      saveUsers(finalUsers);
      
      return finalUsers;
    }
  } catch (error) {
    console.error('Error loading users from localStorage:', error);
  }
  
  // Initialize with defaults if no stored data
  saveUsers(defaultUsers);
  return [...defaultUsers];
};

// Save users to localStorage
const saveUsers = (usersToSave) => {
  if (typeof window === 'undefined') {
    return; // Server-side: skip
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usersToSave));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
};

// Initialize users array
let users = loadUsers();

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
  INSTITUTE_ADMIN: 'Institute Admin'
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
  // Reload from storage to ensure we have latest data
  users = loadUsers();
  return [...users];
};

// Get user by ID
export const getUserById = (userId) => {
  users = loadUsers(); // Reload to ensure latest data
  return users.find(user => user.userId === userId);
};

// Get user by username
export const getUserByUsername = (username) => {
  users = loadUsers(); // Reload to ensure latest data
  return users.find(user => user.username === username);
};

// Get user by email
export const getUserByEmail = (email) => {
  users = loadUsers(); // Reload to ensure latest data
  return users.find(user => user.email === email);
};

// Check if username is unique
export const isUsernameUnique = (username, excludeUserId = null) => {
  users = loadUsers(); // Reload to ensure latest data
  const existing = users.find(user => 
    user.username === username && 
    (excludeUserId === null || user.userId !== excludeUserId)
  );
  return !existing;
};

// Check if email is unique
export const isEmailUnique = (email, excludeUserId = null) => {
  users = loadUsers(); // Reload to ensure latest data
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
  // Reload users from localStorage to ensure we have the latest data
  users = loadUsers();
  
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
  
  // Save to localStorage
  saveUsers(users);
  
  // In production, send verification email
  // For demo, log the verification link
  const encodedToken = encodeURIComponent(emailVerificationToken);
  const link = typeof window !== 'undefined' 
    ? `${window.location.origin}/verify-email?token=${encodedToken}&userId=${newUser.userId}`
    : `/verify-email?token=${encodedToken}&userId=${newUser.userId}`;
  console.log(`Email verification link for ${newUser.email}: ${link}`);
  
  return newUser;
};

// Update a user
export const updateUser = (userId, userData) => {
  users = loadUsers(); // Reload to ensure latest data
  const index = users.findIndex(user => user.userId === userId);
  if (index !== -1) {
    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    // Save to localStorage
    saveUsers(users);
    return users[index];
  }
  return null;
};

// Delete a user
export const deleteUser = (userId) => {
  users = loadUsers(); // Reload to ensure latest data
  const index = users.findIndex(user => user.userId === userId);
  if (index !== -1) {
    const deleted = users.splice(index, 1)[0];
    // Save to localStorage
    saveUsers(users);
    return deleted;
  }
  return null;
};

// Get users by unit
export const getUsersByUnit = (unitId) => {
  users = loadUsers(); // Reload to ensure latest data
  return users.filter(user => user.officialUnitId === unitId);
};

// Get users by role
export const getUsersByRole = (role) => {
  users = loadUsers(); // Reload to ensure latest data
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
  
  // Encode the token for URL
  const encodedToken = encodeURIComponent(user.emailVerificationToken);
  
  // In production, this would be the full URL
  // For demo, return relative path
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/verify-email?token=${encodedToken}&userId=${userId}`;
  }
  return `/verify-email?token=${encodedToken}&userId=${userId}`;
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
  users = loadUsers(); // Reload to ensure latest data
  const userIndex = users.findIndex(u => u.userId === user.userId);
  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      emailVerificationToken: newToken,
      updatedAt: new Date().toISOString()
    };
    saveUsers(users);
  }
  
  // In production, send email
  // For demo, log the link
  const encodedToken = encodeURIComponent(newToken);
  const link = typeof window !== 'undefined' 
    ? `${window.location.origin}/verify-email?token=${encodedToken}&userId=${user.userId}`
    : `/verify-email?token=${encodedToken}&userId=${user.userId}`;
  console.log(`Email verification link for ${email}: ${link}`);
  
  return { success: true, link, userId: user.userId };
};

// Verify email with token
export const verifyEmail = (userId, token) => {
  try {
    // Parse userId to integer
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return { success: false, error: 'Invalid user ID' };
    }
    
    // Decode URL-encoded token if needed
    let decodedToken = token;
    try {
      decodedToken = decodeURIComponent(token);
    } catch (e) {
      // Token might not be encoded, use as-is
      decodedToken = token;
    }
    
    const user = getUserById(parsedUserId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Check if already verified - return success if already verified
    if (user.isEmailVerified) {
      return { success: true, message: 'Email is already verified' };
    }
    
    if (!user.emailVerificationToken) {
      return { success: false, error: 'No verification token found. Please request a new verification link.' };
    }
    
    // Compare tokens (handle both encoded and decoded, and exact match)
    // Try multiple decoding strategies to handle URL encoding
    const storedToken = user.emailVerificationToken;
    let tokensMatch = false;
    
    // Try exact match first
    if (storedToken === decodedToken || storedToken === token) {
      tokensMatch = true;
    } else {
      // Try decoding the stored token as well (in case it was stored encoded)
      try {
        const decodedStoredToken = decodeURIComponent(storedToken);
        if (decodedStoredToken === decodedToken || decodedStoredToken === token) {
          tokensMatch = true;
        }
      } catch (e) {
        // If decoding fails, tokens don't match
      }
      
      // Try encoding the received token
      if (!tokensMatch) {
        try {
          const encodedReceivedToken = encodeURIComponent(token);
          if (storedToken === encodedReceivedToken) {
            tokensMatch = true;
          }
        } catch (e) {
          // If encoding fails, tokens don't match
        }
      }
    }
    
    if (!tokensMatch) {
      // Debug logging (remove in production)
      console.log('Token mismatch:', {
        stored: storedToken,
        received: token,
        decoded: decodedToken
      });
      return { success: false, error: 'Invalid verification token. The link may have been used already or is incorrect.' };
    }
    
    // Check if token is expired (24 hours)
    // Token format: evt_timestamp_random
    const tokenParts = decodedToken.split('_');
    if (tokenParts.length < 2 || tokenParts[0] !== 'evt') {
      return { success: false, error: 'Invalid token format' };
    }
    
    const tokenTimestamp = parseInt(tokenParts[1]);
    if (isNaN(tokenTimestamp)) {
      return { success: false, error: 'Invalid token format' };
    }
    
    const tokenAge = Date.now() - tokenTimestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (tokenAge > maxAge) {
      return { success: false, error: 'Verification token has expired. Please request a new verification link.' };
    }
    
    // Verify email and save
    users = loadUsers(); // Reload to ensure latest data
    const userIndex = users.findIndex(u => u.userId === user.userId);
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        isEmailVerified: true,
        emailVerificationToken: null,
        updatedAt: new Date().toISOString()
      };
      saveUsers(users);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error: 'An error occurred during verification. Please try again.' };
  }
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

// Utility function to ensure institute_contributor account exists
export const ensureInstituteContributorExists = () => {
  users = loadUsers(); // Reload to ensure latest data
  
  // Check if user already exists
  const existingUser = getUserByUsername('institute_contributor');
  if (existingUser) {
    console.log('Institute Contributor account already exists:', existingUser);
    return existingUser;
  }
  
  // Create the account if it doesn't exist
  const newUser = createUser({
    username: 'institute_contributor',
    email: 'institute.contributor@health.gov.et',
    password: 'Institute123!',
    officialUnitId: 2, // Ministry of Health
    role: 'Institute Data Contributor',
    phoneNumber: null
  });
  
  // Set email as verified for convenience
  updateUser(newUser.userId, { isEmailVerified: true });
  
  console.log('Institute Contributor account created successfully:', newUser);
  return newUser;
};

