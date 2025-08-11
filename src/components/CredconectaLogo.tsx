"use client";

import React from 'react';

interface CredconectaLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function CredconectaLogo({ width = 300, height = 120, className = "" }: CredconectaLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 300 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-full h-auto"
      >
        {/* Círculo azul de fundo */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="#2563eb"
          stroke="#1d4ed8"
          strokeWidth="2"
        />
        
        {/* Símbolo do dólar vermelho */}
        <text
          x="60"
          y="75"
          textAnchor="middle"
          fontSize="48"
          fontWeight="bold"
          fill="#dc2626"
          fontFamily="Arial, sans-serif"
        >
          $
        </text>
        
        {/* Texto "Cred" em preto */}
        <text
          x="130"
          y="50"
          fontSize="32"
          fontWeight="bold"
          fill="#1f2937"
          fontFamily="Arial, sans-serif"
        >
          Cred
        </text>
        
        {/* Texto "Conecta" em vermelho */}
        <text
          x="130"
          y="85"
          fontSize="32"
          fontWeight="bold"
          fill="#dc2626"
          fontFamily="Arial, sans-serif"
        >
          Conecta
        </text>
      </svg>
    </div>
  );
}