"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const COOKIE_NAME = "ruta-hambre-popup-closed";

export default function CampaignPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the cookie exists
    const cookies = document.cookie.split(";");
    const hasClosedPopup = cookies.some((cookie) =>
      cookie.trim().startsWith(`${COOKIE_NAME}=`)
    );

    if (!hasClosedPopup) {
      // Delay showing the popup slightly for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Set cookie to expire in 3 hours
    const date = new Date();
    date.setTime(date.getTime() + 3 * 60 * 60 * 1000); // 3 hours
    document.cookie = `${COOKIE_NAME}=true;expires=${date.toUTCString()};path=/`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300">
      <div className="relative max-w-fit mx-auto shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300 bg-transparent flex flex-col items-center">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 md:top-3 md:right-3 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 md:p-2 transition-colors duration-200"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <Link
          href="/ruta-contra-el-hambre/nuvei"
          onClick={handleClose}
          className="block w-full h-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/popup/ruta-contra-el-hambre.png"
            alt="Ruta contra el hambre 2026"
            className="w-auto h-auto max-w-[90vw] max-h-[85vh] object-contain rounded-2xl"
          />
        </Link>
      </div>
    </div>
  );
}
