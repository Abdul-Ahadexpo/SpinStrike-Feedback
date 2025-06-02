import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, get, set, onValue } from 'firebase/database';
import { database } from '../firebase/config';
import { toast } from 'react-toastify';

type UserRole = 'admin' | 'employee' | null;

interface User {
  email: string;
  id: string;
  name?: string;
  points?: number;
}

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole;
  loading: boolean;
  adminLogin: (password: string) => Promise<boolean>;
  employeeLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('spinstrikeUser');
    const storedRole = localStorage.getItem('spinstrikeRole');
    
    if (storedUser && storedRole) {
      setCurrentUser(JSON.parse(storedUser));
      setUserRole(storedRole as UserRole);
    }
    
    setLoading(false);
  }, []);

  // Admin login
  const adminLogin = async (password: string): Promise<boolean> => {
    try {
      if (password === 'Niharuka2918') {
        const adminUser = { email: 'admin@spinstrike.com', id: 'admin' };
        setCurrentUser(adminUser);
        setUserRole('admin');
        
        // Store in local storage
        localStorage.setItem('spinstrikeUser', JSON.stringify(adminUser));
        localStorage.setItem('spinstrikeRole', 'admin');
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  // Employee login
  const employeeLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      // Format email to be used as a key (replace . with ,)
      const emailKey = email.replace(/\./g, ',');
      const employeeRef = ref(database, `employees/${emailKey}`);
      const snapshot = await get(employeeRef);
      
      if (snapshot.exists()) {
        const employeeData = snapshot.val();
        if (employeeData.password === password) {
          const userData = {
            email: email,
            id: emailKey,
            name: employeeData.name,
            points: employeeData.points || 0
          };
          
          setCurrentUser(userData);
          setUserRole('employee');
          
          // Store in local storage
          localStorage.setItem('spinstrikeUser', JSON.stringify(userData));
          localStorage.setItem('spinstrikeRole', 'employee');
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Employee login error:', error);
      return false;
    }
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setUserRole(null);
    localStorage.removeItem('spinstrikeUser');
    localStorage.removeItem('spinstrikeRole');
  };

  const value = {
    currentUser,
    userRole,
    loading,
    adminLogin,
    employeeLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}