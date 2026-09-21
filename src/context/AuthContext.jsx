import { createContext, useContext, useState, useCallback } from 'react';
import { setToken, clearToken, getToken } from '../storage';

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const signIn = useCallback((userData, token) => {
    setToken(token);
    setUser(userData);
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
