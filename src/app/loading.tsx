import React from 'react';
import { CredconectaLogo } from '@/components/CredconectaLogo';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <CredconectaLogo width={200} height={80} />
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando...</p>
        </div>
      </div>
    </div>
  );
}