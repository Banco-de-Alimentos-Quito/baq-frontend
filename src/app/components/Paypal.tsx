"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { getOrCreateUserId } from "../utils/utils";

interface PayPalButtonProps {
  productDescription?: string;
  amount?: number;
  currency?: string;
  successUrl?: string;
}

export default function PayPalButton({
  productDescription = "LA DESCRIPCION DE TU PRODUCTO",
  amount = 0,
  currency = "USD",
  successUrl = "thank-you",
}: PayPalButtonProps) {
  // Usar useRef para verificar si los botones ya han sido renderizados
  const buttonsRendered = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generar y almacenar user_id si no existe
    if (typeof window !== 'undefined') {
      let userId = localStorage.getItem('user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('user_id', userId);
      }
    }

    // Función para inicializar los botones de PayPal
    const initPayPalButton = () => {
      if (window.paypal && containerRef.current && !buttonsRendered.current) {
        // Limpiamos el contenedor antes de renderizar
        containerRef.current.innerHTML = "";

        window.paypal
          .Buttons({
            style: {
              shape: "rect",
              color: "gold",
              layout: "vertical",
              label: "pay",
            },

            createOrder: function (_data: unknown, actions: any) {
              return actions.order.create({
                purchase_units: [
                  {
                    description: productDescription,
                    amount: {
                      currency_code: currency,
                      value: amount,
                    },
                  },
                ],
              });
            },

            onApprove: async function (data: unknown, actions: any) {
              try {
                const transacction = data;
                const userId = getOrCreateUserId();

                await fetch(`${process.env.NEXT_PUBLIC_API_URL}paypal/capture-order`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    data: transacction,
                    userId: userId,
                  }),
                });

                // Usar router.push en lugar de window.location
                window.location.href = `/${successUrl}`;
              } catch (error) {
                console.error("Error al procesar el pago:", error);
              }
            },

            onError: function (err: Error) {
              console.error("Error en PayPal:", err);
            },
          })
          .render(containerRef.current);

        // Marcar que los botones ya han sido renderizados
        buttonsRendered.current = true;
      }
    };

    // Verificar si PayPal ya está cargado
    if (window.paypal) {
      initPayPalButton();
    } else {
      // El script llamará a initPayPalButton cuando se cargue
      window.paypalButtonCallback = initPayPalButton;
    }

    // Limpieza al desmontar el componente
    return () => {
      buttonsRendered.current = false;
    };
  }, [productDescription, amount, currency, successUrl]);

  return (
    <>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=${currency}`}
        data-sdk-integration-source="button-factory"
        onLoad={() => {
          if (window.paypalButtonCallback) {
            window.paypalButtonCallback();
          }
        }}
      />
      <div id="smart-button-container">
        <div style={{ textAlign: "center" }}>
          <div ref={containerRef} id="paypal-button-container"></div>
        </div>
      </div>
    </>
  );
}

// Add these declarations to make TypeScript happy
declare global {
  interface Window {
    paypal: any;
    paypalButtonCallback?: () => void;
  }
}
