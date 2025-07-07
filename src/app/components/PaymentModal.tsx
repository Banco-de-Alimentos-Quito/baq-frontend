// components/PaymentModal.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Paypal from "../components/Paypal";
import PayphoneButton from "./PayPhone";
import PluxModal from "./PluxModal";
import { data, generatePayboxData } from "../configuration/ppx.data";
import PpxButton from "./PluxButton";

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
  onSubmitDeuna,
}: PaymentModalProps) {
  const router = useRouter();

  const [isPluxModalOpen, setIsPluxModalOpen] = useState(false);
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
      comunidad: comindadesChecked ? "1" : "0",
    });
    router.push(`/donacion/qr?${params.toString()}`);
  };

  const goToPayphone = () => {
    onClose();
    const params = new URLSearchParams({
      monto: cantidad.toString(),
      reference: `Donación BAQ - ${cantidad} USD`,
    });
    router.push(`/donacion/payphone?${params.toString()}`);
  };

  const handlePluxClick = () => {
    setIsPluxModalOpen(true);
  };

  const handleClosePluxModal = () => {
    setIsPluxModalOpen(false);
  };

  // const newLocal = <button
  //   className="flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-[#0070ba] text-[#0070ba] font-semibold hover:bg-[#0070ba] hover:text-white transition"
  //   onClick={() => { } }
  // >
  //   <span className="text-xl">💳</span>
  //   Pagar con tarjeta
  // </button>;

  const dynamicPayboxData = generatePayboxData(cantidad);


  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl p-8 w-full max-w-md shadow-xl relative"
          style={{ maxHeight: "90vh", overflowY: "auto" }}
          onClick={(e) => e.stopPropagation()}
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
            {cantidad > 0 && ( // Solo mostrar si hay un monto válido
              <Paypal
                amount={cantidad}
                productDescription="Donación al Banco de Alimentos de Quito"
                successUrl="thank-you"
              />
            )}

            {/* <PluxButton /> */}
            <button
              className="flex items-center justify-center gap-2 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition"
              onClick={handlePluxClick}
            >
              <img src="pagos-plux.png" alt="pagosplux" className="w-30"/>
              Pagar con PagoPlux
            </button>

            <PpxButton data={dynamicPayboxData}/>

            {/* Payphone */}
            <button
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold hover:from-blue-700 hover:to-blue-500 transition"
              onClick={goToPayphone}
            >
              <img src="https://oneclic.app/tutoriales/payphone/assets/img/payphone.png" alt="" className="w-10"/>
              Pagar con Payphone
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
      {/* Modal de PagoPlux */}
      <PluxModal
        isOpen={isPluxModalOpen}
        onClose={handleClosePluxModal}
        amount={cantidad}
      />
    </>
  );
}
