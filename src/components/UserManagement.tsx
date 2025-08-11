"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Shield, ShieldOff, Trash2, Eye, EyeOff } from 'lucide-react';

const userSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().min(14, 'CPF deve estar completo'),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserManagement() {
  const [showAddUser, setShowAddUser] = useState(false);
  const [showPassword, setShowPassword] = useState<string | null>(null);
  const { users, addUser, toggleUserBlock, deleteUser } = useAuth();

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const generatePassword = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const onSubmit = (data: UserFormData) => {
    // Verificar se CPF já existe
    const existingUser = users.find(user => user.cpf === data.cpf);
    if (existingUser) {
      toast.error('CPF já cadastrado no sistema');
      return;
    }

    const password = generatePassword();
    
    addUser({
      fullName: data.fullName,
      cpf: data.cpf,
      password,
      isBlocked: false,
      monthlyPaymentStatus: 'pending',
    });

    toast.success(`Usuário cadastrado! Senha gerada: ${password}`, {
      duration: 10000,
    });

    reset();
    setShowAddUser(false);
  };

  const handleToggleBlock = (userId: string, userName: string, isBlocked: boolean) => {
    toggleUserBlock(userId);
    toast.success(`Usuário ${userName} ${isBlocked ? 'desbloqueado' : 'bloqueado'} com sucesso`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Tem certeza que deseja excluir o usuário ${userName}?`)) {
      deleteUser(userId);
      toast.success('Usuário excluído com sucesso');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
          <p className="text-gray-600">Cadastre e gerencie usuários do sistema</p>
        </div>
        
        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar um novo usuário. Uma senha será gerada automaticamente.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="Digite o nome completo"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={watch('cpf') || ''}
                  onChange={(e) => setValue('cpf', formatCPF(e.target.value))}
                  maxLength={14}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-600 mt-1">{errors.cpf.message}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Cadastrar
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddUser(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados ({users.length})</CardTitle>
          <CardDescription>
            Lista de todos os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum usuário cadastrado ainda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Senha</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.cpf}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {showPassword === user.id ? (
                          <span className="font-mono">{user.password}</span>
                        ) : (
                          <span className="font-mono">••••</span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPassword(showPassword === user.id ? null : user.id)}
                        >
                          {showPassword === user.id ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isBlocked ? 'destructive' : 'default'}>
                        {user.isBlocked ? 'Bloqueado' : 'Ativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          user.monthlyPaymentStatus === 'paid' ? 'default' :
                          user.monthlyPaymentStatus === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {user.monthlyPaymentStatus === 'paid' ? 'Pago' :
                         user.monthlyPaymentStatus === 'pending' ? 'Pendente' : 'Atrasado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={user.isBlocked ? 'default' : 'destructive'}
                          onClick={() => handleToggleBlock(user.id, user.fullName, user.isBlocked)}
                        >
                          {user.isBlocked ? (
                            <Shield className="h-4 w-4" />
                          ) : (
                            <ShieldOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id, user.fullName)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}