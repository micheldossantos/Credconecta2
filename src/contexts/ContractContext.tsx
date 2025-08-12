"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Contract, ContractTemplate } from '@/types';

interface ContractContextType {
  contracts: Contract[];
  templates: ContractTemplate[];
  addContract: (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
  getContractByLoanId: (loanId: string) => Contract | undefined;
  addTemplate: (template: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTemplate: (id: string, updates: Partial<ContractTemplate>) => void;
  deleteTemplate: (id: string) => void;
  generateContractFromLoan: (loanData: any, templateId: string, userId: string) => Contract;
  loading: boolean;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

// Template padrão de contrato
const defaultTemplate: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Contrato de Empréstimo Padrão',
  description: 'Template padrão para contratos de empréstimo',
  isActive: true,
  variables: ['clientName', 'clientCpf', 'clientPhone', 'loanAmount', 'totalInstallments', 'dailyPenalty', 'loanDate'],
  content: `
CONTRATO DE EMPRÉSTIMO

Pelo presente instrumento particular, as partes abaixo qualificadas:

CREDOR: CredConecta Empréstimos
CNPJ: 00.000.000/0001-00
Endereço: Rua das Finanças, 123 - Centro

DEVEDOR: {{clientName}}
CPF: {{clientCpf}}
Telefone: {{clientPhone}}

Têm entre si justo e acordado o seguinte:

CLÁUSULA 1ª - DO OBJETO
O CREDOR empresta ao DEVEDOR a quantia de R$ {{loanAmount}} ({{loanAmountText}}).

CLÁUSULA 2ª - DO PAGAMENTO
O pagamento será efetuado em {{totalInstallments}} parcelas, com vencimento a partir de {{loanDate}}.

CLÁUSULA 3ª - DA MORA
Em caso de atraso no pagamento, será aplicada multa de R$ {{dailyPenalty}} por dia de atraso.

CLÁUSULA 4ª - DO FORO
Fica eleito o foro da comarca local para dirimir quaisquer questões oriundas do presente contrato.

Data: {{contractDate}}

_________________________        _________________________
    Assinatura do Credor              Assinatura do Devedor

_________________________
   Assinatura da Testemunha
  `
};

export function ContractProvider({ children }: { children: React.ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Carregar dados do localStorage
  useEffect(() => {
    if (!mounted) return;

    const loadData = () => {
      try {
        // Carregar contratos
        const savedContracts = localStorage.getItem('credconecta-contracts');
        if (savedContracts) {
          const parsedContracts = JSON.parse(savedContracts).map((contract: any) => ({
            ...contract,
            loanDate: new Date(contract.loanDate),
            contractDate: new Date(contract.contractDate),
            createdAt: new Date(contract.createdAt),
            updatedAt: new Date(contract.updatedAt),
          }));
          setContracts(parsedContracts);
        }

        // Carregar templates
        const savedTemplates = localStorage.getItem('credconecta-templates');
        if (savedTemplates) {
          const parsedTemplates = JSON.parse(savedTemplates).map((template: any) => ({
            ...template,
            createdAt: new Date(template.createdAt),
            updatedAt: new Date(template.updatedAt),
          }));
          setTemplates(parsedTemplates);
        } else {
          // Criar template padrão se não existir
          const newTemplate: ContractTemplate = {
            ...defaultTemplate,
            id: 'default-template',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setTemplates([newTemplate]);
        }
      } catch (error) {
        console.error('Erro ao carregar contratos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mounted]);

  // Salvar contratos no localStorage
  useEffect(() => {
    if (mounted && contracts.length > 0) {
      try {
        localStorage.setItem('credconecta-contracts', JSON.stringify(contracts));
      } catch (error) {
        console.error('Erro ao salvar contratos:', error);
      }
    }
  }, [contracts, mounted]);

  // Salvar templates no localStorage
  useEffect(() => {
    if (mounted && templates.length > 0) {
      try {
        localStorage.setItem('credconecta-templates', JSON.stringify(templates));
      } catch (error) {
        console.error('Erro ao salvar templates:', error);
      }
    }
  }, [templates, mounted]);

  const addContract = (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newContract: Contract = {
      ...contractData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setContracts(prev => [...prev, newContract]);
  };

  const updateContract = (id: string, updates: Partial<Contract>) => {
    setContracts(prev => prev.map(contract => 
      contract.id === id ? { ...contract, ...updates, updatedAt: new Date() } : contract
    ));
  };

  const deleteContract = (id: string) => {
    setContracts(prev => prev.filter(contract => contract.id !== id));
  };

  const getContractByLoanId = (loanId: string): Contract | undefined => {
    return contracts.find(contract => contract.loanId === loanId);
  };

  const addTemplate = (templateData: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: ContractTemplate = {
      ...templateData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const updateTemplate = (id: string, updates: Partial<ContractTemplate>) => {
    setTemplates(prev => prev.map(template => 
      template.id === id ? { ...template, ...updates, updatedAt: new Date() } : template
    ));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  };

  const generateContractFromLoan = (loanData: any, templateId: string, userId: string): Contract => {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template não encontrado');
    }

    const contract: Contract = {
      id: Date.now().toString(),
      loanId: loanData.id || Date.now().toString(),
      templateId,
      clientName: loanData.fullName,
      clientCpf: loanData.cpf,
      clientPhone: loanData.phone,
      loanAmount: loanData.loanAmount,
      totalInstallments: loanData.totalInstallments,
      dailyPenalty: loanData.dailyPenalty,
      loanDate: loanData.loanDate,
      contractDate: new Date(),
      status: 'draft',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return contract;
  };

  if (!mounted) {
    return (
      <ContractContext.Provider value={{
        contracts: [],
        templates: [],
        addContract: () => {},
        updateContract: () => {},
        deleteContract: () => {},
        getContractByLoanId: () => undefined,
        addTemplate: () => {},
        updateTemplate: () => {},
        deleteTemplate: () => {},
        generateContractFromLoan: () => ({} as Contract),
        loading: true,
      }}>
        {children}
      </ContractContext.Provider>
    );
  }

  return (
    <ContractContext.Provider value={{
      contracts,
      templates,
      addContract,
      updateContract,
      deleteContract,
      getContractByLoanId,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      generateContractFromLoan,
      loading,
    }}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContracts() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContracts must be used within a ContractProvider');
  }
  return context;
}