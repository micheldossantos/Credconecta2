"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Shield, User } from 'lucide-react';
import { CredconectaLogo } from './CredconectaLogo';

export function LoginPage() {
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [cpf, setCpf] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação simples e direta
    if (adminPassword === '8470') {
      setLoading(true);
      try {
        const success = await login('admin', { password: '8470' });
        if (success) {
          toast.success('Login administrativo realizado com sucesso!');
          setShowAdminLogin(false);
          setAdminPassword('');
        } else {
          toast.error('Erro no sistema de autenticação');
        }
      } catch (error) {
        toast.error('Erro ao fazer login');
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('Senha administrativa incorreta. Use: 8470');
    }
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpf || !userPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const success = await login('user', { cpf, password: userPassword });
      if (success) {
        toast.success('Login realizado com sucesso!');
        setShowUserLogin(false);
        setCpf('');
        setUserPassword('');
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
          <div className="flex justify-center mb-6">
            <CredconectaLogo width={300} height={120} />
          </div>
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
              onClick={() => setShowAdminLogin(true)}
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

        {/* Dialog de Login Administrativo */}
        <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login Administrativo</DialogTitle>
              <DialogDescription>
                Digite a senha administrativa: 8470
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Label htmlFor="adminPassword">Senha Administrativa</Label>
                <Input
                  id="adminPassword"
                  type="text"
                  placeholder="8470"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoComplete="off"
                  required
                />
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  Senha: 8470
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Login de Usuário */}
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
                <Label htmlFor="userPassword">Senha (4 dígitos)</Label>
                <Input
                  id="userPassword"
                  type="password"
                  placeholder="0000"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
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
                  onClick={() => {
                    setShowUserLogin(false);
                    setCpf('');
                    setUserPassword('');
                  }}
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