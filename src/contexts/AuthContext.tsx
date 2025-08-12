"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, User } from '@/types';
import { supabase, DatabaseUser, isSupabaseConfigured } from '@/lib/supabase';

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

  // Carregar usuários do Supabase ou localStorage
  const loadUsers = async () => {
    try {
      if (isSupabaseConfigured()) {
        // Tentar carregar do Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Erro ao carregar usuários do Supabase, usando localStorage:', error);
          loadUsersFromLocalStorage();
          return;
        }

        const formattedUsers: User[] = data.map((user: DatabaseUser) => ({
          id: user.id,
          fullName: user.full_name,
          cpf: user.cpf,
          password: user.password,
          isBlocked: user.is_blocked,
          monthlyPaymentStatus: user.monthly_payment_status as 'paid' | 'pending' | 'overdue',
          createdAt: new Date(user.created_at),
          lastPayment: user.last_payment ? new Date(user.last_payment) : undefined,
        }));

        setUsers(formattedUsers);
      } else {
        // Usar localStorage se Supabase não estiver configurado
        loadUsersFromLocalStorage();
      }
    } catch (error) {
      console.warn('Erro ao carregar usuários, usando localStorage:', error);
      loadUsersFromLocalStorage();
    }
  };

  const loadUsersFromLocalStorage = () => {
    const savedUsers = localStorage.getItem('credconecta-users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers).map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
      })));
    }
  };

  // Salvar usuários no localStorage
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('credconecta-users', JSON.stringify(users));
    }
  }, [users]);

  // Carregar dados iniciais
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Verificar se há sessão salva
      const savedAuth = localStorage.getItem('credconecta-auth');
      if (savedAuth) {
        setCurrentUser(JSON.parse(savedAuth));
      }

      // Carregar usuários
      await loadUsers();
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (type: 'admin' | 'user', credentials?: { cpf?: string; password: string }): Promise<boolean> => {
    if (type === 'admin') {
      // Login do administrador
      if (credentials?.password === '8470') {
        const adminAuth: AuthUser = { type: 'admin', fullName: 'Administrador' };
        setCurrentUser(adminAuth);
        localStorage.setItem('credconecta-auth', JSON.stringify(adminAuth));
        return true;
      }
      return false;
    } else if (credentials && credentials.cpf) {
      // Login do usuário
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('cpf', credentials.cpf)
            .eq('password', credentials.password)
            .eq('is_blocked', false)
            .single();

          if (error || !data) {
            return false;
          }

          const userAuth: AuthUser = { 
            type: 'user', 
            id: data.id, 
            fullName: data.full_name 
          };
          setCurrentUser(userAuth);
          localStorage.setItem('credconecta-auth', JSON.stringify(userAuth));
          return true;
        } catch (error) {
          console.error('Erro no login:', error);
          return false;
        }
      } else {
        // Fallback para localStorage
        const user = users.find(u => u.cpf === credentials.cpf && u.password === credentials.password);
        if (user && !user.isBlocked) {
          const userAuth: AuthUser = { type: 'user', id: user.id, fullName: user.fullName };
          setCurrentUser(userAuth);
          localStorage.setItem('credconecta-auth', JSON.stringify(userAuth));
          return true;
        }
      }
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('credconecta-auth');
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert({
            full_name: userData.fullName,
            cpf: userData.cpf,
            password: userData.password,
            is_blocked: userData.isBlocked,
            monthly_payment_status: userData.monthlyPaymentStatus,
          })
          .select()
          .single();

        if (error) {
          console.error('Erro ao adicionar usuário:', error);
          return;
        }

        await loadUsers();
        return;
      } catch (error) {
        console.error('Erro ao adicionar usuário:', error);
      }
    }

    // Fallback para localStorage
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    if (isSupabaseConfigured()) {
      try {
        const updateData: any = {};
        
        if (updates.fullName) updateData.full_name = updates.fullName;
        if (updates.cpf) updateData.cpf = updates.cpf;
        if (updates.password) updateData.password = updates.password;
        if (updates.isBlocked !== undefined) updateData.is_blocked = updates.isBlocked;
        if (updates.monthlyPaymentStatus) updateData.monthly_payment_status = updates.monthlyPaymentStatus;
        if (updates.lastPayment) updateData.last_payment = updates.lastPayment.toISOString();

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', id);

        if (error) {
          console.error('Erro ao atualizar usuário:', error);
          return;
        }

        await loadUsers();
        return;
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
      }
    }

    // Fallback para localStorage
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
  };

  const deleteUser = async (id: string) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Erro ao deletar usuário:', error);
          return;
        }

        await loadUsers();
        return;
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
      }
    }

    // Fallback para localStorage
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const toggleUserBlock = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      await updateUser(id, { isBlocked: !user.isBlocked });
    }
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