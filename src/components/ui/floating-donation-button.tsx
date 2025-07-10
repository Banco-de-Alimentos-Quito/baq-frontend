"use client";

import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";

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
        href="/donacion"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-[#ff7300] to-[#ffb347] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center font-bold animate-pulse w-24 h-24 sm:w-24 sm:h-24"
      >
        <div className="w-20 h-16 flex items-center justify-center">
          <DotLottieReact
            src="/gesture_animation.lottie"
            loop
            autoplay
            // translateZ(0) para forzar la aceleración por GPU y mejorar la nitidez
            style={{
              transform: 'scale(1.6) translateZ(0)',
              backfaceVisibility: 'hidden',
              imageRendering: '-webkit-optimize-contrast' // Ayuda en navegadores WebKit
            }}
          />
        </div>
        <span className="text-xs leading-none mt-1">Donar</span>
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