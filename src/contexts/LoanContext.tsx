"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Loan, LoanReport } from '@/types';

interface LoanContextType {
  loans: Loan[];
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'remainingInstallments'>) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  settleLoan: (id: string) => void;
  getOverdueLoans: () => Loan[];
  getLoanReport: () => LoanReport;
  calculatePenalty: (loan: Loan) => number;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export function LoanProvider({ children }: { children: React.ReactNode }) {
  const [loans, setLoans] = useState<Loan[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedLoans = localStorage.getItem('credconecta-loans');
    if (savedLoans) {
      setLoans(JSON.parse(savedLoans).map((loan: any) => ({
        ...loan,
        loanDate: new Date(loan.loanDate),
        createdAt: new Date(loan.createdAt),
        updatedAt: new Date(loan.updatedAt),
      })));
    }
  }, []);

  // Salvar empréstimos no localStorage
  useEffect(() => {
    localStorage.setItem('credconecta-loans', JSON.stringify(loans));
  }, [loans]);

  const addLoan = (loanData: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'remainingInstallments'>) => {
    const newLoan: Loan = {
      ...loanData,
      id: Date.now().toString(),
      remainingInstallments: loanData.totalInstallments - loanData.paidInstallments,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setLoans(prev => [...prev, newLoan]);
  };

  const updateLoan = (id: string, updates: Partial<Loan>) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id === id) {
        const updatedLoan = { ...loan, ...updates, updatedAt: new Date() };
        // Recalcular parcelas restantes
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
    updateLoan(id, { 
      isSettled: true, 
      paidInstallments: loans.find(l => l.id === id)?.totalInstallments || 0,
      remainingInstallments: 0 
    });
  };

  const calculatePenalty = (loan: Loan): number => {
    if (loan.isSettled) return 0;
    
    const today = new Date();
    const loanDate = new Date(loan.loanDate);
    const daysDiff = Math.floor((today.getTime() - loanDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff > 0 ? daysDiff * loan.dailyPenalty : 0;
  };

  const getOverdueLoans = (): Loan[] => {
    return loans.filter(loan => {
      if (loan.isSettled) return false;
      const today = new Date();
      const loanDate = new Date(loan.loanDate);
      return today > loanDate && loan.remainingInstallments > 0;
    });
  };

  const getLoanReport = (): LoanReport => {
    const totalLoans = loans.length;
    const totalAmount = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
    const settledLoans = loans.filter(loan => loan.isSettled).length;
    const pendingLoans = loans.filter(loan => !loan.isSettled).length;
    const overdueLoans = getOverdueLoans().length;
    const totalPenalties = loans.reduce((sum, loan) => sum + calculatePenalty(loan), 0);

    return {
      totalLoans,
      totalAmount,
      settledLoans,
      pendingLoans,
      overdueLoans,
      totalPenalties,
    };
  };

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