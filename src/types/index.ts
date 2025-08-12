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

export interface AppNotification {
  id: string;
  type: 'payment_reminder' | 'overdue_alert' | 'new_loan' | 'settlement_confirmation' | 'contract_signed' | 'system_alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  userId?: string; // Para notificações específicas de usuário
  loanId?: string; // Relacionado a um empréstimo específico
  contractId?: string; // Relacionado a um contrato específico
  scheduledFor?: Date; // Para notificações agendadas
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string; // URL para ação relacionada
  metadata?: Record<string, any>; // Dados extras
}

export interface NotificationSettings {
  userId: string;
  paymentReminders: boolean;
  overdueAlerts: boolean;
  newLoanNotifications: boolean;
  settlementConfirmations: boolean;
  contractNotifications: boolean;
  systemAlerts: boolean;
  reminderDaysBefore: number; // Dias antes do vencimento para lembrete
  quietHoursStart: string; // Hora de início do período silencioso (ex: "22:00")
  quietHoursEnd: string; // Hora de fim do período silencioso (ex: "08:00")
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}