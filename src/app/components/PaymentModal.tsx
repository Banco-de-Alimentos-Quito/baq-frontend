// components/PaymentModal.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Paypal from '../components/Paypal';

interface DeunaForm {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  documento: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cantidad: number;
  deunaForm: DeunaForm;
  setDeunaForm: React.Dispatch<React.SetStateAction<DeunaForm>>;
  comindadesChecked: boolean;
  setComindadesChecked: React.Dispatch<React.SetStateAction<boolean>>;
  consentChecked: boolean;
  setConsentChecked: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmitDeuna: (e: React.FormEvent) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  cantidad,
  deunaForm,
  setDeunaForm,
  comindadesChecked,
  setComindadesChecked,
  consentChecked,
  setConsentChecked,
  onSubmitDeuna
}: PaymentModalProps) {
  const router = useRouter();
  if (!isOpen) return null;

  const goToDeuna = () => {
    onClose();
    const params = new URLSearchParams({
      monto: cantidad.toString(),
      nombre: deunaForm.nombre,
      apellido: deunaForm.apellido,
      correo: deunaForm.correo,
      telefono: deunaForm.telefono,
      documento: deunaForm.documento,
      comunidad: comindadesChecked ? '1' : '0',
    });
    router.push(`/donacion/qr?${params.toString()}`);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-8 w-full max-w-lg shadow-xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-2xl text-orange-400 hover:text-orange-600 transition"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-center text-2xl font-extrabold text-[#2F3388] mb-6">
          Selecciona tu método de pago
        </h2>
        <div className="flex flex-col gap-4">
          <Paypal />

          <button
            className="flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-[#0070ba] text-[#0070ba] font-semibold hover:bg-[#0070ba] hover:text-white transition"
            onClick={() => {/* Lógica tarjeta */}}
          >
            <span className="text-xl">💳</span>
            Pagar con tarjeta
          </button>

          <button
            className="flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-300 text-white font-semibold hover:from-[#2F3388] hover:to-[#ff7300] transition"
            onClick={goToDeuna}
          >
            <img
              src="https://vectorseek.com/wp-content/uploads/2023/08/Deuna-Wordmark-Logo-Vector.svg-.png"
              alt="DeUna"
              className="h-6"
            />
            Pagar con DeUna (QR)
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">
          *DeUna: pagos con QR solo para Ecuador
        </p>

        {/* Aquí podrías también reutilizar el formulario de DeUna si quieres */}
      </div>
    </div>
  );
}
