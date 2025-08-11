"use client";

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoanProvider } from '@/contexts/LoanContext';
import { LoginPage } from '@/components/LoginPage';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <LoginPage />;
  }

  if (currentUser.type === 'admin') {
    return <AdminDashboard />;
  }

  // Para usuários comuns (implementação futura)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Bem-vindo, {currentUser.fullName}!</h1>
        <p className="text-gray-600">Painel do usuário em desenvolvimento...</p>
      </div>
    </div>
  );
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