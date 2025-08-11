"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLoans } from '@/contexts/LoanContext';
import { toast } from 'sonner';
import { CheckCircle, Edit, FileText, Eye, Phone, Calendar, DollarSign } from 'lucide-react';
import { Loan } from '@/types';

export function UserLoanManagement() {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const { loans, settleLoan, calculatePenalty } = useLoans();

  const handleSettleLoan = (loanId: string, loanName: string) => {
    if (confirm(`Confirma a quitação do empréstimo de ${loanName}?`)) {
      settleLoan(loanId);
      toast.success('Empréstimo marcado como quitado!');
    }
  };

  const generatePDF = (loan: Loan) => {
    // Simular geração de PDF
    const receiptData = {
      id: loan.id,
      cliente: loan.fullName,
      cpf: loan.cpf,
      telefone: loan.phone,
      valor: loan.loanAmount,
      data: loan.loanDate.toLocaleDateString('pt-BR'),
      parcelas: `${loan.paidInstallments}/${loan.totalInstallments}`,
      restantes: loan.remainingInstallments,
      multa: calculatePenalty(loan),
      status: loan.isSettled ? 'Quitado' : 'Pendente',
      geradoEm: new Date().toLocaleString('pt-BR'),
    };
    
    console.log('=== COMPROVANTE DE EMPRÉSTIMO ===');
    console.log(`ID: ${receiptData.id}`);
    console.log(`Cliente: ${receiptData.cliente}`);
    console.log(`CPF: ${receiptData.cpf}`);
    console.log(`Telefone: ${receiptData.telefone}`);
    console.log(`Valor: R$ ${receiptData.valor.toLocaleString('pt-BR')}`);
    console.log(`Data: ${receiptData.data}`);
    console.log(`Parcelas: ${receiptData.parcelas}`);
    console.log(`Restantes: ${receiptData.restantes}`);
    console.log(`Multa: R$ ${receiptData.multa.toFixed(2)}`);
    console.log(`Status: ${receiptData.status}`);
    console.log(`Gerado em: ${receiptData.geradoEm}`);
    console.log('================================');
    
    toast.success('Comprovante gerado! Verifique o console para visualizar');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4 pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gerenciar Empréstimos</CardTitle>
          <CardDescription>
            {loans.length} empréstimo(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
      </Card>

      {loans.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Nenhum empréstimo cadastrado ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => {
            const penalty = calculatePenalty(loan);
            const isOverdue = !loan.isSettled && loan.remainingInstallments > 0 && new Date() > loan.loanDate;
            
            return (
              <Card key={loan.id} className={`${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-base">{loan.fullName}</h3>
                      <p className="text-sm text-gray-600">{loan.cpf}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{loan.phone}</span>
                      </div>
                    </div>
                    <Badge variant={loan.isSettled ? 'default' : isOverdue ? 'destructive' : 'secondary'}>
                      {loan.isSettled ? 'Quitado' : isOverdue ? 'Em Atraso' : 'Em Dia'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Valor</p>
                        <p className="font-medium">{formatCurrency(loan.loanAmount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Data</p>
                        <p className="font-medium">{loan.loanDate.toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Parcelas</p>
                      <p className="font-medium">{loan.paidInstallments}/{loan.totalInstallments}</p>
                      <p className="text-xs text-gray-600">{loan.remainingInstallments} restantes</p>
                    </div>
                    {penalty > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-red-500">Multa</p>
                        <p className="font-medium text-red-600">{formatCurrency(penalty)}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedLoan(loan)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[90vw] max-w-sm">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Empréstimo</DialogTitle>
                        </DialogHeader>
                        {selectedLoan && (
                          <div className="space-y-4">
                            {selectedLoan.photo && (
                              <div>
                                <img 
                                  src={selectedLoan.photo} 
                                  alt="Foto do cliente" 
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                              </div>
                            )}
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Cliente:</span> {selectedLoan.fullName}
                              </div>
                              <div>
                                <span className="font-medium">CPF:</span> {selectedLoan.cpf}
                              </div>
                              <div>
                                <span className="font-medium">Telefone:</span> {selectedLoan.phone}
                              </div>
                              <div>
                                <span className="font-medium">Valor:</span> {formatCurrency(selectedLoan.loanAmount)}
                              </div>
                              <div>
                                <span className="font-medium">Data:</span> {selectedLoan.loanDate.toLocaleDateString('pt-BR')}
                              </div>
                              <div>
                                <span className="font-medium">Parcelas:</span> {selectedLoan.paidInstallments}/{selectedLoan.totalInstallments}
                              </div>
                              <div>
                                <span className="font-medium">Sanção/dia:</span> {formatCurrency(selectedLoan.dailyPenalty)}
                              </div>
                              {calculatePenalty(selectedLoan) > 0 && (
                                <div>
                                  <span className="font-medium text-red-600">Multa atual:</span> 
                                  <span className="text-red-600"> {formatCurrency(calculatePenalty(selectedLoan))}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {!loan.isSettled && (
                      <Button
                        size="sm"
                        onClick={() => handleSettleLoan(loan.id, loan.fullName)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Quitar
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generatePDF(loan)}
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}