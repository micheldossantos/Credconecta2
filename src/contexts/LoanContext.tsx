"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Loan, LoanReport } from '@/types';
import { supabase, DatabaseLoan } from '@/lib/supabase';

interface LoanContextType {
  loans: Loan[];
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'remainingInstallments'>, userId?: string) => Promise<void>;
  updateLoan: (id: string, updates: Partial<Loan>) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  settleLoan: (id: string) => Promise<void>;
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

  // Carregar empréstimos do Supabase
  const loadLoans = async () => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar empréstimos:', error);
        return;
      }

      const formattedLoans: Loan[] = data.map((loan: DatabaseLoan) => ({
        id: loan.id,
        fullName: loan.full_name,
        cpf: loan.cpf,
        phone: loan.phone,
        loanDate: new Date(loan.loan_date),
        loanAmount: loan.loan_amount,
        totalInstallments: loan.total_installments,
        paidInstallments: loan.paid_installments,
        remainingInstallments: loan.remaining_installments,
        dailyPenalty: loan.daily_penalty,
        photo: loan.photo,
        isSettled: loan.is_settled,
        createdAt: new Date(loan.created_at),
        updatedAt: new Date(loan.updated_at),
        createdBy: loan.created_by,
      }));

      setLoans(formattedLoans);
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const initializeLoans = async () => {
      setLoading(true);
      await loadLoans();
      setLoading(false);
    };

    initializeLoans();
  }, []);

  const addLoan = async (loanData: Omit<Loan, 'id' | 'createdAt' | 'updatedAt' | 'remainingInstallments'>, userId = 'admin') => {
    try {
      const remainingInstallments = loanData.totalInstallments - loanData.paidInstallments;

      const { data, error } = await supabase
        .from('loans')
        .insert({
          full_name: loanData.fullName,
          cpf: loanData.cpf,
          phone: loanData.phone,
          loan_date: loanData.loanDate.toISOString().split('T')[0],
          loan_amount: loanData.loanAmount,
          total_installments: loanData.totalInstallments,
          paid_installments: loanData.paidInstallments,
          remaining_installments: remainingInstallments,
          daily_penalty: loanData.dailyPenalty,
          photo: loanData.photo,
          is_settled: loanData.isSettled,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar empréstimo:', error);
        return;
      }

      // Recarregar empréstimos
      await loadLoans();
    } catch (error) {
      console.error('Erro ao adicionar empréstimo:', error);
    }
  };

  const updateLoan = async (id: string, updates: Partial<Loan>) => {
    try {
      const updateData: any = {};
      
      if (updates.fullName) updateData.full_name = updates.fullName;
      if (updates.cpf) updateData.cpf = updates.cpf;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.loanDate) updateData.loan_date = updates.loanDate.toISOString().split('T')[0];
      if (updates.loanAmount) updateData.loan_amount = updates.loanAmount;
      if (updates.totalInstallments) updateData.total_installments = updates.totalInstallments;
      if (updates.paidInstallments !== undefined) updateData.paid_installments = updates.paidInstallments;
      if (updates.dailyPenalty) updateData.daily_penalty = updates.dailyPenalty;
      if (updates.photo !== undefined) updateData.photo = updates.photo;
      if (updates.isSettled !== undefined) updateData.is_settled = updates.isSettled;

      // Recalcular parcelas restantes se necessário
      if (updates.paidInstallments !== undefined || updates.totalInstallments !== undefined) {
        const currentLoan = loans.find(l => l.id === id);
        if (currentLoan) {
          const totalInstallments = updates.totalInstallments ?? currentLoan.totalInstallments;
          const paidInstallments = updates.paidInstallments ?? currentLoan.paidInstallments;
          updateData.remaining_installments = totalInstallments - paidInstallments;
        }
      }

      const { error } = await supabase
        .from('loans')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar empréstimo:', error);
        return;
      }

      // Recarregar empréstimos
      await loadLoans();
    } catch (error) {
      console.error('Erro ao atualizar empréstimo:', error);
    }
  };

  const deleteLoan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar empréstimo:', error);
        return;
      }

      // Recarregar empréstimos
      await loadLoans();
    } catch (error) {
      console.error('Erro ao deletar empréstimo:', error);
    }
  };

  const settleLoan = async (id: string) => {
    const loan = loans.find(l => l.id === id);
    if (loan) {
      await updateLoan(id, { 
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