import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type UserType = {
  id: string;
  fullName: string;
  email: string;
  role: 'buyer' | 'vendor';
  preferences?: string;
  vendorName?: string;
} | null;

type AuthContextType = {
  user: UserType;
  token: string | null;
  loading: boolean;
  login: (userData: UserType, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const defaultValue: AuthContextType = {
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
};

export const AuthContext = createContext<AuthContextType>(defaultValue);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserType>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);
  
  const login = (userData: UserType, userToken: string) => {
    console.log('Saving to localStorage:', userData, userToken); // Add this line
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(userToken);
    
    // Redirect based on role
    if (userData.role === 'buyer') {
      navigate('/buyer/dashboard');
    } else if (userData.role === 'vendor') {
      navigate('/vendor/dashboard');
    }
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
