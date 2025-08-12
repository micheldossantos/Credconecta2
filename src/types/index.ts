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
  createdBy: string; // ID do usuário que criou o empréstimo
  contractId?: string; // ID do contrato associado
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

export interface Contract {
  id: string;
  loanId: string;
  templateId: string;
  clientName: string;
  clientCpf: string;
  clientPhone: string;
  loanAmount: number;
  totalInstallments: number;
  dailyPenalty: number;
  loanDate: Date;
  contractDate: Date;
  clientSignature?: string;
  lenderSignature?: string;
  witnessSignature?: string;
  status: 'draft' | 'signed' | 'completed';
  pdfUrl?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}