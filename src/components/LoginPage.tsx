"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CreditCard, Shield, User } from 'lucide-react';

export function LoginPage() {
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      const success = await login('admin');
      if (success) {
        toast.success('Login realizado com sucesso!');
      } else {
        toast.error('Erro ao fazer login');
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpf || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const success = await login('user', { cpf, password });
      if (success) {
        toast.success('Login realizado com sucesso!');
        setShowUserLogin(false);
      } else {
        toast.error('CPF ou senha incorretos, ou usuário bloqueado');
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CreditCard className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Credconecta</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestão de Empréstimos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>
              Escolha o tipo de acesso para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleAdminLogin}
              disabled={loading}
              className="w-full h-12 text-lg"
              variant="default"
            >
              <Shield className="mr-2 h-5 w-5" />
              Entrar como Administrador
            </Button>
            
            <Button 
              onClick={() => setShowUserLogin(true)}
              disabled={loading}
              className="w-full h-12 text-lg"
              variant="outline"
            >
              <User className="mr-2 h-5 w-5" />
              Entrar como Usuário
            </Button>
          </CardContent>
        </Card>

        <Dialog open={showUserLogin} onOpenChange={setShowUserLogin}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login de Usuário</DialogTitle>
              <DialogDescription>
                Digite suas credenciais para acessar o sistema
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleUserLogin} className="space-y-4">
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  maxLength={14}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha (4 dígitos)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="0000"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowUserLogin(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}