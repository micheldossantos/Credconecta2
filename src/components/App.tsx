"use client";

import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoanProvider } from '@/contexts/LoanContext';
import { ContractProvider } from '@/contexts/ContractContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { LoginPage } from '@/components/LoginPage';
import { AdminDashboard } from '@/components/AdminDashboard';
import { UserDashboard } from '@/components/UserDashboard';
import { Toaster } from '@/components/ui/sonner';
import Loading from '@/app/loading';

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  if (currentUser.type === 'admin') {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <LoanProvider>
        <ContractProvider>
          <NotificationProvider>
            <AppContent />
            <Toaster />
          </NotificationProvider>
        </ContractProvider>
      </LoanProvider>
    </AuthProvider>
  );
}