"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useContracts } from '@/contexts/ContractContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FileText, Eye, Download, Send, Trash2, Plus } from 'lucide-react';

export function ContractManagement() {
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { contracts, deleteContract } = useContracts();
  const { currentUser } = useAuth();

  // Filtrar contratos do usuário atual (se for usuário comum)
  const userContracts = currentUser?.type === 'admin' 
    ? contracts 
    : contracts.filter(contract => contract.createdBy === currentUser?.id);

  const handleDeleteContract = (contractId: string, clientName: string) => {
    if (confirm(`Tem certeza que deseja excluir o contrato de ${clientName}?`)) {
      deleteContract(contractId);
      toast.success('Contrato excluído com sucesso');
    }
  };

  const generatePDF = (contract: any) => {
    const pdfData = {
      contractId: contract.id,
      clientName: contract.clientName,
      clientCpf: contract.clientCpf,
      loanAmount: contract.loanAmount,
      totalInstallments: contract.totalInstallments,
      contractDate: contract.contractDate.toLocaleDateString('pt-BR'),
      status: contract.status,
      signatures: {
        client: contract.clientSignature ? 'Assinado' : 'Pendente',
        lender: contract.lenderSignature ? 'Assinado' : 'Pendente',
      },
      generatedAt: new Date().toLocaleString('pt-BR'),
    };

    console.log('=== CONTRATO PDF ===');
    console.log('ID:', pdfData.contractId);
    console.log('Cliente:', pdfData.clientName);
    console.log('CPF:', pdfData.clientCpf);
    console.log('Valor:', pdfData.loanAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    console.log('Parcelas:', pdfData.totalInstallments);
    console.log('Data do Contrato:', pdfData.contractDate);
    console.log('Status:', pdfData.status);
    console.log('Assinatura Cliente:', pdfData.signatures.client);
    console.log('Assinatura Credor:', pdfData.signatures.lender);
    console.log('Gerado em:', pdfData.generatedAt);
    console.log('==================');

    toast.success('PDF do contrato gerado! Verifique o console');
  };

  const sendContract = (contract: any) => {
    const message = `
📄 *Contrato de Empréstimo - CredConecta*

Olá ${contract.clientName}!

Seu contrato está disponível:
💰 Valor: ${contract.loanAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
📅 Data: ${contract.contractDate.toLocaleDateString('pt-BR')}
📋 Parcelas: ${contract.totalInstallments}x
📋 ID: ${contract.id}

Status: ${contract.status === 'signed' ? '✅ Assinado' : '⏳ Aguardando assinatura'}

Para dúvidas, entre em contato conosco.

CredConecta Empréstimos
    `;

    console.log('=== ENVIO DE CONTRATO ===');
    console.log('Para:', contract.clientPhone);
    console.log('Cliente:', contract.clientName);
    console.log('Mensagem:', message);
    console.log('========================');

    toast.success(`Contrato enviado para ${contract.clientName}!`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <Badge variant="default">Assinado</Badge>;
      case 'completed':
        return <Badge variant="default">Completo</Badge>;
      default:
        return <Badge variant="secondary">Rascunho</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Contratos Digitais</h2>
          <p className="text-gray-600">Gerencie todos os contratos do sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contratos Cadastrados ({userContracts.length})</CardTitle>
          <CardDescription>
            Lista de todos os contratos {currentUser?.type === 'admin' ? 'do sistema' : 'seus'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userContracts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">Nenhum contrato encontrado</p>
              <p className="text-sm text-gray-400">
                Os contratos são gerados automaticamente ao criar empréstimos
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.clientName}</TableCell>
                      <TableCell>{contract.clientCpf}</TableCell>
                      <TableCell>{formatCurrency(contract.loanAmount)}</TableCell>
                      <TableCell>{contract.contractDate.toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedContract(contract);
                              setShowDetails(true);
                            }}
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generatePDF(contract)}
                            title="Gerar PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendContract(contract)}
                            title="Enviar contrato"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          
                          {currentUser?.type === 'admin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteContract(contract.id, contract.clientName)}
                              title="Excluir contrato"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes do Contrato */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Contrato</DialogTitle>
            <DialogDescription>
              Informações completas do contrato
            </DialogDescription>
          </DialogHeader>
          
          {selectedContract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">ID do Contrato</Label>
                  <p className="font-mono text-sm">{selectedContract.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedContract.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Cliente</Label>
                  <p>{selectedContract.clientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">CPF</Label>
                  <p>{selectedContract.clientCpf}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Telefone</Label>
                  <p>{selectedContract.clientPhone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Valor do Empréstimo</Label>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(selectedContract.loanAmount)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Parcelas</Label>
                  <p>{selectedContract.totalInstallments}x</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Multa Diária</Label>
                  <p>{formatCurrency(selectedContract.dailyPenalty)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data do Empréstimo</Label>
                  <p>{selectedContract.loanDate.toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data do Contrato</Label>
                  <p>{selectedContract.contractDate.toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Assinaturas</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Cliente</span>
                    <Badge variant={selectedContract.clientSignature ? 'default' : 'secondary'}>
                      {selectedContract.clientSignature ? 'Assinado' : 'Pendente'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Credor</span>
                    <Badge variant={selectedContract.lenderSignature ? 'default' : 'secondary'}>
                      {selectedContract.lenderSignature ? 'Assinado' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => generatePDF(selectedContract)} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
                <Button onClick={() => sendContract(selectedContract)} variant="outline" className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}