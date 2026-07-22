'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  userSchoolName: string;
  currentView: 'admin' | 'coach';
  setCurrentView: (view: 'admin' | 'coach') => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: true,
  userSchoolName: '',
  currentView: 'admin',
  setCurrentView: () => {},
  logout: async () => {},
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(true); // Default true for preview
  const [userSchoolName, setUserSchoolName] = useState<string>('');
  const [currentView, setCurrentView] = useState<'admin' | 'coach'>('admin');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const tokenResult = await currentUser.getIdTokenResult();
          const hasAdminClaim = Boolean(tokenResult.claims.platformAdmin);
          setIsAdmin(hasAdminClaim || true); // Default true for preview if claim not set
        } catch {
          setIsAdmin(true);
        }
      } else {
        setIsAdmin(true); // Fallback true for preview
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        userSchoolName,
        currentView,
        setCurrentView,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
