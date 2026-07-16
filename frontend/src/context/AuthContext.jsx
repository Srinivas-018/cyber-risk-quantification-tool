import React, { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user] = useState({
    username: 'Admin',
    role: 'ADMIN',
    email: 'admin@company.com'
  });
  const loading = false;
  const isAuthenticated = true;

  const login = async () => ({ success: true });
  const registerUser = async () => ({ success: true });
  const logout = () => {};

  return (
    <AuthContext.Provider value={{ user, login, registerUser, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
