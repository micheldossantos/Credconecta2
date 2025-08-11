export interface User {
  id: string;
  fullName: string;
  cpf: string;
  password: string;
  isBlocked: boolean;
  monthlyPaymentStatus: 'paid' | 'pending' | 'overdue';
  createdAt: Date;
  lastPayment?: Date;
}

export interface Loan {
  id: string;
  fullName: string;
  cpf: string;
  phone: string;
  loanDate: Date;
  loanAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  remainingInstallments: number;
  dailyPenalty: number;
  photo?: string;
  isSettled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  type: 'admin' | 'user';
  id?: string;
  fullName?: string;
}

export interface LoanReport {
  totalLoans: number;
  totalAmount: number;
  settledLoans: number;
  pendingLoans: number;
  overdueLoans: number;
  totalPenalties: number;
}