"use client";

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoanProvider } from '@/contexts/LoanContext';
import { LoginPage } from '@/components/LoginPage';
import { AdminDashboard } from '@/components/AdminDashboard';
import { UserDashboard } from '@/components/UserDashboard';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const { currentUser } = useAuth();

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