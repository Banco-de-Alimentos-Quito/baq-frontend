// app/donacion/qr/page.tsx
'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';

export default function DonacionQRPage() {
  const params = useSearchParams();
  const cantidad = Number(params.get('monto')) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 md:pt-28 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 max-w-sm w-full flex flex-col items-center">
          <h1 className="text-center text-2xl md:text-3xl font-extrabold text-blue-800 mb-4">
            ¡Escanea el código QR para completar tu donación!
          </h1>

          <img
            src="/qr_example.png"
            alt="QR para donación"
            className="w-48 h-48 md:w-56 md:h-56 mb-4 rounded-lg border-4 border-orange-500 bg-white"
          />

          <p className="text-xl md:text-2xl text-orange-600 font-semibold mb-2">
            Total a pagar: <span className="text-blue-800">${cantidad}</span>
          </p>

          <p className="text-center text-gray-600 mb-4">
            Una vez realizado el pago, tu donación será registrada automáticamente.<br />
            ¡Gracias por tu solidaridad!
          </p>

          <img
            src="https://vectorseek.com/wp-content/uploads/2023/08/Deuna-Wordmark-Logo-Vector.svg-.png"
            alt="DeUna logo"
            className="h-6 md:h-8 opacity-70"
          />
        </div>
      </main>
    </div>
  );
}
