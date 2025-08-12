"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  Trash2, 
  Settings,
  AlertTriangle,
  DollarSign,
  FileText,
  CreditCard,
  Info
} from 'lucide-react';

export function NotificationCenter() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'urgent' ? 'text-red-600' : 
                     priority === 'high' ? 'text-orange-600' : 
                     priority === 'medium' ? 'text-blue-600' : 'text-gray-600';

    switch (type) {
      case 'payment_reminder':
        return <DollarSign className={`h-4 w-4 ${iconClass}`} />;
      case 'overdue_alert':
        return <AlertTriangle className={`h-4 w-4 ${iconClass}`} />;
      case 'new_loan':
        return <CreditCard className={`h-4 w-4 ${iconClass}`} />;
      case 'settlement_confirmation':
        return <Check className={`h-4 w-4 ${iconClass}`} />;
      case 'contract_signed':
        return <FileText className={`h-4 w-4 ${iconClass}`} />;
      default:
        return <Info className={`h-4 w-4 ${iconClass}`} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">Urgente</Badge>;
      case 'high':
        return <Badge variant="destructive" className="text-xs">Alta</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Média</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Baixa</Badge>;
    }
  };

  const formatTimeAgo = (date: Date) => {
    try {
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'há alguns momentos';
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navegar para a URL de ação se existir
    if (notification.actionUrl) {
      // Em uma implementação real, usar router.push(notification.actionUrl)
      console.log('Navegando para:', notification.actionUrl);
    }
  };

  return (
    <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Notificações</span>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button size="sm" variant="outline" onClick={markAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Marcar todas
                </Button>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            {unreadCount > 0 ? `${unreadCount} não lida(s)` : 'Todas as notificações lidas'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhuma notificação ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm leading-tight">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            {getPriorityBadge(notification.priority)}
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          
                          <div className="flex gap-1">
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}