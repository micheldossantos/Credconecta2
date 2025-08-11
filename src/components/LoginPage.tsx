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
      toast.error('Senha administrativa incorreta');
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
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CredconectaLogo width={240} height={80} />
          </div>
          <p className="text-gray-600 text-sm">Sistema de Gestão de Empréstimos</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Acesso ao Sistema</CardTitle>
            <CardDescription className="text-sm">
              Escolha o tipo de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => setShowAdminLogin(true)}
              disabled={loading}
              className="w-full h-12 text-base"
              variant="default"
            >
              <Shield className="mr-2 h-5 w-5" />
              Administrador
            </Button>
            
            <Button 
              onClick={() => setShowUserLogin(true)}
              disabled={loading}
              className="w-full h-12 text-base"
              variant="outline"
            >
              <User className="mr-2 h-5 w-5" />
              Usuário
            </Button>
          </CardContent>
        </Card>

        {/* Dialog de Login Administrativo */}
        <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
          <DialogContent className="w-[90vw] max-w-sm">
            <DialogHeader>
              <DialogTitle>Login Administrativo</DialogTitle>
              <DialogDescription>
                Digite a senha administrativa
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Label htmlFor="adminPassword">Senha Administrativa</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Digite a senha"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoComplete="off"
                  className="h-12 text-base"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1 h-12">
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPassword('');
                  }}
                  className="flex-1 h-12"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Login de Usuário */}
        <Dialog open={showUserLogin} onOpenChange={setShowUserLogin}>
          <DialogContent className="w-[90vw] max-w-sm">
            <DialogHeader>
              <DialogTitle>Login de Usuário</DialogTitle>
              <DialogDescription>
                Digite suas credenciais
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
                  className="h-12 text-base"
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
                  className="h-12 text-base"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1 h-12">
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
                  className="flex-1 h-12"
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