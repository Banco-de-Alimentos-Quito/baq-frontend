// components/PaymentModal.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Paypal from "../components/Paypal";
import { z } from "zod";
import PluxModal from "./PluxModal";
import { getOrCreateUserId } from "../utils/utils";

interface DeunaForm {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  documento: string;
}

// Esquema de validación para los datos del modal
const PpxUserSchema = z.object({
  email: z.email({ message: "Por favor, ingresa un correo válido." }),
  phone: z
    .string()
    .regex(/^\d{10}$/, { message: "El teléfono debe tener 10 dígitos." }),
});

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
  const [isPpxFormOpen, setIsPpxFormOpen] = useState(false);
  const [ppxUserData, setPpxUserData] = useState({
    email: "",
    phone: "",
  });

  // 2. Añadir estado para los errores de validación
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    phone: "",
  });
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");

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

  const handleClosePluxModal = () => {
    setIsPluxModalOpen(false);
  };

  const handlePpxClick = () => {
    setIsPpxFormOpen(true);
  };

  const formGoToPagoPlux = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ppxUserData.email || !ppxUserData.phone) {
      alert("Por favor, completa todos los campos");
      return;
    }
    // 3. Validar los datos con el esquema de Zod
    const result = PpxUserSchema.safeParse(ppxUserData);

    if (!result.success) {
      // Si la validación falla, actualiza el estado de errores
      const errors = result.error.flatten().fieldErrors;
      setValidationErrors({
        email: errors.email?.[0] || "",
        phone: errors.phone?.[0] || "",
      });
      return;
    }

    // Si la validación es exitosa, limpia los errores
    setValidationErrors({ email: "", phone: "" });

    sessionStorage.setItem("direccionDonador", direccion);

    // Cerrar modales
    setIsPpxFormOpen(false);
    onClose();

    const userId = getOrCreateUserId();

    // Redirigir a la página de PagoPlux con los datos validados
    const params = new URLSearchParams({
      monto: cantidad.toString(),
      email: result.data.email,
      phone: result.data.phone,
      user_id: userId,
      direccion: encodeURIComponent(direccion),
      ciudad: encodeURIComponent(ciudad),
    });
    router.push(`/donacion/pagoplux?${params.toString()}`);
  };

  const getPpxUserSchema = (requireAddress: boolean) =>
    z.object({
      email: z
        .string()
        .email({ message: "Por favor, ingresa un correo válido." }),
      phone: z
        .string()
        .regex(/^\d{10}$/, { message: "El teléfono debe tener 10 dígitos." }),
      ...(requireAddress && {
        ciudad: z.string().min(2, { message: "La ciudad es obligatoria." }),
        direccion: z
          .string()
          .min(5, { message: "La dirección es obligatoria." }),
      }),
    });

  const handleClosePpxForm = () => {
    setIsPpxFormOpen(false);
    setPpxUserData({ email: "", phone: "" });
  };

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
            {cantidad >= 1 ? (
              <>
                <button
                  className="flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold hover:from-blue-700 hover:to-blue-500 transition"
                  onClick={() => {
                    onClose();
                    router.push(`/donacion/paypal?monto=${cantidad}`);
                  }}
                >
                  <img
                    src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_74x46.jpg"
                    alt="PayPal"
                    className="h-6"
                  />
                  Pagar con PayPal
                </button>
                
                <button
                  className="flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-orange-400 text-white font-semibold hover:from-orange-700 hover:to-orange-500 transition"
                  onClick={() => {
                    onClose();
                    router.push(`/donacion/deuna?monto=${cantidad}`);
                  }}
                >
                  <img
                    src="https://vectorseek.com/wp-content/uploads/2023/08/Deuna-Wordmark-Logo-Vector.svg-.png"
                    alt="DeUna"
                    className="h-6"
                  />
                  Pagar con DeUna
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center py-3">
                  <div style={{ width: "100%" }}>
                    <Paypal
                      amount={cantidad}
                      productDescription={`Donación BAQ - ${cantidad} USD`}
                      successUrl="thank-you"
                    />
                  </div>
                </div>
                
                {/* ✅ NUEVO: Botón DeUna directo para montos < $50 (sin formulario) */}
                <button
                  className="flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-orange-400 text-white font-semibold hover:from-orange-700 hover:to-orange-500 transition"
                  onClick={goToDeuna}
                >
                  <img
                    src="https://vectorseek.com/wp-content/uploads/2023/08/Deuna-Wordmark-Logo-Vector.svg-.png"
                    alt="DeUna"
                    className="h-6"
                  />
                  Pagar con DeUna
                </button>
              </>
            )}
            {/* <PpxButton data={dynamicPayboxData} /> */}

            <button
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-400 text-white font-semibold hover:from-green-700 hover:to-green-500 transition"
              onClick={handlePpxClick}
            >
              <img src="pagos-plux.png" className="w-20" />
              Pagar con Tarjeta (PagoPlux)
            </button>

            {/* Payphone */}
            <button
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold hover:from-blue-700 hover:to-blue-500 transition"
              onClick={goToPayphone}
            >
              <img
                src="https://oneclic.app/tutoriales/payphone/assets/img/payphone.png"
                alt=""
                className="w-10"
              />
              Pagar con Payphone
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

      {/* Modal para capturar datos de usuario PagoPlux */}
      {isPpxFormOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center"
          onClick={handleClosePpxForm}
        >
          <div
            className="bg-white rounded-xl p-8 w-full max-w-md shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-2xl text-orange-400 hover:text-orange-600 transition"
              onClick={handleClosePpxForm}
            >
              &times;
            </button>
            <h2 className="text-center text-2xl font-extrabold text-[#2F3388] mb-6">
              Información de Contacto
            </h2>
            <form onSubmit={formGoToPagoPlux} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-600 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={ppxUserData.email}
                  onChange={(e) => {
                    setPpxUserData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }));
                    // Limpiar el error al escribir
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  className={`p-3 border rounded-lg focus:outline-none ${
                    validationErrors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  required
                />
                {/* 4. Mostrar el mensaje de error */}
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-600 mb-1">
                  Número de Teléfono *
                </label>
                <input
                  type="tel"
                  placeholder="0987654321"
                  value={ppxUserData.phone}
                  onChange={(e) => {
                    setPpxUserData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }));
                    // Limpiar el error al escribir
                    if (validationErrors.phone) {
                      setValidationErrors((prev) => ({ ...prev, phone: "" }));
                    }
                  }}
                  className={`p-3 border rounded-lg focus:outline-none ${
                    validationErrors.phone
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  required
                />
                {/* 4. Mostrar el mensaje de error */}
                {validationErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              {cantidad >= 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    placeholder="Ingresa tu ciudad"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ingresa la ciudad para la factura
                  </p>
                </div>
              )}

              {cantidad >= 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ingresa tu dirección"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ingresa la dirección para la factura
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-500 transition"
              >
                Continuar con el Pago
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
