"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

// Type for Google Analytics gtag function
declare global {
  interface Window {
    gtag: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

export default function FloatingDonationButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-20 h-20 sm:w-20 sm:h-20 rounded-full bg-gray-200" />
    );
  }

  return (
    <>
      {/* Botón Flotante 1: Huevos Zen (Arriba) */}
      <Link
        href="/huevos-zen"
        aria-label="Huevos Zen"
        className="fixed bottom-28 right-4 sm:bottom-32 sm:right-6 z-50 bg-gradient-to-br from-amber-400 to-[#ED6F1D] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center font-bold animate-pulse-zen w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border-2 border-white/80 group"
        onClick={() => {
          if (typeof window !== "undefined" && window.gtag) {
            window.gtag("event", "presiono_huevo_zen_floating", {
              ubicacion: "floating_button",
              tipo_boton: "huevo_zen_floating",
            });
          }
        }}
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center">
          <Image
            src="/huevos-zen-logo.png"
            alt="Huevos Zen"
            fill
            className="object-contain p-1 group-hover:scale-110 transition-transform"
          />
        </div>
      </Link>

      {/* Botón Flotante 2: Quick Donate (Abajo) */}
      <Link
        href="/quick-donate"
        aria-label="Ayudar Alimenta"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#ff7300] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center font-bold animate-pulse-donate w-20 h-20 sm:w-24 sm:h-24"
        onClick={() => {
          if (typeof window !== "undefined" && window.gtag) {
            window.gtag("event", "presiono_dono_landing", {
              ubicacion: "floating_button",
              tipo_boton: "donar_floating",
            });
          }
        }}
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center">
          <Image
            src="/buttons/AYUDAR ALIMENTA.png"
            alt="Ayudar Alimenta"
            fill
            className="object-contain"
          />
        </div>
      </Link>

      <style jsx>{`
        @keyframes pulseGlowDonate {
          0%,
          100% {
            box-shadow: 0 4px 20px rgba(255, 115, 0, 0.4);
          }
          50% {
            box-shadow: 0 6px 30px rgba(255, 115, 0, 0.8);
          }
        }

        @keyframes pulseGlowZen {
          0%,
          100% {
            box-shadow: 0 4px 20px rgba(237, 111, 29, 0.4);
          }
          50% {
            box-shadow: 0 6px 30px rgba(251, 191, 36, 0.8);
          }
        }

        .animate-pulse-donate {
          animation: pulseGlowDonate 2s ease-in-out infinite;
        }

        .animate-pulse-zen {
          animation: pulseGlowZen 2.2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
