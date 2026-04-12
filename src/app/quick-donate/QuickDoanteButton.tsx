"use client";

import { Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function QuickDonateButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed bottom-32 right-2 sm:bottom-36 sm:right-4 z-50 w-28 h-28 sm:w-32 sm:h-32 opacity-0" />
    );
  }

  return (
    <Link
      href="/quick-donate"
      className="fixed bottom-32 right-2 sm:bottom-36 sm:right-4 z-50 flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 transition-all duration-300 hover:scale-110 hover:-translate-y-1 group animate-pulse"
      onClick={() => {
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "presiono_dono_landing", {
            ubicacion: "floating_button",
            tipo_boton: "donar_floating_quick",
          });
        }
      }}
    >
      <Zap
        className="absolute inset-0 w-full h-full text-orange-gradient drop-shadow-lg text-[#ff7300] fill-[#ff7300]"
        strokeWidth={1}
      />

      <span className="relative z-10 text-[10px] sm:text-xs leading-tight text-center font-bold text-white drop-shadow-md">
        Donación
        <br />
        Rápida
      </span>
    </Link>
  );
}
