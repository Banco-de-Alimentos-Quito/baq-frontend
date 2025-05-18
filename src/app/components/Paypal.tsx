"use client";

import { useEffect } from 'react';
import Script from 'next/script';

interface PayPalButtonProps {
  productDescription?: string;
  amount?: number;
  currency?: string;
  successUrl?: string;
}

// PayPal SDK type definitions
interface PayPalActions {
  order: {
    create: (data: {
      purchase_units: Array<{
        description: string;
        amount: {
          currency_code: string;
          value: number;
        };
      }>;
    }) => Promise<string>;
    capture: () => Promise<PayPalOrderData>;
  };
}

interface PayPalOrderData {
  id: string;
  status: string;
  payer: Record<string, unknown>;
  purchase_units: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export default function PayPalButton({
  productDescription = "LA DESCRIPCION DE TU PRODUCTO",
  amount = 47,
  currency = "USD",
  successUrl = "/thank-you"
}: PayPalButtonProps) {
  
  useEffect(() => {
    // Initialize PayPal button after script is loaded
    const initPayPalButton = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'pay',
          },

          createOrder: function(_data: unknown, actions: PayPalActions) {
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

          onApprove: function(_data: unknown, actions: PayPalActions) {
            return actions.order.capture().then(function(orderData: PayPalOrderData) {
              console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
              
              // Redirect to success page
              window.location.href = successUrl;
            });
          },

          onError: function(err: Error) {
            console.log(err);
          }
        }).render('#paypal-button-container');
      }
    };

    // Check if PayPal script has already been loaded
    if (window.paypal) {
      initPayPalButton();
    } else {
      // The script will call initPayPalButton when it loads
      window.paypalButtonCallback = initPayPalButton;
    }
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
          <div id="paypal-button-container"></div>
        </div>
      </div>
    </>
  );
}

// Add these declarations to make TypeScript happy
declare global {
  interface Window {
    paypal: {
      Buttons: (config: unknown) => { render: (selector: string) => void };
    };
    paypalButtonCallback?: () => void;
  }
}