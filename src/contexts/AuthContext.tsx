"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, User } from '@/types';

interface AuthContextType {
  currentUser: AuthUser | null;
  users: User[];
  login: (type: 'admin' | 'user', credentials?: { cpf?: string; password: string }) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserBlock: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Senha administrativa definida
const ADMIN_PASSWORD = "8470";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('credconecta-users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }

    const savedAuth = localStorage.getItem('credconecta-auth');
    if (savedAuth) {
      setCurrentUser(JSON.parse(savedAuth));
    }
  }, []);

  // Salvar usuários no localStorage
  useEffect(() => {
    localStorage.setItem('credconecta-users', JSON.stringify(users));
  }, [users]);

  const login = async (type: 'admin' | 'user', credentials?: { cpf?: string; password: string }): Promise<boolean> => {
    if (type === 'admin') {
      // Login do administrador com senha
      if (credentials?.password === ADMIN_PASSWORD) {
        const adminAuth: AuthUser = { type: 'admin', fullName: 'Administrador' };
        setCurrentUser(adminAuth);
        localStorage.setItem('credconecta-auth', JSON.stringify(adminAuth));
        return true;
      }
      return false;
    } else if (credentials && credentials.cpf) {
      // Login do usuário
      const user = users.find(u => u.cpf === credentials.cpf && u.password === credentials.password);
      if (user && !user.isBlocked) {
        const userAuth: AuthUser = { type: 'user', id: user.id, fullName: user.fullName };
        setCurrentUser(userAuth);
        localStorage.setItem('credconecta-auth', JSON.stringify(userAuth));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('credconecta-auth');
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const toggleUserBlock = (id: string) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, isBlocked: !user.isBlocked } : user
    ));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
      toggleUserBlock,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}