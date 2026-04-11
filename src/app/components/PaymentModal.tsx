// components/PaymentModal.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Paypal from "../components/Paypal";
import { z } from "zod";
import PluxModal from "./PluxModal";
import { getOrCreateUserId } from "../utils/utils";
import { useFormStore } from "../store/formStore";
import { GestorDonacionSelector } from "../donacion/mensual/components/GestorDonacionSelector";

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
  gestorDonacion: z.string().min(1, { message: "Selecciona un gestor de donación." }),
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
    gestorDonacion: "BAQ",
  });

  // 2. Añadir estado para los errores de validación
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    phone: "",
    gestorDonacion: "",
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
        gestorDonacion: errors.gestorDonacion?.[0] || "",
      });
      return;
    }

    // Si la validación es exitosa, limpia los errores
    setValidationErrors({ email: "", phone: "", gestorDonacion: "" });

    useFormStore.setState({
      direccion,
      ciudad,
      gestorDonacion: ppxUserData.gestorDonacion,
    });

    // Cerrar modales
    setIsPpxFormOpen(false);
    onClose();

    const { userId } = useFormStore.getState();

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
    setPpxUserData({ email: "", phone: "", gestorDonacion: "BAQ" });
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
                  className="flex items-center justify-center gap-2 py-5 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
                  onClick={() => {
                    onClose();
                    router.push(`/donacion/deuna?monto=${cantidad}`);
                  }}
                >
                  <Image
                    src="https://vectorseek.com/wp-content/uploads/2023/08/Deuna-Wordmark-Logo-Vector.svg-.png"
                    alt="DeUna"
                    width={80}
                    height={24}
                    className="h-6 w-auto"
                    unoptimized
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
                  className="flex items-center justify-center gap-2 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
                  onClick={goToDeuna}
                >
                  <Image
                    src="https://vectorseek.com/wp-content/uploads/2023/08/Deuna-Wordmark-Logo-Vector.svg-.png"
                    alt="DeUna"
                    width={80}
                    height={24}
                    className="h-6 w-auto"
                    unoptimized
                  />
                  Pagar con DeUna
                </button>
              </>
            )}
            {/* <PpxButton data={dynamicPayboxData} /> */}

            {/* Payphone */}
            <button
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              onClick={goToPayphone}
            >
              <Image
                src="https://oneclic.app/tutoriales/payphone/assets/img/payphone.png"
                alt="Payphone"
                width={40}
                height={40}
                className="w-10 h-auto"
                unoptimized
              />
              Pagar con Payphone
            </button>

            <button
              className="flex items-center justify-center gap-1 py-1 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              onClick={handlePpxClick}
            >
              <Image src="/pagos-plux.png" alt="PagoPlux" width={80} height={32} className="w-20 h-auto" />
              Pagar con Tarjeta (PagoPlux)
            </button>

            {/* Nuvei – Pago con tarjeta */}
            <button
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-[#1B2A4A] text-white font-semibold hover:bg-[#142038] transition"
              onClick={() => {
                onClose();
                router.push(`/donacion/nuvei?monto=${cantidad}`);
              }}
            >
              <Image
                src="/payment-logos/nuvei-logo.png"
                alt="Nuvei"
                width={80}
                height={28}
                className="h-7 w-auto brightness-0 invert"
              />
              Pagar con Tarjeta (Nuvei)
            </button>

            <button
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 text-white font-semibold opacity-50 cursor-not-allowed"
              onClick={() => {
                onClose();
                router.push(`/donacion/paypal?monto=${cantidad}`);
              }}
              disabled
            >
              <Image
                src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_74x46.jpg"
                alt="PayPal"
                width={74}
                height={24}
                className="h-6 w-auto"
                unoptimized
              />
              Pagar con PayPal
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
                  placeholder="email.ejemplo@gmail.com"
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
                  placeholder="Ej. 0987699223"
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

              <div>
                <GestorDonacionSelector
                  label="¿Cómo conociste al Banco de Alimentos?"
                  name="gestorDonacion"
                  value={ppxUserData.gestorDonacion}
                  required
                  error={validationErrors.gestorDonacion}
                  touched={true}
                  onChange={(e) => {
                    setPpxUserData((prev) => ({
                      ...prev,
                      gestorDonacion: e.target.value,
                    }));
                    // Limpiar el error al escribir
                    if (validationErrors.gestorDonacion) {
                      setValidationErrors((prev) => ({ ...prev, gestorDonacion: "" }));
                    }
                  }}
                  onBlur={() => {}}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
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
