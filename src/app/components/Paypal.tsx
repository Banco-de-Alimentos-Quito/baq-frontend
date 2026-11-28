"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { useFormStore } from "../store/formStore";
import { useRouter } from "next/navigation";
import { trackDonationPurchase } from "@/lib/donationAnalytics";

interface PayPalButtonProps {
  productDescription?: string;
  amount?: number;
  currency?: string;
  successUrl?: string;
  onSuccess?: () => void;
}

export default function PayPalButton({
  productDescription = "LA DESCRIPCION DE TU PRODUCTO",
  amount = 0,
  currency = "USD",
  successUrl = "thank-you",
  onSuccess,
}: PayPalButtonProps) {
  const router = useRouter();
  // Usar useRef para verificar si los botones ya han sido renderizados
  const buttonsRendered = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
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

                const { userId, identificacion: identificacionDonante, direccion: direccionDonante } = useFormStore.getState();

                const captureResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paypal/capture-order`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    data: transacction,
                    userId: userId,
                    identificacionDonante,
                    direccionDonante,
                  }),
                });
                if (!captureResponse.ok) throw new Error("No se pudo confirmar la captura de PayPal");
                const payload = await captureResponse.json();
                const order = payload?.data?.purchase_units ? payload.data : payload;
                const capture = order?.purchase_units
                  ?.flatMap((unit: any) => unit?.payments?.captures || [])
                  .find((item: any) => item?.status === "COMPLETED" && item?.id);
                if (!capture) throw new Error("PayPal no devolvió una captura completada verificable");

                trackDonationPurchase(capture.id, Number(capture.amount?.value || amount), "paypal");
                onSuccessRef.current?.();
                router.push(`/${successUrl.replace(/^\//, "")}`);
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
  }, [productDescription, amount, currency, successUrl, router]);

  return (
    <>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=${currency}&locale=es_ES`}
        data-sdk-integration-source="button-factory"
        onLoad={() => {
          if (window.paypalButtonCallback) {
            window.paypalButtonCallback();
          }
        }}
      />
      <div id="smart-button-container" className="relative z-10">
        <div style={{ textAlign: "center" }}>
          {/* Agregar margen suficiente para evitar que el botón quede muy pegado al texto */}
          <div ref={containerRef} id="paypal-button-container" style={{ margin: "0 auto" }}></div>
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
