'use client';

import React, { useState, useEffect } from 'react';
import LoadingModal from './LoadingModal';
import { useRouteLoading } from '@/hooks/useRouteLoading';

interface LoadingWrapperProps {
  children: React.ReactNode;
}

export default function LoadingWrapper({ children }: LoadingWrapperProps) {
  const { isLoading, targetRoute } = useRouteLoading();
  const [progress, setProgress] = useState(0);

  // Simular progreso de carga
  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90; // Se detiene en 90% hasta que la ruta cambie realmente
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 300);
    }
  }, [isLoading]);

  const getLoadingMessage = () => {
    switch (targetRoute) {
      case '/donacion':
        return 'Cargando página de donación...';
      case '/donacion/mensual':
        return 'Preparando donación mensual...';
      case '/donacion/qr':
        return 'Generando código QR...';
      case '/thank-you':
        return 'Procesando tu donación...';
      default:
        return 'Cargando...';
    }
  };

  return (
    <>
      {children}
      <LoadingModal 
        isOpen={isLoading}
        message={getLoadingMessage()}
        progress={progress}
      />
    </>
  );
}