"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLoans } from '@/contexts/LoanContext';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Download, TrendingUp, Users, CreditCard, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function ReportsPage() {
  const { loans, getLoanReport, getOverdueLoans, calculatePenalty } = useLoans();
  const { users } = useAuth();
  
  const report = getLoanReport();
  const overdueLoans = getOverdueLoans();
  const activeUsers = users.filter(user => !user.isBlocked).length;
  const blockedUsers = users.filter(user => user.isBlocked).length;

  const generateFullReport = () => {
    const reportData = {
      generatedAt: new Date().toLocaleString('pt-BR'),
      summary: report,
      users: {
        total: users.length,
        active: activeUsers,
        blocked: blockedUsers,
      },
      loans: loans.map(loan => ({
        id: loan.id,
        client: loan.fullName,
        cpf: loan.cpf,
        amount: loan.loanAmount,
        installments: `${loan.paidInstallments}/${loan.totalInstallments}`,
        status: loan.isSettled ? 'Quitado' : 'Pendente',
        penalty: calculatePenalty(loan),
        loanDate: loan.loanDate.toLocaleDateString('pt-BR'),
      })),
      overdueLoans: overdueLoans.map(loan => ({
        client: loan.fullName,
        cpf: loan.cpf,
        amount: loan.loanAmount,
        daysOverdue: Math.floor((Date.now() - loan.loanDate.getTime()) / (1000 * 60 * 60 * 24)),
        penalty: calculatePenalty(loan),
      })),
    };

    console.log('Relatório Completo:', reportData);
    toast.success('Relatório gerado! Verifique o console para os dados completos');
  };

  const exportOverdueReport = () => {
    const overdueData = overdueLoans.map(loan => ({
      Cliente: loan.fullName,
      CPF: loan.cpf,
      Telefone: loan.phone,
      'Valor do Empréstimo': `R$ ${loan.loanAmount.toLocaleString('pt-BR')}`,
      'Data do Empréstimo': loan.loanDate.toLocaleDateString('pt-BR'),
      'Parcelas Restantes': loan.remainingInstallments,
      'Multa Acumulada': `R$ ${calculatePenalty(loan).toFixed(2)}`,
    }));

    console.log('Relatório de Inadimplência:', overdueData);
    toast.success('Relatório de inadimplência exportado! Verifique o console');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Relatórios</h2>
        <p className="text-gray-600">Visualize e exporte relatórios do sistema</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {blockedUsers} bloqueados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emprestado</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {report.totalAmount.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {report.totalLoans} empréstimos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Quitação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report.totalLoans > 0 ? Math.round((report.settledLoans / report.totalLoans) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {report.settledLoans} de {report.totalLoans}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Multas Acumuladas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {report.totalPenalties.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-red-600">
              {report.overdueLoans} em atraso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações de Relatório */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório Geral
            </CardTitle>
            <CardDescription>
              Relatório completo com todos os dados do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total de Usuários:</p>
                  <p className="font-semibold">{users.length}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total de Empréstimos:</p>
                  <p className="font-semibold">{report.totalLoans}</p>
                </div>
                <div>
                  <p className="text-gray-600">Valor Total:</p>
                  <p className="font-semibold">R$ {report.totalAmount.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Empréstimos Quitados:</p>
                  <p className="font-semibold">{report.settledLoans}</p>
                </div>
              </div>
              <Button onClick={generateFullReport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório Completo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Relatório de Inadimplência
            </CardTitle>
            <CardDescription>
              Empréstimos em atraso e multas acumuladas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Empréstimos em Atraso:</p>
                  <p className="font-semibold text-red-600">{report.overdueLoans}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total em Multas:</p>
                  <p className="font-semibold text-red-600">R$ {report.totalPenalties.toLocaleString('pt-BR')}</p>
                </div>
              </div>
              
              {overdueLoans.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Principais Devedores:</p>
                  {overdueLoans.slice(0, 3).map((loan) => (
                    <div key={loan.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="text-sm">{loan.fullName}</span>
                      <Badge variant="destructive">
                        R$ {calculatePenalty(loan).toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              
              <Button 
                onClick={exportOverdueReport} 
                variant="destructive" 
                className="w-full"
                disabled={overdueLoans.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório de Inadimplência
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Empréstimos em Atraso */}
      {overdueLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Empréstimos em Atraso</CardTitle>
            <CardDescription>
              Lista detalhada dos empréstimos que precisam de atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueLoans.map((loan) => {
                const penalty = calculatePenalty(loan);
                const daysOverdue = Math.floor((Date.now() - loan.loanDate.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={loan.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium">{loan.fullName}</p>
                      <p className="text-sm text-gray-600">CPF: {loan.cpf}</p>
                      <p className="text-sm text-gray-600">Telefone: {loan.phone}</p>
                      <p className="text-sm text-gray-600">
                        Empréstimo: R$ {loan.loanAmount.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="mb-2">
                        {daysOverdue} dias em atraso
                      </Badge>
                      <p className="text-sm text-red-600">
                        Multa: R$ {penalty.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {loan.remainingInstallments} parcelas restantes
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}