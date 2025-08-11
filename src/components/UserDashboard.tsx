"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLoans } from '@/contexts/LoanContext';
import { UserLoanForm } from './UserLoanForm';
import { UserLoanManagement } from './UserLoanManagement';
import { UserReports } from './UserReports';
import { 
  Plus, 
  CreditCard, 
  FileText, 
  LogOut, 
  AlertTriangle,
  DollarSign,
  Clock,
  Home,
  CheckCircle
} from 'lucide-react';
import { CredconectaLogo } from './CredconectaLogo';

type ActiveTab = 'overview' | 'add-loan' | 'manage-loans' | 'reports';

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const { logout, currentUser } = useAuth();
  const { loans, getOverdueLoans, getLoanReport } = useLoans();

  // Filtrar empréstimos do usuário atual (se necessário)
  const userLoans = loans; // Por enquanto todos os empréstimos
  const overdueLoans = getOverdueLoans();
  const report = getLoanReport();

  const renderContent = () => {
    switch (activeTab) {
      case 'add-loan':
        return <UserLoanForm />;
      case 'manage-loans':
        return <UserLoanManagement />;
      case 'reports':
        return <UserReports />;
      default:
        return (
          <div className="space-y-4 pb-20">
            {/* Saudação */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold">Olá, {currentUser?.fullName}!</h2>
                <p className="text-sm opacity-90">Bem-vindo ao seu painel de empréstimos</p>
              </CardContent>
            </Card>

            {/* Cards de Métricas - Layout Mobile */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div className="text-right">
                      <div className="text-lg font-bold">{report.totalLoans}</div>
                      <div className="text-xs text-gray-600">Empréstimos</div>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Total cadastrado
                  </div>
                </CardContent>
              </Card>

              <Card className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        R$ {(report.totalAmount / 1000).toFixed(0)}k
                      </div>
                      <div className="text-xs text-gray-600">Valor Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{report.settledLoans}</div>
                      <div className="text-xs text-gray-600">Quitados</div>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-green-500">
                    Finalizados
                  </div>
                </CardContent>
              </Card>

              <Card className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <Clock className="h-5 w-5 text-red-600" />
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">{report.overdueLoans}</div>
                      <div className="text-xs text-gray-600">Em Atraso</div>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-red-500">
                    R$ {(report.totalPenalties / 1000).toFixed(1)}k multas
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas de Atraso */}
            {overdueLoans.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-600 text-base">
                    <AlertTriangle className="h-4 w-4" />
                    Atenção! Parcelas em Atraso ({overdueLoans.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {overdueLoans.slice(0, 3).map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{loan.fullName}</p>
                          <p className="text-xs text-gray-600">{loan.cpf}</p>
                        </div>
                        <div className="text-right ml-2">
                          <Badge variant="destructive" className="text-xs">
                            {loan.remainingInstallments} parcelas
                          </Badge>
                          <p className="text-xs text-red-600 mt-1">
                            Multa: R$ {((Date.now() - new Date(loan.loanDate).getTime()) / (1000 * 60 * 60 * 24) * loan.dailyPenalty).toFixed(0)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {overdueLoans.length > 3 && (
                      <p className="text-xs text-gray-600 text-center pt-2">
                        +{overdueLoans.length - 3} mais em atraso
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ações Rápidas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => setActiveTab('add-loan')}
                    className="h-16 flex flex-col gap-1"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-xs">Novo Empréstimo</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('manage-loans')}
                    variant="outline"
                    className="h-16 flex flex-col gap-1"
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="text-xs">Gerenciar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Mobile */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CredconectaLogo width={120} height={40} />
              <div>
                <p className="text-xs text-gray-600">Usuário</p>
              </div>
            </div>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Navegação Inferior - Mobile */}
      <nav className="bg-white border-t fixed bottom-0 left-0 right-0 z-20">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'overview' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Início</span>
          </button>
          
          <button
            onClick={() => setActiveTab('add-loan')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'add-loan' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Cadastrar</span>
          </button>
          
          <button
            onClick={() => setActiveTab('manage-loans')}
            className={`flex flex-col items-center justify-center space-y-1 relative ${
              activeTab === 'manage-loans' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-xs">Gerenciar</span>
            {overdueLoans.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {overdueLoans.length}
              </div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'reports' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs">Relatórios</span>
          </button>
        </div>
      </nav>
    </div>
  );
}