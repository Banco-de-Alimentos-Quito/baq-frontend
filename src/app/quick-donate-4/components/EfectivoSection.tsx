"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  UserCheck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  User,
  Fingerprint,
  Phone,
  Mail,
} from "lucide-react";
import { CedulaValidator } from "../../donacion/mensual/validators/documentValidators";

const PRESET_AMOUNTS = [2, 5, 10, 20, 50];

export function EfectivoSection() {
  const [monto, setMonto] = useState<number>(10);
  const [customMonto, setCustomMonto] = useState<string>("");

  const [nombres, setNombres] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [gestorDonacion, setGestorDonacion] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/baq";

  const handleAmountSelect = (amount: number) => {
    setMonto(amount);
    setCustomMonto("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(",", ".");
    if (val.startsWith("-")) return;
    if (val !== "" && !/^\d*\.?\d{0,2}$/.test(val)) return;

    setCustomMonto(val);
    if (val && !isNaN(Number(val))) {
      setMonto(Number(val));
    } else if (val === "") {
      setMonto(0);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!nombres.trim()) {
      errs.nombres = "El nombre de la persona que donó es requerido";
    }

    if (!cedula.trim()) {
      errs.cedula = "La cédula de identidad es requerida";
    } else if (!new CedulaValidator().validate(cedula.trim())) {
      errs.cedula = "Cédula inválida (debe tener 10 dígitos válidos)";
    }

    if (monto < 0.5) {
      errs.monto = "El monto mínimo es $0.50 USD";
    }

    if (!gestorDonacion.trim()) {
      errs.gestorDonacion = "El nombre del gestor que recibió el dinero es requerido";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        nombres_completos: nombres.trim(),
        cedula_ruc: cedula.trim() || null,
        monto: Number(monto),
        correo_electronico: correo.trim() || null,
        numero_telefono: telefono.trim() || null,
        gestor_donacion: gestorDonacion.trim(),
      };

      const res = await fetch(`${apiUrl}/donaciones/efectivo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        let rawMsg = errorJson?.message || "";
        if (
          !rawMsg ||
          typeof rawMsg !== "string" ||
          rawMsg.includes("Cannot ") ||
          rawMsg.includes("/api/") ||
          rawMsg.includes("404") ||
          rawMsg.includes("500")
        ) {
          rawMsg =
            "No pudimos registrar la donación en este momento. Por favor, verifica tu conexión o intenta nuevamente.";
        }
        throw new Error(rawMsg);
      }

      setSuccessMsg(
        `¡Donación en efectivo de $${monto} USD registrada exitosamente a nombre de ${nombres.trim()}!`,
      );

      // Limpiar formulario excepto el gestor para facilitar registros continuos
      setNombres("");
      setCedula("");
      setTelefono("");
      setCorreo("");
    } catch (err: any) {
      console.error(err);
      let friendlyMsg =
        err?.message || "Ocurrió un error al registrar la donación en efectivo.";
      if (
        typeof friendlyMsg === "string" &&
        (friendlyMsg.includes("Cannot ") ||
          friendlyMsg.includes("/api/") ||
          friendlyMsg.includes("fetch") ||
          friendlyMsg.includes("Failed to fetch"))
      ) {
        friendlyMsg =
          "No fue posible conectar con el servidor. Por favor, verifica tu conexión o intenta nuevamente en unos minutos.";
      }
      setErrorMsg(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 sm:p-8 text-center relative overflow-hidden rounded-2xl shadow-lg text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold mb-3 border border-white/25">
          <Banknote className="w-3.5 h-3.5" />
          Recepción en Efectivo
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Registro de Donación en Efectivo
        </h2>
        <p className="text-amber-100 text-sm max-w-xl mx-auto">
          Registra el dinero en efectivo entregado por donantes en eventos, colectas o ventanilla.
        </p>
      </div>

      {/* Formulario de Registro */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Monto */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <label className="block text-sm font-bold text-gray-800">
            1. Cantidad Entregada en Efectivo
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleAmountSelect(amt)}
                className={`py-3 px-2 rounded-xl font-bold text-lg transition-all duration-200 border ${
                  monto === amt && !customMonto
                    ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20 scale-102"
                    : "bg-gray-50 text-gray-700 hover:bg-amber-50/70 border-gray-200"
                }`}
              >
                ${amt} USD
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              pattern="^\d+(\.\d{0,2})?$"
              placeholder="Otra cantidad en efectivo"
              value={customMonto}
              onChange={handleCustomAmountChange}
              className={`w-full pl-8 pr-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all font-bold text-gray-700 ${
                customMonto
                  ? "border-amber-600 bg-white ring-2 ring-amber-100"
                  : "border-gray-200 focus:border-amber-600"
              }`}
            />
          </div>
          {formErrors.monto && (
            <p className="text-red-500 text-xs font-medium">{formErrors.monto}</p>
          )}
        </div>

        {/* Datos de la Persona que Donó */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#2F3388] uppercase tracking-wider flex items-center gap-2 border-b pb-3">
            <UserCheck className="w-4 h-4 text-amber-600" />
            2. Datos del Donante
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre de la persona */}
            <div className="space-y-1">
              <label htmlFor="efectivo-name" className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gray-400" />
                Nombre de la persona que donó *
              </label>
              <input
                id="efectivo-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Nombre y apellido del donante"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                  formErrors.nombres
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 focus:border-amber-600"
                }`}
              />
              {formErrors.nombres && (
                <p className="text-red-500 text-xs">{formErrors.nombres}</p>
              )}
            </div>

            {/* Cédula */}
            <div className="space-y-1">
              <label htmlFor="efectivo-cedula" className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                <Fingerprint className="w-3.5 h-3.5 text-gray-400" />
                Cédula de Identidad *
              </label>
              <input
                id="efectivo-cedula"
                name="cedula"
                type="text"
                autoComplete="off"
                placeholder="1710000000"
                value={cedula}
                onChange={(e) => {
                  setCedula(e.target.value.replace(/\D/g, ""));
                  if (formErrors.cedula) setFormErrors({ ...formErrors, cedula: "" });
                }}
                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                  formErrors.cedula
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 focus:border-amber-600"
                }`}
              />
              {formErrors.cedula && (
                <p className="text-red-500 text-xs">{formErrors.cedula}</p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-1">
              <label htmlFor="efectivo-phone" className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                Teléfono / WhatsApp (Opcional)
              </label>
              <input
                id="efectivo-phone"
                name="tel"
                type="tel"
                autoComplete="tel"
                placeholder="099..."
                value={telefono}
                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>

            {/* Correo */}
            <div className="space-y-1">
              <label htmlFor="efectivo-email" className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                Correo Electrónico (Opcional)
              </label>
              <input
                id="efectivo-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="donante@ejemplo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>
          </div>

          {/* CAMPO SOLICITADO: Gestor de la Donación */}
          <div className="pt-2">
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
              <label className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-600" />
                Gestor de la Donación *
              </label>
              <input
                type="text"
                placeholder="Nombre de la persona que gestionó o recibió el efectivo"
                value={gestorDonacion}
                onChange={(e) => setGestorDonacion(e.target.value)}
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium ${
                  formErrors.gestorDonacion
                    ? "border-red-400 bg-red-50"
                    : "border-amber-300"
                }`}
              />
              {formErrors.gestorDonacion && (
                <p className="text-red-500 text-xs font-medium">
                  {formErrors.gestorDonacion}
                </p>
              )}
              <p className="text-[11px] text-amber-700">
                Persona responsable de custodiar o recibir el dinero en efectivo.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback visual */}
        {successMsg && (
          <div className="p-4 bg-green-50 text-green-800 rounded-xl text-sm font-medium border border-green-200 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <p>{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Botón de Registro */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className={`w-full py-4 px-6 rounded-2xl shadow-xl text-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
            loading
              ? "bg-gray-400 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-amber-600 to-orange-600 hover:shadow-amber-600/30"
          }`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Guardando Donación en Efectivo...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              <span>Registrar Donación en Efectivo (${monto} USD)</span>
            </div>
          )}
        </motion.button>
      </form>
    </div>
  );
}
