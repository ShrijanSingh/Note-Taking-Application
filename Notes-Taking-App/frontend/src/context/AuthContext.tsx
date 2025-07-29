import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { AuthContextType, AuthState, User } from '../types';

const initialState: AuthState = {
  user: null,
  token: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const user = jwtDecode<User>(token);
        return {
          user,
          token,
        };
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    return initialState;
  });

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const user = jwtDecode<User>(token);
    setState({
      user,
      token,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState(initialState);
  };

  useEffect(() => {
    // Check token expiration
    if (state.token) {
      const user = jwtDecode<User>(state.token);
      const exp = (user as any).exp * 1000; // Convert to milliseconds
      if (Date.now() >= exp) {
        logout();
      }
    }
  }, [state.token]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
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
