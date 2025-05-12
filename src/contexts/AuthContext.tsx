import React, { createContext, useState, useContext, useEffect } from 'react';
import { useDatabase, User } from '../lib/database';
import { supabase } from '../integrations/supabase/client';

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

    // Set up Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        // When authenticated with Supabase, try to get the user info from our database
        loginUser(session.user.email || '', '')
          .then(userInfo => {
            if (userInfo) {
              setUser(userInfo);
              localStorage.setItem('user', JSON.stringify(userInfo));
            }
          })
          .catch(error => {
            console.error("Error getting user info:", error);
          });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [isInitialized, loginUser]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // First try to sign in with Supabase using email as username
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username, // Assuming username is an email
        password: password
      });

      if (error) {
        console.error("Supabase login error:", error);
        
        // Fallback to our custom login if Supabase fails
        const result = await loginUser(username, password);
        if (result) {
          setUser(result);
          localStorage.setItem('user', JSON.stringify(result));
          return true;
        }
        return false;
      }

      // Supabase login successful, but we still need user info from our DB
      const result = await loginUser(username, '');
      if (result) {
        setUser(result);
        localStorage.setItem('user', JSON.stringify(result));
        return true;
      }
      
      return !!data.session;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      // Register with Supabase first
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });

      if (error) {
        console.error("Supabase registration error:", error);
        return false;
      }

      // Then register in our database
      const userId = await registerUser(username, email, '');
      if (userId > 0) {
        const newUser = { UserID: userId, user: username, email, password: '' } as User;
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear local state
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
