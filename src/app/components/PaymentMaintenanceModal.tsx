'use client';
import React, { useState } from 'react';

export default function PaymentMaintenanceModal({ mantainance = false }: { mantainance?: boolean }) {
  const [visible, setVisible] = useState(true);
  if (!mantainance || !visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full mx-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mantenimiento en pasarela de pagos</h2>
        <p className="text-gray-600 mb-4">
          Actualmente estamos realizando mantenimiento en las pasarelas de pago. Es posible que los pagos no estén disponibles temporalmente.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => setVisible(false)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}