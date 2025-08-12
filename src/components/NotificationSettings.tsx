"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';
import { Settings, Bell, Volume2, Vibrate, Clock } from 'lucide-react';

export function NotificationSettings() {
  const { settings, updateSettings } = useNotifications();

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Carregando configurações...</p>
        </CardContent>
      </Card>
    );
  }

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
    toast.success('Configuração atualizada!');
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Permissão para notificações concedida!');
      } else {
        toast.error('Permissão para notificações negada');
      }
    } else {
      toast.error('Notificações não suportadas neste navegador');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações de Notificações</h2>
        <p className="text-gray-600">Personalize como e quando receber notificações</p>
      </div>

      {/* Permissões do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Permissões do Sistema
          </CardTitle>
          <CardDescription>
            Configure as permissões do navegador para notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificações do Navegador</p>
              <p className="text-sm text-gray-600">
                Status: {
                  'Notification' in window 
                    ? Notification.permission === 'granted' 
                      ? '✅ Permitidas' 
                      : Notification.permission === 'denied'
                      ? '❌ Negadas'
                      : '⏳ Não solicitadas'
                    : '❌ Não suportadas'
                }
              </p>
            </div>
            {Notification.permission !== 'granted' && (
              <Button onClick={requestNotificationPermission}>
                Solicitar Permissão
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificação</CardTitle>
          <CardDescription>
            Escolha quais notificações você deseja receber
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">💰 Lembretes de Pagamento</p>
              <p className="text-sm text-gray-600">Notificações antes do vencimento das parcelas</p>
            </div>
            <Switch
              checked={settings.paymentReminders}
              onCheckedChange={(checked) => handleSettingChange('paymentReminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">⚠️ Alertas de Atraso</p>
              <p className="text-sm text-gray-600">Notificações para empréstimos em atraso</p>
            </div>
            <Switch
              checked={settings.overdueAlerts}
              onCheckedChange={(checked) => handleSettingChange('overdueAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">🆕 Nov os Empréstimos</p>
              <p className="text-sm text-gray-600">Notificações quando novos empréstimos são cadastrados</p>
            </div>
            <Switch
              checked={settings.newLoanNotifications}
              onCheckedChange={(checked) => handleSettingChange('newLoanNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">✅ Confirmações de Quitação</p>
              <p className="text-sm text-gray-600">Notificações quando empréstimos são quitados</p>
            </div>
            <Switch
              checked={settings.settlementConfirmations}
              onCheckedChange={(checked) => handleSettingChange('settlementConfirmations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">📄 Contratos Digitais</p>
              <p className="text-sm text-gray-600">Notificações sobre contratos e assinaturas</p>
            </div>
            <Switch
              checked={settings.contractNotifications}
              onCheckedChange={(checked) => handleSettingChange('contractNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">🔔 Alertas do Sistema</p>
              <p className="text-sm text-gray-600">Notificações importantes do sistema</p>
            </div>
            <Switch
              checked={settings.systemAlerts}
              onCheckedChange={(checked) => handleSettingChange('systemAlerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configurações de Tempo
          </CardTitle>
          <CardDescription>
            Configure quando e com que frequência receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="reminderDays">Dias de Antecedência para Lembretes</Label>
            <Select
              value={settings.reminderDaysBefore.toString()}
              onValueChange={(value) => handleSettingChange('reminderDaysBefore', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 dia antes</SelectItem>
                <SelectItem value="2">2 dias antes</SelectItem>
                <SelectItem value="3">3 dias antes</SelectItem>
                <SelectItem value="5">5 dias antes</SelectItem>
                <SelectItem value="7">1 semana antes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quietStart">Início do Período Silencioso</Label>
              <Input
                id="quietStart"
                type="time"
                value={settings.quietHoursStart}
                onChange={(e) => handleSettingChange('quietHoursStart', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="quietEnd">Fim do Período Silencioso</Label>
              <Input
                id="quietEnd"
                type="time"
                value={settings.quietHoursEnd}
                onChange={(e) => handleSettingChange('quietHoursEnd', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Som e Vibração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Som e Vibração
          </CardTitle>
          <CardDescription>
            Configure como as notificações chamam sua atenção
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <div>
                <p className="font-medium">Som das Notificações</p>
                <p className="text-sm text-gray-600">Reproduzir som ao receber notificações</p>
              </div>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vibrate className="h-4 w-4" />
              <div>
                <p className="font-medium">Vibração</p>
                <p className="text-sm text-gray-600">Vibrar o dispositivo ao receber notificações</p>
              </div>
            </div>
            <Switch
              checked={settings.vibrationEnabled}
              onCheckedChange={(checked) => handleSettingChange('vibrationEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Teste de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Teste de Notificação</CardTitle>
          <CardDescription>
            Envie uma notificação de teste para verificar as configurações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => {
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('🧪 Teste CredConecta', {
                  body: 'Esta é uma notificação de teste. Suas configurações estão funcionando!',
                  icon: '/favicon.ico',
                });
                toast.success('Notificação de teste enviada!');
              } else {
                toast.error('Permissão de notificação necessária');
              }
            }}
            className="w-full"
          >
            Enviar Notificação de Teste
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}