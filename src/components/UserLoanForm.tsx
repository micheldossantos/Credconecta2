"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLoans } from '@/contexts/LoanContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Camera, Upload, X, Save } from 'lucide-react';

const loanSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().min(14, 'CPF deve estar completo'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  loanDate: z.string().min(1, 'Data do empréstimo é obrigatória'),
  loanAmount: z.number().min(1, 'Valor deve ser maior que zero'),
  totalInstallments: z.number().min(1, 'Número de parcelas deve ser maior que zero'),
  paidInstallments: z.number().min(0, 'Parcelas pagas não pode ser negativo'),
  dailyPenalty: z.number().min(0, 'Sanção diária deve ser maior ou igual a zero'),
});

type LoanFormData = z.infer<typeof loanSchema>;

export function UserLoanForm() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();
  const { addLoan } = useLoans();

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      dailyPenalty: 30, // Valor padrão de R$ 30 por dia
      paidInstallments: 0,
    }
  });

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      toast.error('Erro ao acessar a câmera');
      console.error('Camera error:', error);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg');
        setSelectedPhoto(photoData);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const onSubmit = (data: LoanFormData) => {
    if (!currentUser?.id) {
      toast.error('Erro: usuário não identificado');
      return;
    }

    const loanData = {
      ...data,
      loanDate: new Date(data.loanDate),
      photo: selectedPhoto || undefined,
      isSettled: false,
    };

    // Passar o ID do usuário atual para associar o empréstimo
    addLoan(loanData, currentUser.id);
    toast.success('Empréstimo cadastrado com sucesso!');
    
    // Reset form
    reset();
    setSelectedPhoto(null);
  };

  // Calcular parcelas restantes automaticamente
  const totalInstallments = watch('totalInstallments') || 0;
  const paidInstallments = watch('paidInstallments') || 0;
  const remainingInstallments = totalInstallments - paidInstallments;

  return (
    <div className="space-y-4 pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cadastrar Novo Empréstimo</CardTitle>
          <CardDescription>
            Preencha todos os dados do empréstimo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Dados Pessoais */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-gray-700">Dados do Cliente</h3>
              
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="Nome do cliente"
                  className="h-12"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={watch('cpf') || ''}
                    onChange={(e) => setValue('cpf', formatCPF(e.target.value))}
                    maxLength={14}
                    className="h-12"
                  />
                  {errors.cpf && (
                    <p className="text-sm text-red-600 mt-1">{errors.cpf.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={watch('phone') || ''}
                    onChange={(e) => setValue('phone', formatPhone(e.target.value))}
                    maxLength={15}
                    className="h-12"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Dados do Empréstimo */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-gray-700">Dados do Empréstimo</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="loanDate">Data  do Empréstimo</Label>
                  <Input
                    id="loanDate"
                    type="date"
                    {...register('loanDate')}
                    className="h-12"
                  />
                  {errors.loanDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.loanDate.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="loanAmount">Valor (R$)</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('loanAmount', { valueAsNumber: true })}
                    className="h-12"
                  />
                  {errors.loanAmount && (
                    <p className="text-sm text-red-600 mt-1">{errors.loanAmount.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="totalInstallments">Total Parcelas</Label>
                  <Input
                    id="totalInstallments"
                    type="number"
                    placeholder="12"
                    {...register('totalInstallments', { valueAsNumber: true })}
                    className="h-12"
                  />
                  {errors.totalInstallments && (
                    <p className="text-sm text-red-600 mt-1">{errors.totalInstallments.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="paidInstallments">Pagas</Label>
                  <Input
                    id="paidInstallments"
                    type="number"
                    placeholder="0"
                    {...register('paidInstallments', { valueAsNumber: true })}
                    className="h-12"
                  />
                  {errors.paidInstallments && (
                    <p className="text-sm text-red-600 mt-1">{errors.paidInstallments.message}</p>
                  )}
                </div>
                
                <div>
                  <Label>Restantes</Label>
                  <div className="h-12 px-3 py-2 bg-gray-100 rounded-md flex items-center">
                    <span className="text-sm font-medium">{remainingInstallments}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="dailyPenalty">Sanção por Dia (R$)</Label>
                <Input
                  id="dailyPenalty"
                  type="number"
                  step="0.01"
                  placeholder="30.00"
                  {...register('dailyPenalty', { valueAsNumber: true })}
                  className="h-12"
                />
                {errors.dailyPenalty && (
                  <p className="text-sm text-red-600 mt-1">{errors.dailyPenalty.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Valor cobrado por dia de atraso após a data do empréstimo
                </p>
              </div>
            </div>

            {/* Foto do Cliente */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-gray-700">Foto do Cliente</h3>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 h-12"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={startCamera}
                  className="flex-1 h-12"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Câmera
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Preview da Foto */}
              {selectedPhoto && (
                <div className="relative">
                  <img 
                    src={selectedPhoto} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Camera Modal */}
              {showCamera && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg p-4 w-full max-w-sm">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg mb-4"
                    />
                    <div className="flex gap-2">
                      <Button onClick={capturePhoto} className="flex-1">
                        <Camera className="h-4 w-4 mr-2" />
                        Capturar
                      </Button>
                      <Button onClick={stopCamera} variant="outline" className="flex-1">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Botão de Salvar */}
            <Button type="submit" className="w-full h-12 text-base">
              <Save className="h-4 w-4 mr-2" />
              Cadastrar Empréstimo
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}