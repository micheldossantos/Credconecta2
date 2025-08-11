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
        createdBy: loan.createdBy || 'admin', // Fallback para empréstimos antigos
      })));
    }
  }, []);

  // Salvar empréstimos no localStorage
  useEffect(() => {
    localStorage.setItem('credconecta-loans', JSON.stringify(loans));
  }, [loans]);

  const addLoan = (loanData: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'remainingInstallments'>, userId = 'admin') => {
    const newLoan: Loan = {
      ...loanData,
      id: Date.now().toString(),
      remainingInstallments: loanData.totalInstallments - loanData.paidInstallments,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId, // Adicionar quem criou o empréstimo
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