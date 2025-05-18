"use client";

import { useEffect, useRef } from 'react';
import Script from 'next/script';

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
  successUrl = "thank-you"
}: PayPalButtonProps) {
  // Usar useRef para verificar si los botones ya han sido renderizados
  const buttonsRendered = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Función para inicializar los botones de PayPal
    const initPayPalButton = () => {
      if (window.paypal && containerRef.current && !buttonsRendered.current) {
        // Limpiamos el contenedor antes de renderizar
        containerRef.current.innerHTML = '';
        
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'pay',
          },

          createOrder: function(_data: unknown, actions: any) {
            return actions.order.create({
              purchase_units: [{
                description: productDescription,
                amount: {
                  currency_code: currency,
                  value: amount
                }
              }]
            });
          },

          onApprove: function(_data: unknown, actions: any) {
            return actions.order.capture().then(function(orderData: any) {
              console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
              
              // Redirect to success page
              window.location.href = successUrl;
            });
          },

          onError: function(err: Error) {
            console.log(err);
          }
        }).render(containerRef.current);
        
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
        src={`https://www.paypal.com/sdk/js?client-id=AYAlZJagqJe2cOJrvrnzhVX_8PqvggjKvQcG6TRp9mHcKvnx7U9LKQJp-kbiVzZ0WtGe0o0Wx81TSTtU&currency=${currency}`}
        data-sdk-integration-source="button-factory"
        onLoad={() => {
          if (window.paypalButtonCallback) {
            window.paypalButtonCallback();
          }
        }}
      />
      <div id="smart-button-container">
        <div style={{ textAlign: 'center' }}>
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