"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification, NotificationSettings } from '@/types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AppNotification[];
  settings: NotificationSettings | null;
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  schedulePaymentReminders: () => void;
  checkOverdueLoans: () => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const { currentUser } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Carregar notificações e configurações do localStorage
  useEffect(() => {
    if (!mounted || !currentUser) return;

    const loadData = () => {
      try {
        // Carregar notificações
        const savedNotifications = localStorage.getItem(`credconecta-notifications-${currentUser.id || 'admin'}`);
        if (savedNotifications) {
          const parsedNotifications = JSON.parse(savedNotifications).map((notification: any) => ({
            ...notification,
            createdAt: new Date(notification.createdAt),
            scheduledFor: notification.scheduledFor ? new Date(notification.scheduledFor) : undefined,
            readAt: notification.readAt ? new Date(notification.readAt) : undefined,
          }));
          setNotifications(parsedNotifications);
        }

        // Carregar configurações
        const savedSettings = localStorage.getItem(`credconecta-notification-settings-${currentUser.id || 'admin'}`);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          parsedSettings.createdAt = new Date(parsedSettings.createdAt);
          parsedSettings.updatedAt = new Date(parsedSettings.updatedAt);
          setSettings(parsedSettings);
        } else {
          // Criar configurações padrão
          const defaultSettings: NotificationSettings = {
            userId: currentUser.id || 'admin',
            paymentReminders: true,
            overdueAlerts: true,
            newLoanNotifications: true,
            settlementConfirmations: true,
            contractNotifications: true,
            systemAlerts: true,
            reminderDaysBefore: 3,
            quietHoursStart: '22:00',
            quietHoursEnd: '08:00',
            soundEnabled: true,
            vibrationEnabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mounted, currentUser]);

  // Salvar notificações no localStorage
  useEffect(() => {
    if (mounted && currentUser && notifications.length > 0) {
      try {
        localStorage.setItem(`credconecta-notifications-${currentUser.id || 'admin'}`, JSON.stringify(notifications));
      } catch (error) {
        console.error('Erro ao salvar notificações:', error);
      }
    }
  }, [notifications, mounted, currentUser]);

  // Salvar configurações no localStorage
  useEffect(() => {
    if (mounted && currentUser && settings) {
      try {
        localStorage.setItem(`credconecta-notification-settings-${currentUser.id || 'admin'}`, JSON.stringify(settings));
      } catch (error) {
        console.error('Erro ao salvar configurações:', error);
      }
    }
  }, [settings, mounted, currentUser]);

  // Listeners para eventos automáticos
  useEffect(() => {
    if (!mounted || !settings) return;

    const handleLoanAdded = (event: CustomEvent) => {
      if (settings.newLoanNotifications) {
        const { loan } = event.detail;
        addNotification({
          type: 'new_loan',
          title: '🆕 Novo Empréstimo Cadastrado',
          message: `Empréstimo de R$ ${loan.loanAmount.toLocaleString('pt-BR')} para ${loan.fullName}`,
          priority: 'medium',
          userId: currentUser?.id,
          loanId: loan.id,
          actionUrl: '/loans',
          metadata: {
            clientName: loan.fullName,
            amount: loan.loanAmount,
          },
        });
      }
    };

    const handleLoanSettled = (event: CustomEvent) => {
      if (settings.settlementConfirmations) {
        const { loan } = event.detail;
        addNotification({
          type: 'settlement_confirmation',
          title: '✅ Empréstimo Quitado',
          message: `Empréstimo de ${loan.fullName} foi quitado com sucesso!`,
          priority: 'low',
          userId: currentUser?.id,
          loanId: loan.id,
          actionUrl: '/loans',
          metadata: {
            clientName: loan.fullName,
            amount: loan.loanAmount,
          },
        });
      }
    };

    const handleContractSigned = (event: CustomEvent) => {
      if (settings.contractNotifications) {
        const { contract } = event.detail;
        addNotification({
          type: 'contract_signed',
          title: '📄 Contrato Assinado',
          message: `Contrato de ${contract.clientName} foi assinado digitalmente`,
          priority: 'medium',
          userId: currentUser?.id,
          contractId: contract.id,
          actionUrl: '/contracts',
          metadata: {
            clientName: contract.clientName,
            amount: contract.loanAmount,
          },
        });
      }
    };

    // Adicionar listeners
    window.addEventListener('loanAdded', handleLoanAdded as EventListener);
    window.addEventListener('loanSettled', handleLoanSettled as EventListener);
    window.addEventListener('contractSigned', handleContractSigned as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('loanAdded', handleLoanAdded as EventListener);
      window.removeEventListener('loanSettled', handleLoanSettled as EventListener);
      window.removeEventListener('contractSigned', handleContractSigned as EventListener);
    };
  }, [mounted, settings, currentUser]);

  const addNotification = (notificationData: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: AppNotification = {
      ...notificationData,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Simular notificação push (em produção, usar service worker)
    if (settings?.soundEnabled && 'Notification' in window) {
      // Solicitar permissão se necessário
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Mostrar notificação se permitido
      if (Notification.permission === 'granted') {
        const notification = new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: newNotification.id,
        });

        // Auto-fechar após 5 segundos
        setTimeout(() => notification.close(), 5000);
      }
    }

    // Vibração (se suportado e habilitado)
    if (settings?.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true, readAt: new Date() }
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      isRead: true,
      readAt: notification.readAt || new Date(),
    })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      ...newSettings,
      updatedAt: new Date(),
    };
    setSettings(updatedSettings);
  };

  const schedulePaymentReminders = () => {
    // Implementação de lembretes será adicionada conforme necessário
  };

  const checkOverdueLoans = () => {
    // Implementação de verificação será adicionada conforme necessário
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!mounted) {
    return (
      <NotificationContext.Provider value={{
        notifications: [],
        settings: null,
        unreadCount: 0,
        addNotification: () => {},
        markAsRead: () => {},
        markAllAsRead: () => {},
        deleteNotification: () => {},
        updateSettings: () => {},
        schedulePaymentReminders: () => {},
        checkOverdueLoans: () => {},
        loading: true,
      }}>
        {children}
      </NotificationContext.Provider>
    );
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      settings,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      updateSettings,
      schedulePaymentReminders,
      checkOverdueLoans,
      loading,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}