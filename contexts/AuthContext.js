import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getUserByUsername, checkPassword, recordLastLogin } from '../data/users';
import { getUnitById } from '../data/administrativeUnits';

const AuthContext = createContext();

/** Session timeout: 30 minutes of inactivity */
const SESSION_TIMEOUT_MS = 5 * 60 * 1000;
const ACTIVITY_THROTTLE_MS = 60 * 1000;

function isSessionExpired(session) {
  if (!session) return true;
  const lastActivity = session.lastActivityAt ?? session.sessionStoredAt;
  if (!lastActivity) return true;
  return Date.now() - lastActivity > SESSION_TIMEOUT_MS;
}

function withSessionTimestamps(session) {
  const now = Date.now();
  return { ...session, sessionStoredAt: now, lastActivityAt: now };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastActivityUpdate = useRef(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('egirs_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (isSessionExpired(userData)) {
          localStorage.removeItem('egirs_user');
          setUser(null);
        } else {
          setUser(userData);
        }
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

    recordLastLogin(userData.userId);

    const userSession = withSessionTimestamps({
      userId: userData.userId,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      officialUnitId: userData.officialUnitId,
      unitInfo: unitInfo,
      unitType: unitInfo ? unitInfo.unitType : null
    });

    localStorage.setItem('egirs_user', JSON.stringify(userSession));
    localStorage.removeItem('egirs_pending_2fa');
    setUser(userSession);
    return userSession;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('egirs_user');
    setUser(null);
  }, []);

  const logoutIfExpired = useCallback(() => {
    const stored = localStorage.getItem('egirs_user');
    if (!stored) return false;
    try {
      const data = JSON.parse(stored);
      if (isSessionExpired(data)) {
        localStorage.removeItem('egirs_user');
        setUser(null);
        return true;
      }
    } catch {
      localStorage.removeItem('egirs_user');
      setUser(null);
      return true;
    }
    return false;
  }, []);

  const updateLastActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityUpdate.current < ACTIVITY_THROTTLE_MS) return;
    lastActivityUpdate.current = now;
    const stored = localStorage.getItem('egirs_user');
    if (!stored) return;
    try {
      const data = JSON.parse(stored);
      if (isSessionExpired(data)) {
        localStorage.removeItem('egirs_user');
        setUser(null);
        return;
      }
      const updated = { ...data, lastActivityAt: now };
      localStorage.setItem('egirs_user', JSON.stringify(updated));
      setUser(updated);
    } catch {
      localStorage.removeItem('egirs_user');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const handleActivity = () => updateLastActivity();
    const events = ['click', 'keydown', 'scroll', 'mousemove'];
    events.forEach((e) => window.addEventListener(e, handleActivity));
    return () => events.forEach((e) => window.removeEventListener(e, handleActivity));
  }, [user, updateLastActivity]);

  const hasRole = useCallback((allowedRoles) => {
    if (!user) return false;
    if (allowedRoles.includes('all')) return true;
    return allowedRoles.includes(user.role);
  }, [user]);

  const refreshUser = useCallback(() => {
    const storedUser = localStorage.getItem('egirs_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (isSessionExpired(userData)) {
          localStorage.removeItem('egirs_user');
          setUser(null);
          return null;
        }
        setUser(userData);
        return userData;
      } catch (e) {
        localStorage.removeItem('egirs_user');
        setUser(null);
        return null;
      }
    }
    setUser(null);
    return null;
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, logoutIfExpired, hasRole, isLoading, refreshUser }}>
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

