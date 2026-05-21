import { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setAuthLoading(false);
  }, []);

  const persistUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const login = async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password });
    persistUser(data.user);
    toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
    return data;
  };

  const signup = async (name, email, password) => {
    const data = await api.post('/api/auth/signup', { name, email, password });
    persistUser(data.user);
    toast.success(`Welcome to EcoStore, ${data.user.name.split(' ')[0]}!`);
    return data;
  };

  const updateProfile = async (name) => {
    const data = await api.put('/api/auth/profile', { name });
    persistUser(data);
    toast.success('Profile updated!');
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('wishlist');
    toast.success('Logged out. See you soon!');
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
