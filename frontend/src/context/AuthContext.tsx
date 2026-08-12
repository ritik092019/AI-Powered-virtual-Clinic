import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { MOCK_USERS } from '../mock';
import { authService, LoginCredentials, SignupPayload } from '../services/authService';

interface AuthContextType {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (payload: SignupPayload) => Promise<User>;
  demoLogin: (role: Role) => Promise<User>;
  switchRole: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('arogya_demo_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_USERS.HEALTH_WORKER;
      }
    }
    return MOCK_USERS.HEALTH_WORKER; // Default authenticated state for initial preview
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('arogya_demo_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('arogya_demo_user');
    }
  }, [user]);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: SignupPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.register(payload);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (targetRole: Role): Promise<User> => {
    setIsLoading(true);
    try {
      const mockUser = MOCK_USERS[targetRole] || MOCK_USERS.HEALTH_WORKER;
      setUser(mockUser);
      return mockUser;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = (newRole: Role) => {
    if (MOCK_USERS[newRole]) {
      setUser(MOCK_USERS[newRole]);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('arogya_demo_user');
    authService.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'HEALTH_WORKER',
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
