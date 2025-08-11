"use client";

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoanProvider } from '@/contexts/LoanContext';
import { LoginPage } from '@/components/LoginPage';
import { AdminDashboard } from '@/components/AdminDashboard';
import { UserDashboard } from '@/components/UserDashboard';
import { Toaster } from '@/components/ui/sonner';
import Loading from './loading';

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

  // Para usuários comuns
  return <UserDashboard />;
}

export default function Home() {
  return (
    <AuthProvider>
      <LoanProvider>
        <AppContent />
        <Toaster />
      </LoanProvider>
    </AuthProvider>
  );
}