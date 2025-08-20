'use client';

import { useState, useEffect } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Consideramos móvil si el ancho es menor a 768px (tablet)
      setIsMobile(window.innerWidth < 768);
    };

    // Verificar al cargar
    checkIsMobile();

    // Verificar al cambiar el tamaño de la ventana
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
}
