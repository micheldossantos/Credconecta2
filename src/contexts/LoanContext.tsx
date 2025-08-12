"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Loan, LoanReport } from '@/types';

interface LoanContextType {
  loans: Loan[];
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'remainingInstallments'>, userId?: string) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  settleLoan: (id: string) => void;
  getOverdueLoans: (userId?: string) => Loan[];
  getLoanReport: (userId?: string) => LoanReport;
  calculatePenalty: (loan: Loan) => number;
  getUserLoans: (userId: string) => Loan[];
  loading: boolean;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export function LoanProvider({ children }: { children: React.ReactNode }) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Verificar se o componente foi montado no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Carregar empréstimos do localStorage
  useEffect(() => {
    if (!mounted) return;

    const loadLoans = () => {
      try {
        const savedLoans = localStorage.getItem('credconecta-loans');
        if (savedLoans) {
          const parsedLoans = JSON.parse(savedLoans).map((loan: any) => ({
            ...loan,
            loanDate: new Date(loan.loanDate),
            createdAt: new Date(loan.createdAt),
            updatedAt: new Date(loan.updatedAt),
          }));
          setLoans(parsedLoans);
        }
      } catch (error) {
        console.error('Erro ao carregar empréstimos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLoans();
  }, [mounted]);

  // Salvar empréstimos no localStorage
  useEffect(() => {
    if (mounted && loans.length > 0) {
      try {
        localStorage.setItem('credconecta-loans', JSON.stringify(loans));
      } catch (error) {
        console.error('Erro ao salvar empréstimos:', error);
      }
    }
  }, [loans, mounted]);

  const addLoan = (loanData: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'remainingInstallments'>, userId = 'admin') => {
    const remainingInstallments = loanData.totalInstallments - loanData.paidInstallments;
    const newLoan: Loan = {
      ...loanData,
      id: Date.now().toString(),
      remainingInstallments,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
    };
    setLoans(prev => [...prev, newLoan]);
  };

  const updateLoan = (id: string, updates: Partial<Loan>) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id === id) {
        const updatedLoan = { ...loan, ...updates, updatedAt: new Date() };
        if (updates.paidInstallments !== undefined || updates.totalInstallments !== undefined) {
          updatedLoan.remainingInstallments = updatedLoan.totalInstallments - updatedLoan.paidInstallments;
        }
        return updatedLoan;
      }
      return loan;
    }));
  };

  const deleteLoan = (id: string) => {
    setLoans(prev => prev.filter(loan => loan.id !== id));
  };

  const settleLoan = (id: string) => {
    const loan = loans.find(l => l.id === id);
    if (loan) {
      updateLoan(id, { 
        isSettled: true, 
        paidInstallments: loan.totalInstallments,
        remainingInstallments: 0 
      });
    }
  };

  const calculatePenalty = (loan: Loan): number => {
    if (loan.isSettled) return 0;
    
    const today = new Date();
    const loanDate = new Date(loan.loanDate);
    const daysDiff = Math.floor((today.getTime() - loanDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff > 0 ? daysDiff * loan.dailyPenalty : 0;
  };

  const getUserLoans = (userId: string): Loan[] => {
    return loans.filter(loan => loan.createdBy === userId);
  };

  const getOverdueLoans = (userId?: string): Loan[] => {
    const filteredLoans = userId ? getUserLoans(userId) : loans;
    return filteredLoans.filter(loan => {
      if (loan.isSettled) return false;
      const today = new Date();
      const loanDate = new Date(loan.loanDate);
      return today > loanDate && loan.remainingInstallments > 0;
    });
  };

  const getLoanReport = (userId?: string): LoanReport => {
    const filteredLoans = userId ? getUserLoans(userId) : loans;
    const totalLoans = filteredLoans.length;
    const totalAmount = filteredLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);
    const settledLoans = filteredLoans.filter(loan => loan.isSettled).length;
    const pendingLoans = filteredLoans.filter(loan => !loan.isSettled).length;
    const overdueLoans = getOverdueLoans(userId).length;
    const totalPenalties = filteredLoans.reduce((sum, loan) => sum + calculatePenalty(loan), 0);

    return {
      totalLoans,
      totalAmount,
      settledLoans,
      pendingLoans,
      overdueLoans,
      totalPenalties,
    };
  };

  // Não renderizar até estar montado
  if (!mounted) {
    return (
      <LoanContext.Provider value={{
        loans: [],
        addLoan: () => {},
        updateLoan: () => {},
        deleteLoan: () => {},
        settleLoan: () => {},
        getOverdueLoans: () => [],
        getLoanReport: () => ({ totalLoans: 0, totalAmount: 0, settledLoans: 0, pendingLoans: 0, overdueLoans: 0, totalPenalties: 0 }),
        calculatePenalty: () => 0,
        getUserLoans: () => [],
        loading: true,
      }}>
        {children}
      </LoanContext.Provider>
    );
  }

  return (
    <LoanContext.Provider value={{
      loans,
      addLoan,
      updateLoan,
      deleteLoan,
      settleLoan,
      getOverdueLoans,
      getLoanReport,
      calculatePenalty,
      getUserLoans,
      loading,
    }}>
      {children}
    </LoanContext.Provider>
  );
}

export function useLoans() {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error('useLoans must be used within a LoanProvider');
  }
  return context;
}