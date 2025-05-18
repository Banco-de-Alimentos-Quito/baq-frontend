"use client";

import { useEffect, useState } from "react";

// Definición de tipos para la respuesta de PagoPlux
interface PaymentResponse {
  status: string;
  // Otros campos que pueda tener la respuesta
  cardInfo?: string;
  cardIssuer?: string;
  cardType?: string;
  clientID?: string;
  clientName?: string;
  description?: string;
  amount?: number;
  id_transaccion?: string;
  // ...etc
}

// Extendemos Window para incluir las propiedades de Paybox
declare global {
  interface Window {
    Paybox?: {
      init: (data: any, callback: (response: PaymentResponse) => void) => void;
    };
    jQuery?: any;
    $?: any;
    onload?: any;
  }
}

export const PluxButton = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let jqueryLoaded = false;
    let payboxLoaded = false;
    let timeoutId: NodeJS.Timeout;

    // Función para cargar jQuery
    const loadJQuery = () => {
      return new Promise<void>((resolve, reject) => {
        // Si jQuery ya está cargado, resolvemos de inmediato
        if (window.jQuery) {
          jqueryLoaded = true;
          console.log("jQuery ya está cargado");
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://code.jquery.com/jquery-3.4.1.min.js";
        script.async = true;
        script.onload = () => {
          jqueryLoaded = true;
          console.log("jQuery cargado correctamente");
          resolve();
        };
        script.onerror = () => {
          reject(new Error("Error al cargar jQuery"));
        };
        document.head.appendChild(script);
      });
    };

    // Función para cargar el script de Paybox
    const loadPaybox = () => {
      return new Promise<void>((resolve, reject) => {
        // Si Paybox ya está cargado, resolvemos de inmediato
        if (window.Paybox) {
          payboxLoaded = true;
          console.log("Paybox ya está cargado");
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://sandbox-paybox.pagoplux.com/paybox/index.js";
        script.async = true;
        script.onload = () => {
          // Esperamos un momento para asegurarnos de que Paybox se inicialice completamente
          setTimeout(() => {
            if (window.Paybox) {
              payboxLoaded = true;
              console.log("Paybox cargado correctamente");
              resolve();
            } else {
              reject(new Error("Paybox no está disponible después de cargar el script"));
            }
          }, 500); // Pequeño retraso para asegurar la inicialización
        };
        script.onerror = () => {
          reject(new Error("Error al cargar el script de Paybox"));
        };
        document.head.appendChild(script);
      });
    };

    // Función para inicializar el botón de Paybox
    const initializePaybox = () => {
      // Verificación adicional para asegurarnos de que Paybox está disponible
      if (!window.Paybox) {
        console.error("Error: Paybox no está disponible en initializePaybox");
        setError("No se pudo cargar el botón de pago. Por favor, recarga la página.");
        setIsLoading(false);
        return;
      }

      // Configuración del botón de pago
      const data = {
        PayboxRemail: "abautista@pagoplux.com",
        PayboxSendmail: "user@user.com",
        PayboxRename: "Hackaton Grupo X",
        PayboxSendname: "Nombre Persona",
        PayboxBase0: "80.0",
        PayboxBase12: "5.0",
        PayboxDescription: "GRUPO X Descripción",
        PayboxRequired: [],
        PayboxLanguage: "es",
        PayboxDirection: "Av.Napoleon y Ofradia",
        PayBoxClientPhone: "0992726945",
        PayboxProduction: false,
        PayboxRecurrent: true,
        PayboxLinkBloqueoDatos: false,
        PayboxQuotas: "3",
        PayboxIdPlan: "749",
        PayboxPermitirCalendarizar: false,
        PayboxAmountVariablePlan: false,
        PayboxTieneIvaPlan: false,
        PayboxFrequencyPlan: "MEN",
        PayboxPagoInmediato: true,
        PayboxCobroPrueba: false,
        PayBoxClientName: "Monica Sanchez",
        PayBoxClientIdentification: "1890138507001",
        PayboxTypeIdentification: "RUC", // CC
        PayboxDescriptionPlan: "Descripcion plan",
        PayboxEnvironment: "sandbox",
        PayboxPagoPlux: true, // Cambio a true para que se muestre el botón
        PayboxIdElement: "ButtonPaybox",
        PayboxExtras: "GRUPO X",
      };

      // Función de callback cuando se completa el proceso de pago
      const onAuthorize = (response: PaymentResponse) => {
        if (response.status === "succeeded") {
          console.log("Pago exitoso:", response);
          alert("Pago realizado con éxito!");
        } else {
          console.log("El pago no fue exitoso o fue cancelado:", response);
          alert("El pago no se completó o fue cancelado.");
        }
      };

      try {
        // Inicializar el botón de Paybox
        console.log("Intentando inicializar Paybox...");
        window.Paybox.init(data, onAuthorize);
        console.log("Paybox inicializado correctamente");
        setIsLoading(false);
      } catch (err) {
        console.error("Error al inicializar Paybox:", err);
        setError("Error al inicializar el botón de pago");
        setIsLoading(false);
      }
    };

    // Función principal que orquesta la carga e inicialización
    const setupPaybox = async () => {
      try {
        console.log("Iniciando carga de scripts...");
        await loadJQuery();
        await loadPaybox();
        
        // Aseguramos que ambos scripts se cargaron correctamente
        if (jqueryLoaded && payboxLoaded) {
          console.log("Scripts cargados, inicializando Paybox...");
          initializePaybox();
        } else {
          throw new Error("No se pudieron cargar todos los scripts necesarios");
        }
      } catch (err) {
        console.error("Error en la configuración de Paybox:", err);
        setError(`Error al configurar el botón de pago: ${err instanceof Error ? err.message : 'Desconocido'}`);
        setIsLoading(false);
      }
    };

    // Establecemos un timeout para mostrar un error si la carga tarda demasiado
    timeoutId = setTimeout(() => {
      if (isLoading) {
        setError("Tiempo de espera agotado al cargar el botón de pago");
        setIsLoading(false);
      }
    }, 15000); // 15 segundos de timeout

    // Iniciamos el proceso de carga
    setupPaybox();

    // Limpieza al desmontar el componente
    return () => {
      clearTimeout(timeoutId);
    };
  }, []); // Se ejecuta solo una vez al montar el componente

  return (
    <div className="w-full max-w-md p-6 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-center">Pago con PagoPlux</h2>
      
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
      
      <div id="ButtonPaybox" className="flex justify-center"></div>
    </div>
  );
};