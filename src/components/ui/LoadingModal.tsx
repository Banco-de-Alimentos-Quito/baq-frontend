'use client';

import React from 'react';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
  progress?: number;
}

export default function LoadingModal({ 
  isOpen, 
  message = "Cargando página de donación...",
  progress = 0 
}: LoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-[fadeIn_0.3s_ease-out]">
        <div className="flex flex-col items-center text-center">
          {/* Logo/Icono */}
          <div className="w-16 h-16 mb-6 relative">
            <div className="w-full h-full rounded-full border-4 border-[#ff7300]/20 border-t-[#ff7300] animate-spin"></div>
            <div className="absolute inset-2 w-12 h-12 rounded-full border-2 border-[#2F3388]/20 border-b-[#2F3388] animate-spin animation-delay-150"></div>
          </div>

          {/* Mensaje */}
          <h3 className="text-xl font-bold text-[#2F3388] mb-4">
            {message}
          </h3>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#ff7300] to-[#ffb347] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Texto adicional */}
          <p className="text-sm text-gray-600">
            Preparando tu experiencia de donación...
          </p>

          {/* Animación de puntos */}
          <div className="flex space-x-1 mt-4">
            <div className="w-2 h-2 bg-[#ff7300] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#ff7300] rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-2 h-2 bg-[#ff7300] rounded-full animate-bounce animation-delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}