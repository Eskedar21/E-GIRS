import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserByUsername, checkPassword } from '../data/users';
import { getUnitById } from '../data/administrativeUnits';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('egirs_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        localStorage.removeItem('egirs_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    const userData = getUserByUsername(username);
    
    if (!userData) {
      throw new Error('Invalid username or password');
    }

    if (!checkPassword(password, userData.password)) {
      throw new Error('Invalid username or password');
    }

    if (userData.isAccountLocked) {
      throw new Error('Account is locked. Please contact administrator.');
    }

    // Check email verification
    if (!userData.isEmailVerified) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    // Check if 2FA is enabled - MUST verify OTP before login
    if (userData.isTwoFactorEnabled && userData.phoneNumber) {
      // Store temporary login state for 2FA verification
      // This ensures password is correct but login is not complete until OTP is verified
      const tempSession = {
        userId: userData.userId,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        officialUnitId: userData.officialUnitId,
        pending2FA: true,
        passwordVerified: true, // Mark that password was verified
        timestamp: Date.now() // Store timestamp for security (expire after 10 minutes)
      };
      localStorage.setItem('egirs_pending_2fa', JSON.stringify(tempSession));
      throw new Error('2FA_REQUIRED');
    }

    // Get unit information if user has a unit
    let unitInfo = null;
    if (userData.officialUnitId) {
      unitInfo = getUnitById(userData.officialUnitId);
    }

    const userSession = {
      userId: userData.userId,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      officialUnitId: userData.officialUnitId,
      unitInfo: unitInfo,
      unitType: unitInfo ? unitInfo.unitType : null
    };

    localStorage.setItem('egirs_user', JSON.stringify(userSession));
    localStorage.removeItem('egirs_pending_2fa');
    setUser(userSession);
    return userSession;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('egirs_user');
    setUser(null);
    // Router navigation will be handled by the component calling logout
  }, []);

  const hasRole = useCallback((allowedRoles) => {
    if (!user) return false;
    if (allowedRoles.includes('all')) return true;
    return allowedRoles.includes(user.role);
  }, [user]);

  const refreshUser = useCallback(() => {
    // Refresh user from localStorage
    const storedUser = localStorage.getItem('egirs_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        return userData;
      } catch (e) {
        localStorage.removeItem('egirs_user');
        setUser(null);
        return null;
      }
    } else {
      setUser(null);
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

