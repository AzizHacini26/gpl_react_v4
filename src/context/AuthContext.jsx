import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getTokenClaims, clearAuth, getAuthToken } from '../services/authApi';
import { UsersService } from '../services/UsersService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAuthToken());

  const claims = useMemo(() => {
    if (!token) return null;
    return getTokenClaims();
  }, [token]);

  const user = useMemo(() => {
    if (!claims) return null;
    return {
      username: claims.sub,
      role: claims.role || claims.roles || null,
      permissions: Array.isArray(claims.permissions) ? claims.permissions : [],
    };
  }, [claims]);

  const isAuthenticated = Boolean(token);

  const login = useCallback(async (username, password) => {
    try {
      const authResponse = await UsersService.loginuser(username, password);
      const newToken = authResponse?.token;
      if (newToken) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('username', username);
        setToken(newToken);
        return { success: true };
      }
      return { success: false, error: 'invalidCredentials' };
    } catch {
      return { success: false, error: 'serverError' };
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
  }, []);

  const hasPermission = useCallback((permissionName) => {
    if (!permissionName) return true;
    return user?.permissions?.includes(permissionName) ?? false;
  }, [user]);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    login,
    logout,
    hasPermission,
  }), [user, token, isAuthenticated, login, logout, hasPermission]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
