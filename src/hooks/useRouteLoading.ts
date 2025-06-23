'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useRouteLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [targetRoute, setTargetRoute] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const navigateWithLoading = (route: string, estimatedDuration = 2000) => {
    setIsLoading(true);
    setTargetRoute(route);
    
    // Simular tiempo de carga estimado
    setTimeout(() => {
      router.push(route);
    }, estimatedDuration);
  };

  // Detectar cuando la ruta ha cambiado
  useEffect(() => {
    if (targetRoute && pathname === targetRoute) {
      setIsLoading(false);
      setTargetRoute(null);
    }
  }, [pathname, targetRoute]);

  return {
    isLoading,
    navigateWithLoading,
    targetRoute
  };
}