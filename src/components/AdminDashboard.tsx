"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLoans } from '@/contexts/LoanContext';
import { UserManagement } from './UserManagement';
import { LoanManagement } from './LoanManagement';
import { ReportsPage } from './ReportsPage';
import { 
  Users, 
  CreditCard, 
  FileText, 
  LogOut, 
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';

type ActiveTab = 'overview' | 'users' | 'loans' | 'reports';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const { logout, users } = useAuth();
  const { loans, getOverdueLoans, getLoanReport } = useLoans();

  const overdueLoans = getOverdueLoans();
  const report = getLoanReport();
  const blockedUsers = users.filter(user => user.isBlocked).length;

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'loans':
        return <LoanManagement />;
      case 'reports':
        return <ReportsPage />;
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  {blockedUsers > 0 && (
                    <p className="text-xs text-red-600">
                      {blockedUsers} bloqueado(s)
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Empréstimos</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.totalLoans}</div>
                  <p className="text-xs text-muted-foreground">
                    {report.settledLoans} quitados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {report.totalAmount.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Em empréstimos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Empréstimos em Atraso</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{report.overdueLoans}</div>
                  <p className="text-xs text-red-600">
                    R$ {report.totalPenalties.toLocaleString('pt-BR')} em multas
                  </p>
                </CardContent>
              </Card>
            </div>

            {overdueLoans.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Alertas de Parcelas em Atraso
                  </CardTitle>
                  <CardDescription>
                    Empréstimos que precisam de atenção imediata
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overdueLoans.slice(0, 5).map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium">{loan.fullName}</p>
                          <p className="text-sm text-gray-600">CPF: {loan.cpf}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">
                            {loan.remainingInstallments} parcelas restantes
                          </Badge>
                          <p className="text-sm text-red-600 mt-1">
                            Multa: R$ {((Date.now() - new Date(loan.loanDate).getTime()) / (1000 * 60 * 60 * 24) * loan.dailyPenalty).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {overdueLoans.length > 5 && (
                      <p className="text-sm text-gray-600 text-center">
                        E mais {overdueLoans.length - 5} empréstimo(s) em atraso...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Credconecta</h1>
                <p className="text-sm text-gray-600">Painel Administrativo</p>
              </div>
            </div>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Visão Geral
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Usuários
            {blockedUsers > 0 && (
              <Badge variant="destructive" className="ml-1">
                {blockedUsers}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'loans' ? 'default' : 'outline'}
            onClick={() => setActiveTab('loans')}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Empréstimos
            {overdueLoans.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {overdueLoans.length}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'reports' ? 'default' : 'outline'}
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Relatórios
          </Button>
        </nav>

        {renderContent()}
      </div>
    </div>
  );
}