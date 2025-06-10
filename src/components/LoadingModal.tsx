// src/components/LoadingModal.tsx
import React from "react";

interface LoadingModalProps {
  show: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ show }) => {
  return (
    <div className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-sm transition-opacity duration-300 ${
      show ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`}>
      <div className={`bg-gradient-to-br from-[#ff6347ee] to-[#ff826bee] rounded-2xl p-16 shadow-2xl flex flex-col items-center max-w-md mx-4 transform transition-transform duration-300 ${
        show ? 'scale-100' : 'scale-95'
      }`}>
        
        {/* Logo con spinner circular optimizado */}
        <div className="relative mb-10 w-40 h-40 flex items-center justify-center">
          {/* Barra de carga circular simplificada */}
          <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
          
          {/* Logo en el centro */}
          <img
            src="/icono-logo-blanco.webp"
            alt="Cargando..."
            className="w-24 h-24 relative z-10"
          />
        </div>

        <p className="text-3xl font-extrabold text-white drop-shadow-lg tracking-wide text-center mb-4">
          ¡Tu ayuda puede cambiar vidas!
        </p>
        <p className="text-lg font-semibold text-white/90 drop-shadow text-center">
          Cada donación alimenta esperanza...
        </p>
      </div>
    </div>
  );
};

export default LoadingModal;