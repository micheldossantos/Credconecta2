"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLoans } from '@/contexts/LoanContext';
import { useContracts } from '@/contexts/ContractContext';
import { UserManagement } from './UserManagement';
import { LoanManagement } from './LoanManagement';
import { ReportsPage } from './ReportsPage';
import { ContractManagement } from './ContractManagement';
import { NotificationSettings } from './NotificationSettings';
import { NotificationCenter } from './NotificationCenter';
import { StockTicker } from './StockTicker';
import { 
  Users, 
  CreditCard, 
  FileText, 
  LogOut, 
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  Home,
  FileSignature,
  Settings
} from 'lucide-react';
import { CredconectaLogo } from './CredconectaLogo';

type ActiveTab = 'overview' | 'users' | 'loans' | 'contracts' | 'reports' | 'notifications';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const { logout, users } = useAuth();
  const { loans, getOverdueLoans, getLoanReport } = useLoans();
  const { contracts } = useContracts();

  const overdueLoans = getOverdueLoans();
  const report = getLoanReport();
  const blockedUsers = users.filter(user => user.isBlocked).length;
  const pendingContracts = contracts.filter(contract => contract.status === 'draft').length;

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'loans':
        return <LoanManagement />;
      case 'contracts':
        return <ContractManagement />;
      case 'reports':
        return <ReportsPage />;
      case 'notifications':
        return <NotificationSettings />;
      default:
        return (
          <div className="space-y-4 pb-20">
            {/* Cards de Métricas - Layout Mobile */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div className="text-right">
                      <div className="text-lg font-bold">{users.length}</div>
                      <div className="text-xs text-gray-600">Usuários</div>
                    </div>
                  </div>
                  {blockedUsers > 0 && (
                    <div className="mt-1">
                      <Badge variant="destructive" className="text-xs">
                        {blockedUsers} bloqueados
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <div className="text-right">
                      <div className="text-lg font-bold">{report.totalLoans}</div>
                      <div className="text-xs text-gray-600">Empréstimos</div>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {report.settledLoans} quitados
                  </div>
                </CardContent>
              </Card>

              <Card className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <FileSignature className="h-5 w-5 text-purple-600" />
                    <div className="text-right">
                      <div className="text-lg font-bold">{contracts.length}</div>
                      <div className="text-xs text-gray-600">Contratos</div>
                    </div>
                  </div>
                  {pendingContracts > 0 && (
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {pendingContracts} pendentes
                      </Badge>
                    </div>
                  )}
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

            {/* Painel da Bolsa - Mobile */}
            <div className="mt-4">
              <StockTicker />
            </div>

            {/* Alertas de Atraso - Mobile */}
            {overdueLoans.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-600 text-base">
                    <AlertTriangle className="h-4 w-4" />
                    Alertas ({overdueLoans.length})
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
                            {loan.remainingInstallments}x
                          </Badge>
                          <p className="text-xs text-red-600 mt-1">
                            R$ {((Date.now() - new Date(loan.loanDate).getTime()) / (1000 * 60 * 60 * 24) * loan.dailyPenalty).toFixed(0)}
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
                <p className="text-xs text-gray-600">Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Navegação Inferior - Mobile */}
      <nav className="bg-white border-t fixed bottom-0 left-0 right-0 z-20">
        <div className="grid grid-cols-6 h-16">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'overview' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="text-xs">Início</span>
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`flex flex-col items-center justify-center space-y-1 relative ${
              activeTab === 'users' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <Users className="h-4 w-4" />
            <span className="text-xs">Usuários</span>
            {blockedUsers > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {blockedUsers}
              </div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('loans')}
            className={`flex flex-col items-center justify-center space-y-1 relative ${
              activeTab === 'loans' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span className="text-xs">Empréstimos</span>
            {overdueLoans.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {overdueLoans.length}
              </div>
            )}
          </button>

          <button
            onClick={() => setActiveTab('contracts')}
            className={`flex flex-col items-center justify-center space-y-1 relative ${
              activeTab === 'contracts' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <FileSignature className="h-4 w-4" />
            <span className="text-xs">Contratos</span>
            {pendingContracts > 0 && (
              <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {pendingContracts}
              </div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'reports' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span className="text-xs">Relatórios</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'notifications' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="text-xs">Config</span>
          </button>
        </div>
      </nav>
    </div>
  );
}