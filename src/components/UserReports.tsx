"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLoans } from '@/contexts/LoanContext';
import { FileText, Download, TrendingUp, AlertTriangle, DollarSign, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function UserReports() {
  const { currentUser } = useAuth();
  const { getUserLoans, getLoanReport, getOverdueLoans, calculatePenalty } = useLoans();
  
  // Obter dados apenas do usuário atual
  const userLoans = currentUser?.id ? getUserLoans(currentUser.id) : [];
  const report = currentUser?.id ? getLoanReport(currentUser.id) : {
    totalLoans: 0,
    totalAmount: 0,
    settledLoans: 0,
    pendingLoans: 0,
    overdueLoans: 0,
    totalPenalties: 0,
  };
  const overdueLoans = currentUser?.id ? getOverdueLoans(currentUser.id) : [];

  const generateFullReport = () => {
    const reportData = {
      geradoEm: new Date().toLocaleString('pt-BR'),
      usuario: currentUser?.fullName || 'Usuário',
      resumo: {
        totalEmprestimos: report.totalLoans,
        valorTotal: report.totalAmount,
        emprestimosQuitados: report.settledLoans,
        emprestimosPendentes: report.pendingLoans,
        emprestimosAtrasados: report.overdueLoans,
        multasAcumuladas: report.totalPenalties,
      },
      emprestimos: userLoans.map(loan => ({
        id: loan.id,
        cliente: loan.fullName,
        cpf: loan.cpf,
        telefone: loan.phone,
        valor: loan.loanAmount,
        data: loan.loanDate.toLocaleDateString('pt-BR'),
        parcelas: `${loan.paidInstallments}/${loan.totalInstallments}`,
        restantes: loan.remainingInstallments,
        sancaoDiaria: loan.dailyPenalty,
        multaAtual: calculatePenalty(loan),
        status: loan.isSettled ? 'Quitado' : 'Pendente',
      })),
    };

    console.log('=== RELATÓRIO COMPLETO ===');
    console.log('Usuário:', reportData.usuario);
    console.log('Gerado em:', reportData.geradoEm);
    console.log('\n--- RESUMO ---');
    console.log('Total de Empréstimos:', reportData.resumo.totalEmprestimos);
    console.log('Valor Total:', `R$ ${reportData.resumo.valorTotal.toLocaleString('pt-BR')}`);
    console.log('Quitados:', reportData.resumo.emprestimosQuitados);
    console.log('Pendentes:', reportData.resumo.emprestimosPendentes);
    console.log('Em Atraso:', reportData.resumo.emprestimosAtrasados);
    console.log('Multas Acumuladas:', `R$ ${reportData.resumo.multasAcumuladas.toLocaleString('pt-BR')}`);
    console.log('\n--- EMPRÉSTIMOS ---');
    reportData.emprestimos.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.cliente} (${emp.cpf})`);
      console.log(`   Valor: R$ ${emp.valor.toLocaleString('pt-BR')} | Data: ${emp.data}`);
      console.log(`   Parcelas: ${emp.parcelas} | Status: ${emp.status}`);
      if (emp.multaAtual > 0) {
        console.log(`   Multa: R$ ${emp.multaAtual.toFixed(2)}`);
      }
      console.log('');
    });
    console.log('========================');
    
    toast.success('Relatório completo gerado! Verifique o console');
  };

  const exportOverdueReport = () => {
    if (overdueLoans.length === 0) {
      toast.info('Você não possui empréstimos em atraso');
      return;
    }

    const overdueData = overdueLoans.map(loan => ({
      cliente: loan.fullName,
      cpf: loan.cpf,
      telefone: loan.phone,
      valorEmprestimo: loan.loanAmount,
      dataEmprestimo: loan.loanDate.toLocaleDateString('pt-BR'),
      parcelasRestantes: loan.remainingInstallments,
      sancaoDiaria: loan.dailyPenalty,
      multaAcumulada: calculatePenalty(loan),
      diasAtraso: Math.floor((Date.now() - loan.loanDate.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    console.log('=== RELATÓRIO DE INADIMPLÊNCIA ===');
    console.log('Usuário:', currentUser?.fullName || 'Usuário');
    console.log('Gerado em:', new Date().toLocaleString('pt-BR'));
    console.log(`Total de empréstimos em atraso: ${overdueLoans.length}`);
    console.log('');
    overdueData.forEach((loan, index) => {
      console.log(`${index + 1}. ${loan.cliente}`);
      console.log(`   CPF: ${loan.cpf} | Telefone: ${loan.telefone}`);
      console.log(`   Valor: R$ ${loan.valorEmprestimo.toLocaleString('pt-BR')} | Data: ${loan.dataEmprestimo}`);
      console.log(`   Dias em atraso: ${loan.diasAtraso} | Parcelas restantes: ${loan.parcelasRestantes}`);
      console.log(`   Multa acumulada: R$ ${loan.multaAcumulada.toFixed(2)}`);
      console.log('');
    });
    console.log('=================================');
    
    toast.success('Relatório de inadimplência exportado! Verifique o console');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div className="text-right">
                <div className="text-lg font-bold">{report.totalLoans}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
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
                <div className="text-xs text-gray-600">Valor</div>
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
          </CardContent>
        </Card>

        <Card className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">{report.overdueLoans}</div>
                <div className="text-xs text-gray-600">Atrasados</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações de Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5" />
            Relatório Geral
          </CardTitle>
          <CardDescription>
            Relatório completo com seus empréstimos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Empréstimos:</p>
                <p className="font-semibold">{report.totalLoans}</p>
              </div>
              <div>
                <p className="text-gray-600">Valor Total:</p>
                <p className="font-semibold">{formatCurrency(report.totalAmount)}</p>
              </div>
              <div>
                <p className="text-gray-600">Quitados:</p>
                <p className="font-semibold text-green-600">{report.settledLoans}</p>
              </div>
              <div>
                <p className="text-gray-600">Pendentes:</p>
                <p className="font-semibold text-orange-600">{report.pendingLoans}</p>
              </div>
            </div>
            <Button onClick={generateFullReport} className="w-full h-12">
              <Download className="h-4 w-4 mr-2" />
              Gerar Relatório Completo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Relatório de Inadimplência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Relatório de Inadimplência
          </CardTitle>
          <CardDescription>
            Seus empréstimos em atraso e multas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Em Atraso:</p>
                <p className="font-semibold text-red-600">{report.overdueLoans}</p>
              </div>
              <div>
                <p className="text-gray-600">Multas:</p>
                <p className="font-semibold text-red-600">{formatCurrency(report.totalPenalties)}</p>
              </div>
            </div>
            
            {overdueLoans.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Empréstimos em Atraso:</p>
                {overdueLoans.slice(0, 3).map((loan) => (
                  <div key={loan.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm">{loan.fullName}</span>
                    <Badge variant="destructive">
                      {formatCurrency(calculatePenalty(loan))}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            
            <Button 
              onClick={exportOverdueReport} 
              variant="destructive" 
              className="w-full h-12"
              disabled={overdueLoans.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório de Inadimplência
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Empréstimos em Atraso */}
      {overdueLoans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 text-base">Seus Empréstimos em Atraso</CardTitle>
            <CardDescription>
              Lista detalhada dos empréstimos atrasados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueLoans.map((loan) => {
                const penalty = calculatePenalty(loan);
                const daysOverdue = Math.floor((Date.now() - loan.loanDate.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={loan.id} className="p-3 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">{loan.fullName}</p>
                        <p className="text-xs text-gray-600">{loan.cpf}</p>
                        <p className="text-xs text-gray-600">{loan.phone}</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {daysOverdue} dias
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Valor:</span>
                        <span className="ml-1 font-medium">{formatCurrency(loan.loanAmount)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Multa:</span>
                        <span className="ml-1 font-medium text-red-600">{formatCurrency(penalty)}</span>
                      </div>
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