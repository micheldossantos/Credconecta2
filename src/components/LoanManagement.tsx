"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLoans } from '@/contexts/LoanContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, CheckCircle, Edit, FileText, Camera, Upload } from 'lucide-react';
import { Loan } from '@/types';

const loanSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().min(14, 'CPF deve estar completo'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  loanDate: z.string().min(1, 'Data do empréstimo é obrigatória'),
  loanAmount: z.number().min(1, 'Valor deve ser maior que zero'),
  totalInstallments: z.number().min(1, 'Número de parcelas deve ser maior que zero'),
  paidInstallments: z.number().min(0, 'Parcelas pagas não pode ser negativo'),
});

type LoanFormData = z.infer<typeof loanSchema>;

export function LoanManagement() {
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const { loans, addLoan, updateLoan, settleLoan, calculatePenalty } = useLoans();

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
  });

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: LoanFormData) => {
    const loanData = {
      ...data,
      loanDate: new Date(data.loanDate),
      dailyPenalty: 30, // Sanção fixa de R$ 30 por dia
      photo: selectedPhoto || undefined,
      isSettled: false,
    };

    if (editingLoan) {
      updateLoan(editingLoan.id, loanData);
      toast.success('Empréstimo atualizado com sucesso');
      setEditingLoan(null);
    } else {
      addLoan(loanData);
      toast.success('Empréstimo cadastrado com sucesso');
    }

    reset();
    setSelectedPhoto(null);
    setShowAddLoan(false);
  };

  const handleEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setValue('fullName', loan.fullName);
    setValue('cpf', loan.cpf);
    setValue('phone', loan.phone);
    setValue('loanDate', loan.loanDate.toISOString().split('T')[0]);
    setValue('loanAmount', loan.loanAmount);
    setValue('totalInstallments', loan.totalInstallments);
    setValue('paidInstallments', loan.paidInstallments);
    setSelectedPhoto(loan.photo || null);
    setShowAddLoan(true);
  };

  const handleSettleLoan = (loanId: string, loanName: string) => {
    if (confirm(`Confirma a quitação do empréstimo de ${loanName}?`)) {
      settleLoan(loanId);
      toast.success('Empréstimo marcado como quitado');
    }
  };

  const generateReceipt = (loan: Loan) => {
    // Simular geração de PDF (em uma implementação real, usaria uma biblioteca como jsPDF)
    const receiptData = {
      loanId: loan.id,
      clientName: loan.fullName,
      cpf: loan.cpf,
      amount: loan.loanAmount,
      date: loan.loanDate.toLocaleDateString('pt-BR'),
      installments: `${loan.paidInstallments}/${loan.totalInstallments}`,
      penalty: calculatePenalty(loan),
    };
    
    console.log('Dados do comprovante:', receiptData);
    toast.success('Comprovante gerado! (Verifique o console para os dados)');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Empréstimos</h2>
          <p className="text-gray-600">Cadastre e gerencie empréstimos do sistema</p>
        </div>
        
        <Dialog open={showAddLoan} onOpenChange={(open) => {
          setShowAddLoan(open);
          if (!open) {
            setEditingLoan(null);
            reset();
            setSelectedPhoto(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Empréstimo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLoan ? 'Editar Empréstimo' : 'Cadastrar Novo Empréstimo'}
              </DialogTitle>
              <DialogDescription>
                Preencha todos os dados do empréstimo
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    {...register('fullName')}
                    placeholder="Nome do cliente"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={watch('cpf') || ''}
                    onChange={(e) => setValue('cpf', formatCPF(e.target.value))}
                    maxLength={14}
                  />
                  {errors.cpf && (
                    <p className="text-sm text-red-600 mt-1">{errors.cpf.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={watch('phone') || ''}
                    onChange={(e) => setValue('phone', formatPhone(e.target.value))}
                    maxLength={15}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="loanDate">Data do Empréstimo</Label>
                  <Input
                    id="loanDate"
                    type="date"
                    {...register('loanDate')}
                  />
                  {errors.loanDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.loanDate.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="loanAmount">Valor do Empréstimo</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('loanAmount', { valueAsNumber: true })}
                  />
                  {errors.loanAmount && (
                    <p className="text-sm text-red-600 mt-1">{errors.loanAmount.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="totalInstallments">Total de Parcelas</Label>
                  <Input
                    id="totalInstallments"
                    type="number"
                    placeholder="12"
                    {...register('totalInstallments', { valueAsNumber: true })}
                  />
                  {errors.totalInstallments && (
                    <p className="text-sm text-red-600 mt-1">{errors.totalInstallments.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="paidInstallments">Parcelas Pagas</Label>
                  <Input
                    id="paidInstallments"
                    type="number"
                    placeholder="0"
                    {...register('paidInstallments', { valueAsNumber: true })}
                  />
                  {errors.paidInstallments && (
                    <p className="text-sm text-red-600 mt-1">{errors.paidInstallments.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="photo">Foto do Cliente</Label>
                <div className="mt-2 space-y-2">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                  {selectedPhoto && (
                    <div className="mt-2">
                      <img 
                        src={selectedPhoto} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingLoan ? 'Atualizar' : 'Cadastrar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddLoan(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empréstimos Cadastrados ({loans.length})</CardTitle>
          <CardDescription>
            Lista de todos os empréstimos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum empréstimo cadastrado ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Parcelas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Multa</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => {
                    const penalty = calculatePenalty(loan);
                    const isOverdue = !loan.isSettled && loan.remainingInstallments > 0 && new Date() > loan.loanDate;
                    
                    return (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{loan.fullName}</TableCell>
                        <TableCell>{loan.cpf}</TableCell>
                        <TableCell>R$ {loan.loanAmount.toLocaleString('pt-BR')}</TableCell>
                        <TableCell>
                          {loan.paidInstallments}/{loan.totalInstallments}
                          <br />
                          <span className="text-sm text-gray-500">
                            {loan.remainingInstallments} restantes
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={loan.isSettled ? 'default' : isOverdue ? 'destructive' : 'secondary'}>
                            {loan.isSettled ? 'Quitado' : isOverdue ? 'Em Atraso' : 'Em Dia'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {penalty > 0 ? (
                            <span className="text-red-600 font-medium">
                              R$ {penalty.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {!loan.isSettled && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleSettleLoan(loan.id, loan.fullName)}
                                title="Marcar como quitado"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditLoan(loan)}
                              title="Editar empréstimo"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateReceipt(loan)}
                              title="Gerar comprovante"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}