"use client";

import { useEffect, useRef, useState } from "react";

interface PayphoneButtonProps {
  amount: number;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  reference?: string;
  metadata?: Record<string, any>;
}

// Extender Window para incluir PPaymentButtonBox
declare global {
  interface Window {
    PPaymentButtonBox?: any;
  }
}

export default function PayphoneButton({
  amount,
  onSuccess,
  onError,
  reference = "Donación BAQ",
  metadata = {},
}: PayphoneButtonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const payphoneInstance = useRef<any>(null);
  const containerId = useRef(
    `payphone-button-${Math.random().toString(36).substr(2, 9)}`
  );

  useEffect(() => {
    let jsLoaded = false;

    // Función para cargar JavaScript
    const loadJS = () =>
      new Promise<void>((resolve, reject) => {
        if (window.PPaymentButtonBox) {
          jsLoaded = true;
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src =
          "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js";
        script.type = "module";
        script.onload = () => {
          setTimeout(() => {
            if (window.PPaymentButtonBox) {
              jsLoaded = true;
              resolve();
            } else reject(new Error("PPaymentButtonBox no disponible"));
          }, 600);
        };
        script.onerror = () => reject(new Error("Error cargando Payphone JS"));
        document.head.appendChild(script);
      });

    // Función para cargar CSS
    const loadCSS = () =>
      new Promise<void>((resolve) => {
        const existing = document.querySelector(
          'link[href*="payphone-payment-box.css"]'
        );
        if (existing) return resolve();
        const link = document.createElement("link");
        link.href =
          "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css";
        link.rel = "stylesheet";
        link.onload = () => resolve();
        link.onerror = () => resolve();
        document.head.appendChild(link);
      });

    // Generar un ID único para este componente
    function generateClientTransactionID(): string {
      // Genera un ID único y más robusto usando la API de Crypto
      const randomPart = window.crypto.getRandomValues(new Uint32Array(1))[0];
      return `${Date.now()}-${randomPart}`;
    }

    // Función para inicializar el botón de Payphone
    const initialize = () => {
      if (!window.PPaymentButtonBox || !buttonRef.current) {
        setError("No se pudo inicializar el botón de Payphone");
        setIsLoading(false);
        return;
      }
      try {
        // Limpiar el contenedor antes de renderizar
        buttonRef.current.innerHTML = "";
        const amountInCents = Math.round(amount * 100);

        // Nota: additionalData puede variar según versión; si no aplica, mantén el guardado en backend.
        const options: any = {
          token: process.env.NEXT_PUBLIC_PAYPHONE_TOKEN,
          ClientTransactionId: generateClientTransactionID(),
          amount: amountInCents,
          amountWithoutTax: amountInCents,
          currency: process.env.NEXT_PUBLIC_PAYPHONE_CURRENCY,
          storeId: process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID,
          reference,
        };

        // Crear instancia de PPaymentButtonBox
        payphoneInstance.current = new window.PPaymentButtonBox(options);
        // Configurar callbacks si se proporcionan
        if (onSuccess) payphoneInstance.current.onSuccess = onSuccess;
        if (onError) payphoneInstance.current.onError = onError;
        // Renderizar el botón usando el ID del contenedor (NO el elemento DOM)
        payphoneInstance.current.render(containerId.current);
        setIsLoading(false);

      } catch (e: any) {
        setError(e?.message || "Error al inicializar Payphone");
        setIsLoading(false);
      }
    };

    // Función principal que orquesta la carga e inicialización
    (async () => {
      try {
        await Promise.all([loadCSS(), loadJS()]);
        if (jsLoaded) initialize();
      } catch (e: any) {
        setError(e?.message || "Error cargando recursos de Payphone");
        setIsLoading(false);
      }
    })();

    // Limpieza al desmontar el componente
    return () => {
      if (payphoneInstance.current) payphoneInstance.current = null;
    };
  }, [amount, reference, JSON.stringify(metadata)]);

  return (
    <div className="w-full max-w-md p-6 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-center">Pago con Payphone</h2>
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2">Cargando botón de pago...</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Reintentar
          </button>
        </div>
      )}
      <div id={containerId.current} ref={buttonRef} className="flex justify-center"></div>
    </div>
  );
}
