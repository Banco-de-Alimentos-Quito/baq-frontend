"use client";

import { useEffect, useRef, useState } from "react";

interface PayphoneButtonProps {
  token: string;
  amount: number;
  amountWithoutTax?: number;
  amountWithTax?: number;
  tax?: number;
  currency?: string;
  ClientTransactionId: string;
  reference: string;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

// Extender Window para incluir PPaymentButtonBox
declare global {
  interface Window {
    PPaymentButtonBox?: any;
  }
}

export default function PayphoneButton({
  token,
  amount,
  amountWithoutTax = 0,
  amountWithTax = 0,
  tax = 0,
  currency = "USD",
  ClientTransactionId,
  reference,
  onSuccess,
  onError,
}: PayphoneButtonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const payphoneInstance = useRef<any>(null);
  
  // Generar un ID único para este componente
  const containerId = useRef(`payphone-button-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    let cssLoaded = false;
    let jsLoaded = false;

    // Función para cargar CSS
    const loadCSS = () => {
      return new Promise<void>((resolve) => {
        const existingLink = document.querySelector(
          'link[href*="payphone-payment-box.css"]'
        );
        if (existingLink) {
          cssLoaded = true;
          console.log("CSS de Payphone ya está cargado");
          resolve();
          return;
        }

        const link = document.createElement("link");
        link.href = "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css";
        link.rel = "stylesheet";
        link.onload = () => {
          cssLoaded = true;
          console.log("CSS de Payphone cargado correctamente");
          resolve();
        };
        link.onerror = () => {
          console.error("Error al cargar CSS de Payphone");
          resolve();
        };
        document.head.appendChild(link);
      });
    };

    // Función para cargar JavaScript
    const loadJS = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.PPaymentButtonBox) {
          jsLoaded = true;
          console.log("JavaScript de Payphone ya está cargado");
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js";
        script.type = "module";
        script.onload = () => {
          setTimeout(() => {
            if (window.PPaymentButtonBox) {
              jsLoaded = true;
              console.log("JavaScript de Payphone cargado correctamente");
              resolve();
            } else {
              reject(new Error("PPaymentButtonBox no está disponible después de cargar el script"));
            }
          }, 1000); // Aumentar el tiempo de espera
        };
        script.onerror = () => {
          reject(new Error("Error al cargar el script de Payphone"));
        };
        document.head.appendChild(script);
      });
    };

    // Función para inicializar el botón de Payphone
    const initializePayphone = () => {
      if (!window.PPaymentButtonBox) {
        console.error("Error: PPaymentButtonBox no está disponible");
        setError("No se pudo cargar el botón de pago. Por favor, recarga la página.");
        setIsLoading(false);
        return;
      }

      if (!buttonRef.current) {
        console.error("Error: Contenedor del botón no está disponible");
        setError("Error en la interfaz del botón de pago.");
        setIsLoading(false);
        return;
      }

      try {
        // Limpiar el contenedor antes de renderizar
        buttonRef.current.innerHTML = "";

        // Crear instancia de PPaymentButtonBox
        payphoneInstance.current = new window.PPaymentButtonBox({
          token: token,
          ClientTransactionId: "cxvdvovddfdfffssd",
          amount: amount,
          amountWithoutTax: amountWithoutTax,
          amountWithTax: amountWithTax,
          tax: tax,
          currency: currency,
          reference: reference,
        });

        // Configurar callbacks si se proporcionan
        if (onSuccess) {
          payphoneInstance.current.onSuccess = onSuccess;
        }
        if (onError) {
          payphoneInstance.current.onError = onError;
        }

        // Renderizar el botón usando el ID del contenedor (NO el elemento DOM)
        console.log("Renderizando en el contenedor ID:", containerId.current);
        payphoneInstance.current.render(containerId.current);
        
        console.log("Botón de Payphone inicializado correctamente");
        setIsLoading(false);
      } catch (err) {
        console.error("Error al inicializar Payphone:", err);
        setError(`Error al inicializar el botón de pago: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        setIsLoading(false);
      }
    };

    // Función principal que orquesta la carga e inicialización
    const setupPayphone = async () => {
      try {
        console.log("Iniciando carga de recursos de Payphone...");
        await Promise.all([loadCSS(), loadJS()]);
        
        if (jsLoaded) {
          console.log("Recursos cargados, inicializando Payphone...");
          // Pequeña demora adicional para asegurar que el DOM esté listo
          setTimeout(() => {
            initializePayphone();
          }, 200);
        } else {
          throw new Error("No se pudieron cargar todos los recursos necesarios");
        }
      } catch (err) {
        console.error("Error en la configuración de Payphone:", err);
        setError(`Error al configurar el botón de pago: ${err instanceof Error ? err.message : 'Desconocido'}`);
        setIsLoading(false);
      }
    };


    // Iniciar el proceso de carga
    setupPayphone();

    // Limpieza al desmontar el componente
    return () => {
      if (payphoneInstance.current) {
        payphoneInstance.current = null;
      }
    };
  }, [token, amount, amountWithoutTax, amountWithTax, tax, currency, ClientTransactionId, reference, onSuccess, onError]);

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
      
      {/* IMPORTANTE: Usar id en lugar de ref para Payphone */}
      <div 
        id={containerId.current}
        ref={buttonRef} 
        className="flex justify-center"
      ></div>
    </div>
  );
}