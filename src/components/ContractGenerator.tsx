"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useContracts } from '@/contexts/ContractContext';
import { useAuth } from '@/contexts/AuthContext';
import { Contract, Loan } from '@/types';
import { toast } from 'sonner';
import { FileText, Download, Edit, Signature, Send, Eye } from 'lucide-react';

interface ContractGeneratorProps {
  loan: Loan;
  onContractGenerated?: (contract: Contract) => void;
}

export function ContractGenerator({ loan, onContractGenerated }: ContractGeneratorProps) {
  const [showGenerator, setShowGenerator] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const [contractContent, setContractContent] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const { templates, addContract, updateContract, getContractByLoanId, generateContractFromLoan } = useContracts();
  const { currentUser } = useAuth();

  // Verificar se já existe contrato para este empréstimo
  const existingContract = getContractByLoanId(loan.id);

  const generateContract = () => {
    if (!currentUser?.id) {
      toast.error('Usuário não identificado');
      return;
    }

    try {
      const defaultTemplate = templates.find(t => t.name.includes('Padrão')) || templates[0];
      if (!defaultTemplate) {
        toast.error('Nenhum template disponível');
        return;
      }

      const contract = generateContractFromLoan(loan, defaultTemplate.id, currentUser.id);
      
      // Substituir variáveis no template
      let content = defaultTemplate.content;
      content = content.replace(/{{clientName}}/g, loan.fullName);
      content = content.replace(/{{clientCpf}}/g, loan.cpf);
      content = content.replace(/{{clientPhone}}/g, loan.phone);
      content = content.replace(/{{loanAmount}}/g, loan.loanAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
      content = content.replace(/{{loanAmountText}}/g, numberToWords(loan.loanAmount));
      content = content.replace(/{{totalInstallments}}/g, loan.totalInstallments.toString());
      content = content.replace(/{{dailyPenalty}}/g, loan.dailyPenalty.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
      content = content.replace(/{{loanDate}}/g, loan.loanDate.toLocaleDateString('pt-BR'));
      content = content.replace(/{{contractDate}}/g, new Date().toLocaleDateString('pt-BR'));

      setContractContent(content);
      setCurrentContract(contract);
      setShowGenerator(true);
      
      toast.success('Contrato gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar contrato');
      console.error(error);
    }
  };

  const saveContract = () => {
    if (!currentContract) return;

    addContract(currentContract);
    setShowGenerator(false);
    
    if (onContractGenerated) {
      onContractGenerated(currentContract);
    }
    
    toast.success('Contrato salvo com sucesso!');
  };

  const startSignature = () => {
    setShowSignature(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas && currentContract) {
      const signatureData = canvas.toDataURL();
      
      const updatedContract = {
        ...currentContract,
        clientSignature: signatureData,
        status: 'signed' as const,
      };
      
      setCurrentContract(updatedContract);
      updateContract(currentContract.id, updatedContract);
      setShowSignature(false);
      
      toast.success('Assinatura salva com sucesso!');
    }
  };

  const generatePDF = () => {
    if (!currentContract) return;

    // Simular geração de PDF
    const pdfData = {
      contractId: currentContract.id,
      clientName: currentContract.clientName,
      content: contractContent,
      signatures: {
        client: currentContract.clientSignature ? 'Assinado' : 'Pendente',
        lender: currentContract.lenderSignature ? 'Assinado' : 'Pendente',
      },
      generatedAt: new Date().toLocaleString('pt-BR'),
    };

    console.log('=== CONTRATO PDF ===');
    console.log('ID:', pdfData.contractId);
    console.log('Cliente:', pdfData.clientName);
    console.log('Gerado em:', pdfData.generatedAt);
    console.log('\n--- CONTEÚDO ---');
    console.log(contractContent);
    console.log('\n--- ASSINATURAS ---');
    console.log('Cliente:', pdfData.signatures.client);
    console.log('Credor:', pdfData.signatures.lender);
    console.log('==================');

    toast.success('PDF gerado! Verifique o console para visualizar');
  };

  const sendContract = () => {
    if (!currentContract) return;

    // Simular envio por WhatsApp/Email
    const message = `
📄 *Contrato de Empréstimo*

Olá ${currentContract.clientName}!

Seu contrato de empréstimo foi gerado:
💰 Valor: ${currentContract.loanAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
📅 Data: ${currentContract.contractDate.toLocaleDateString('pt-BR')}
📋 Parcelas: ${currentContract.totalInstallments}x

Status: ${currentContract.status === 'signed' ? '✅ Assinado' : '⏳ Aguardando assinatura'}

CredConecta Empréstimos
    `;

    console.log('=== ENVIO DE CONTRATO ===');
    console.log('Para:', currentContract.clientPhone);
    console.log('Mensagem:', message);
    console.log('========================');

    toast.success('Contrato enviado por WhatsApp!');
  };

  // Função auxiliar para converter números em texto
  const numberToWords = (num: number): string => {
    // Implementação simplificada
    const units = ['', 'mil', 'milhão', 'bilhão'];
    const ones = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    
    if (num < 10) return ones[num] + ' reais';
    if (num < 1000) return Math.floor(num).toString() + ' reais';
    
    return num.toLocaleString('pt-BR') + ' reais';
  };

  // Funções de desenho para assinatura
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="space-y-4">
      {/* Botão principal */}
      {!existingContract ? (
        <Button onClick={generateContract} className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          Gerar Contrato
        </Button>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium">Contrato Existente</h3>
                <p className="text-sm text-gray-600">ID: {existingContract.id}</p>
              </div>
              <Badge variant={existingContract.status === 'signed' ? 'default' : 'secondary'}>
                {existingContract.status === 'signed' ? 'Assinado' : 'Rascunho'}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => {
                setCurrentContract(existingContract);
                setShowGenerator(true);
              }}>
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              
              {existingContract.status !== 'signed' && (
                <Button size="sm" onClick={() => {
                  setCurrentContract(existingContract);
                  startSignature();
                }}>
                  <Signature className="h-4 w-4 mr-1" />
                  Assinar
                </Button>
              )}
              
              <Button size="sm" variant="outline" onClick={() => {
                setCurrentContract(existingContract);
                generatePDF();
              }}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog do Gerador de Contrato */}
      <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contrato de Empréstimo</DialogTitle>
            <DialogDescription>
              Revise e personalize o contrato antes de salvar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="contractContent">Conteúdo do Contrato</Label>
              <Textarea
                id="contractContent"
                value={contractContent}
                onChange={(e) => setContractContent(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={saveContract} className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Salvar Contrato
              </Button>
              
              <Button onClick={startSignature} variant="outline" className="flex-1">
                <Signature className="h-4 w-4 mr-2" />
                Assinar
              </Button>
              
              <Button onClick={generatePDF} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Gerar PDF
              </Button>
              
              <Button onClick={sendContract} variant="outline" className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Assinatura */}
      <Dialog open={showSignature} onOpenChange={setShowSignature}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Assinatura Digital</DialogTitle>
            <DialogDescription>
              Desenhe sua assinatura na área abaixo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-2">
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="border rounded cursor-crosshair w-full"
                style={{ touchAction: 'none' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={clearSignature} variant="outline" className="flex-1">
                Limpar
              </Button>
              <Button onClick={saveSignature} className="flex-1">
                <Signature className="h-4 w-4 mr-2" />
                Salvar Assinatura
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}