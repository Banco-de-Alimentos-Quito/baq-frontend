"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Image from "next/image";
import { X } from "lucide-react";

const COOKIE_NAME = "impact_popup_seen";
const COOKIE_EXPIRY_DAYS = 14;

export default function ImpactPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verificar si la cookie existe
    const hasSeenPopup = Cookies.get(COOKIE_NAME);
    
    if (!hasSeenPopup) {
      // Mostrar popup después de un pequeño delay para mejor UX
      setTimeout(() => {
        setIsOpen(true);
      }, 1000);
    }
  }, []);

  const handleClose = () => {
    // Guardar cookie por 7 días
    Cookies.set(COOKIE_NAME, "true", { expires: COOKIE_EXPIRY_DAYS });
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div 
        className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal centrado */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-300">
          
          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
            aria-label="Cerrar popup"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>

          {/* Imagen */}
          <div className="relative w-full">
            <Image
              src="/Septiembre impacto.jpg"
              alt="Impacto Septiembre - Banco de Alimentos Quito"
              width={800}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </>
  );
}
