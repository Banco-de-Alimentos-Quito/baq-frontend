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
      <Link
        href="/quick-donate"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#ff7300] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center font-bold animate-pulse w-24 h-24 sm:w-24 sm:h-24"
        onClick={() => {
          if (typeof window !== "undefined" && window.gtag) {
            window.gtag("event", "presiono_dono_landing", {
              ubicacion: "floating_button",
              tipo_boton: "donar_floating",
            });
          }
        }}
      >
        <div className="w-20 h-20 relative flex items-center justify-center">
          <Image
            src="/buttons/AYUDAR ALIMENTA.png"
            alt="Ayudar Alimenta"
            fill
            className="object-contain"
          />
        </div>
      </Link>

      <style jsx>{`
        @keyframes pulseGlow {
          0%,
          100% {
            box-shadow: 0 4px 20px rgba(255, 115, 0, 0.4);
          }
          50% {
            box-shadow: 0 6px 30px rgba(255, 115, 0, 0.8);
          }
        }

        .animate-pulse {
          animation: pulseGlow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
