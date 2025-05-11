
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useDatabase, User } from '../lib/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isInitialized, loginUser, registerUser } = useDatabase();

  useEffect(() => {
    // Check for saved user session in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    
    setLoading(!isInitialized);
  }, [isInitialized]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const result = loginUser(username, password);
    if (result) {
      setUser(result);
      localStorage.setItem('user', JSON.stringify(result));
      return true;
    }
    return false;
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    const userId = registerUser(username, email, password);
    if (userId > 0) {
      const user = { UserID: userId, user: username, email, password } as User;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
