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
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Verificar se o componente foi montado no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Carregar dados do localStorage
  useEffect(() => {
    if (!mounted) return;

    const loadData = () => {
      try {
        // Carregar sessão
        const savedAuth = localStorage.getItem('credconecta-auth');
        if (savedAuth) {
          setCurrentUser(JSON.parse(savedAuth));
        }

        // Carregar usuários
        const savedUsers = localStorage.getItem('credconecta-users');
        if (savedUsers) {
          const parsedUsers = JSON.parse(savedUsers).map((user: any) => ({
            ...user,
            createdAt: new Date(user.createdAt),
            lastPayment: user.lastPayment ? new Date(user.lastPayment) : undefined,
          }));
          setUsers(parsedUsers);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mounted]);

  // Salvar usuários no localStorage
  useEffect(() => {
    if (mounted && users.length > 0) {
      try {
        localStorage.setItem('credconecta-users', JSON.stringify(users));
      } catch (error) {
        console.error('Erro ao salvar usuários:', error);
      }
    }
  }, [users, mounted]);

  const login = async (type: 'admin' | 'user', credentials?: { cpf?: string; password: string }): Promise<boolean> => {
    if (!mounted) return false;

    if (type === 'admin') {
      if (credentials?.password === '8470') {
        const adminAuth: AuthUser = { type: 'admin', fullName: 'Administrador' };
        setCurrentUser(adminAuth);
        try {
          localStorage.setItem('credconecta-auth', JSON.stringify(adminAuth));
        } catch (error) {
          console.error('Erro ao salvar sessão:', error);
        }
        return true;
      }
      return false;
    } else if (credentials && credentials.cpf) {
      const user = users.find(u => u.cpf === credentials.cpf && u.password === credentials.password);
      if (user && !user.isBlocked) {
        const userAuth: AuthUser = { type: 'user', id: user.id, fullName: user.fullName };
        setCurrentUser(userAuth);
        try {
          localStorage.setItem('credconecta-auth', JSON.stringify(userAuth));
        } catch (error) {
          console.error('Erro ao salvar sessão:', error);
        }
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    if (mounted) {
      try {
        localStorage.removeItem('credconecta-auth');
      } catch (error) {
        console.error('Erro ao remover sessão:', error);
      }
    }
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
    const user = users.find(u => u.id === id);
    if (user) {
      updateUser(id, { isBlocked: !user.isBlocked });
    }
  };

  // Não renderizar até estar montado
  if (!mounted) {
    return (
      <AuthContext.Provider value={{
        currentUser: null,
        users: [],
        login: async () => false,
        logout: () => {},
        addUser: () => {},
        updateUser: () => {},
        deleteUser: () => {},
        toggleUserBlock: () => {},
        loading: true,
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

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
      loading,
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