"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  UserCheck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  ShieldCheck,
  User,
  Fingerprint,
  ArrowRight,
  ArrowLeft,
  Edit2,
  Check,
} from "lucide-react";
import { CedulaValidator } from "../../donacion/mensual/validators/documentValidators";

declare global {
  var PaymentGateway: any;
}

const PRESET_AMOUNTS = [2, 10, 30, 50];

interface NuveiRecurrenteSectionProps {
  initialMonto?: number;
}

export function NuveiRecurrenteSection({ initialMonto = 10 }: NuveiRecurrenteSectionProps) {
  const [monto, setMonto] = useState<number>(initialMonto);
  const [customMonto, setCustomMonto] = useState<string>("");

  const [inputEmail, setInputEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  // Campo: Gestor de la Donación
  const [gestorDonacion, setGestorDonacion] = useState("");

  const fallbackUserId = useMemo(
    () => "user_" + String(Math.floor(Date.now() / 1000)),
    [],
  );

  const [status, setStatus] = useState<
    "idle" | "loading" | "processing" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [tokenizeSdkReady, setTokenizeSdkReady] = useState(false);
  const [pgSdk, setPgSdk] = useState<any>(null);

  const [txResult, setTxResult] = useState<{
    status: "success" | "error";
    title: string;
    message: string;
    txId?: string;
  } | null>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  // Paso 1: Datos del donante | Paso 2: Datos de la tarjeta (Nuvei)
  const [isFormReadyForCard, setIsFormReadyForCard] = useState(false);

  // Ref con los datos validados para evitar cierres obsoletos y re-renderizados del iframe
  const donorDataRef = useRef({
    email: inputEmail,
    nombre: nombre,
    cedula: cedula,
    monto: monto,
    gestorDonacion: gestorDonacion,
    fallbackUserId: fallbackUserId,
  });

  const handleAmountSelect = (amount: number) => {
    setMonto(amount);
    setCustomMonto("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(",", ".");
    if (val.startsWith("-")) return;

    if (val !== "" && !/^\d*\.?\d{0,2}$/.test(val)) {
      return;
    }

    setCustomMonto(val);
    if (val && !isNaN(Number(val))) {
      setMonto(Number(val));
    } else if (val === "") {
      setMonto(0);
    }
  };

  const validatePreForm = () => {
    const errs: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!inputEmail.trim()) {
      errs.email = "El correo es requerido";
    } else if (!emailRegex.test(inputEmail.trim())) {
      errs.email = "Correo electrónico inválido";
    }

    if (!nombre.trim()) {
      errs.nombre = "El nombre es requerido";
    }

    if (!cedula.trim()) {
      errs.cedula = "La cédula es requerida";
    } else if (!new CedulaValidator().validate(cedula.trim())) {
      errs.cedula = "Cédula inválida";
    }

    if (monto < 1) {
      errs.monto = "El monto mínimo es $1.00 USD";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinueToCard = () => {
    if (!validatePreForm()) {
      return;
    }
    donorDataRef.current = {
      email: inputEmail.trim(),
      nombre: nombre.trim(),
      cedula: cedula.trim(),
      monto: monto,
      gestorDonacion: gestorDonacion.trim(),
      fallbackUserId: fallbackUserId,
    };
    setStatus("idle");
    setMessage("");
    setIsFormReadyForCard(true);
  };

  const handleBackToData = () => {
    setIsFormReadyForCard(false);
    setStatus("idle");
    setMessage("");
  };

  // Inicializar el SDK de Nuvei ÚNICAMENTE cuando el usuario pasa al paso de tarjeta
  useEffect(() => {
    if (!isFormReadyForCard) return;
    if (!tokenizeSdkReady) return;
    if (typeof PaymentGateway === "undefined") return;

    const nuveiEnv = process.env.NEXT_PUBLIC_NUVEI_ENV || "stg";
    const clientAppCode =
      process.env.NEXT_PUBLIC_NUVEI_REC_CLIENT_CODE ||
      process.env.NEXT_PUBLIC_NUVEI_CLIENT_CODE ||
      "";
    const clientAppKey =
      process.env.NEXT_PUBLIC_NUVEI_REC_CLIENT_KEY ||
      process.env.NEXT_PUBLIC_NUVEI_CLIENT_KEY ||
      "";

    if (!clientAppCode || !clientAppKey) {
      console.warn("[Nuvei] Credenciales de cliente no configuradas");
      return;
    }

    try {
      const sdk = new PaymentGateway(nuveiEnv, clientAppCode, clientAppKey);
      setPgSdk(sdk);

      const currentData = donorDataRef.current;

      const get_tokenize_data = () => ({
        locale: "es",
        user: {
          id: currentData.fallbackUserId,
          email: currentData.email || "donante@baq.ec",
        },
        configuration: {
          default_country: "ECU",
        },
      });

      const responseCallback = (response: any) => {
        console.log("[Nuvei] Tokenize response:", response);

        if (response.error) {
          setStatus("error");
          setTxResult({
            status: "error",
            title: "Error al validar la tarjeta",
            message:
              response.error.description ||
              response.error.type ||
              "Hubo un problema al procesar la tarjeta con el banco.",
          });
        } else if (
          response.card &&
          response.card.status === "valid" &&
          response.card.token
        ) {
          setStatus("processing");
          setMessage("Activando suscripción recurrente en el sistema...");

          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/baq";

          const finalData = donorDataRef.current;

          fetch(`${apiUrl}/nuvei/save-subscription`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: response.card.token,
              bin: response.card.bin,
              userId: finalData.fallbackUserId,
              email: finalData.email,
              monto: finalData.monto,
              cedula: finalData.cedula,
              nombre: finalData.nombre,
              gestor_donacion: finalData.gestorDonacion || "NUVEI",
              response: response,
            }),
          })
            .then(async (res) => {
              if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(
                  errorData.error ||
                    "Fallo en el servidor al guardar la suscripción",
                );
              }
              setStatus("success");
              setTxResult({
                status: "success",
                title: "¡Suscripción Mensual Activa!",
                message:
                  `Tu tarjeta terminada en ${response.card.number || "****"} fue registrada exitosamente. ` +
                  `Tu donación mensual de $${finalData.monto} USD se procesará automáticamente cada mes. ¡Gracias por transformar vidas con el Banco de Alimentos Quito!`,
              });
            })
            .catch((err) => {
              console.error("Error al guardar suscripción", err);
              setStatus("error");
              setTxResult({
                status: "error",
                title: "Atención",
                message:
                  "Tu tarjeta fue autorizada por el banco, pero ocurrió un detalle al vincularla en el sistema. Por favor contáctanos con tu correo para confirmar.",
              });
            });
        } else if (response.card && response.card.status !== "valid") {
          setStatus("error");
          setTxResult({
            status: "error",
            title: "Tarjeta No Válida",
            message:
              response.card.message ||
              "Tu tarjeta no fue aprobada por la entidad financiera. Por favor prueba con otra tarjeta de crédito o débito.",
          });
        } else {
          setStatus("error");
          setTxResult({
            status: "error",
            title: "Respuesta no reconocida",
            message: "El procesador devolvió un estado desconocido.",
          });
        }
      };

      const notCompletedFormCallback = (msg: string) => {
        setStatus("error");
        setMessage(
          `Formulario de tarjeta incompleto: ${msg}. Por favor revisa los datos de tu tarjeta.`,
        );
      };

      // Inyectar el contenedor seguro de tokenización una sola vez
      const containerEl = document.querySelector("#tokenize_nuvei_recurring");
      if (containerEl) {
        containerEl.innerHTML = "";
        sdk.generate_tokenize(
          get_tokenize_data(),
          "#tokenize_nuvei_recurring",
          responseCallback,
          notCompletedFormCallback,
        );
      }
    } catch (err) {
      console.error("[Nuvei] Error inicializando tokenización:", err);
      setStatus("error");
      setMessage("Error al cargar la pasarela de tarjeta de Nuvei.");
    }
  }, [isFormReadyForCard, tokenizeSdkReady]);

  const handlePay = () => {
    if (!pgSdk) {
      setStatus("error");
      setMessage("El formulario de tarjeta seguro aún está cargando...");
      return;
    }

    setStatus("processing");
    setMessage("Comunicándonos de forma segura con Nuvei...");
    pgSdk.tokenize();
  };

  return (
    <div className="w-full">
      {/* Script oficial del SDK de Nuvei Tokenize */}
      <Script
        src="https://cdn.paymentez.com/ccapi/sdk/payment_sdk_stable.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("[Nuvei] SDK Tokenize cargado correctamente");
          setTokenizeSdkReady(true);
        }}
        onError={() => {
          console.error("[Nuvei] Error cargando SDK Tokenize");
          setStatus("error");
          setMessage("No se pudo cargar el procesador de pagos para suscripciones.");
        }}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#C800A1] via-[#aa028a] to-[#2F3388] p-6 sm:p-8 text-center relative overflow-hidden rounded-2xl shadow-lg mb-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold mb-3 border border-white/25">
          <CreditCard className="w-3.5 h-3.5" />
          Suscripciones Recurrentes con Nuvei
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Donación Recurrente con Tarjeta (Nuvei)
        </h2>
        <p className="text-pink-100 text-sm max-w-xl mx-auto">
          Cargo automático mensual con tarjeta de crédito o débito Visa, MasterCard o Diners Club.
        </p>
      </div>

      {/* Indicador visual de pasos */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6">
        <button
          type="button"
          onClick={() => isFormReadyForCard && handleBackToData()}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            !isFormReadyForCard
              ? "bg-[#C800A1] text-white shadow-sm"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          }`}
        >
          {isFormReadyForCard ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <span className="w-4 h-4 rounded-full bg-white text-[#C800A1] flex items-center justify-center text-[10px] font-black">
              1
            </span>
          )}
          <span>1. Datos del Donante</span>
        </button>

        <span className="text-gray-300 font-bold">→</span>

        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            isFormReadyForCard
              ? "bg-[#C800A1] text-white shadow-sm"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          <span
            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
              isFormReadyForCard
                ? "bg-white text-[#C800A1]"
                : "bg-gray-300 text-white"
            }`}
          >
            2
          </span>
          <span>2. Datos de Tarjeta</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* PASO 1: DATOS DEL DONANTE Y MONTO */}
      {/* ─────────────────────────────────────────────────────────── */}
      {!isFormReadyForCard && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {/* Selector de Monto */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-gray-800">
                1. Selecciona el Monto Mensual a Donar
              </label>
              <span className="text-xs font-bold text-[#C800A1] bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                Mensual recurrente
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAmountSelect(amt)}
                  className={`py-3 px-2 rounded-xl font-bold text-lg transition-all duration-200 border ${
                    monto === amt && !customMonto
                      ? "bg-[#C800A1] text-white border-[#C800A1] shadow-md shadow-pink-500/20 scale-102"
                      : "bg-gray-50 text-gray-700 hover:bg-pink-50/70 border-gray-200"
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
                placeholder="Otro monto mensual"
                value={customMonto}
                onChange={handleCustomAmountChange}
                className={`w-full pl-8 pr-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all font-bold text-gray-700 ${
                  customMonto
                    ? "border-[#C800A1] bg-white ring-2 ring-pink-100"
                    : "border-gray-200 focus:border-[#C800A1]"
                }`}
              />
            </div>
            {formErrors.monto && (
              <p className="text-red-500 text-xs font-medium">{formErrors.monto}</p>
            )}
          </div>

          {/* Datos del Donante */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#2F3388] uppercase tracking-wider flex items-center gap-2 border-b pb-3">
              <UserCheck className="w-4 h-4 text-[#C800A1]" />
              2. Datos del Donante y Gestor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Correo Electrónico */}
              <div className="space-y-1">
                <label
                  htmlFor="nuvei-email"
                  className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  Correo Electrónico *
                </label>
                <input
                  id="nuvei-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  value={inputEmail}
                  onChange={(e) => {
                    setInputEmail(e.target.value);
                    if (formErrors.email)
                      setFormErrors({ ...formErrors, email: "" });
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                    formErrors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 focus:border-[#C800A1]"
                  }`}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs">{formErrors.email}</p>
                )}
              </div>

              {/* Nombres y Apellidos */}
              <div className="space-y-1">
                <label
                  htmlFor="nuvei-name"
                  className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  Nombres y Apellidos *
                </label>
                <input
                  id="nuvei-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Nombre completo"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (formErrors.nombre)
                      setFormErrors({ ...formErrors, nombre: "" });
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                    formErrors.nombre
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 focus:border-[#C800A1]"
                  }`}
                />
                {formErrors.nombre && (
                  <p className="text-red-500 text-xs">{formErrors.nombre}</p>
                )}
              </div>

              {/* Cédula */}
              <div className="space-y-1">
                <label
                  htmlFor="nuvei-cedula"
                  className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-gray-400" />
                  Cédula de Identidad *
                </label>
                <input
                  id="nuvei-cedula"
                  name="cedula"
                  type="text"
                  autoComplete="off"
                  placeholder="1710000000"
                  value={cedula}
                  onChange={(e) => {
                    setCedula(e.target.value.replace(/\D/g, ""));
                    if (formErrors.cedula)
                      setFormErrors({ ...formErrors, cedula: "" });
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                    formErrors.cedula
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 focus:border-[#C800A1]"
                  }`}
                />
                {formErrors.cedula && (
                  <p className="text-red-500 text-xs">{formErrors.cedula}</p>
                )}
              </div>
            </div>

            {/* Campo Gestor de la Donación */}
            <div className="pt-2">
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5">
                <label className="text-xs font-extrabold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  Gestor de la Donación
                </label>
                <input
                  type="text"
                  placeholder="Nombre de la persona que gestionó la donación (Ej: María Gómez / Voluntario)"
                  value={gestorDonacion}
                  onChange={(e) => setGestorDonacion(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-purple-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                />
                <p className="text-[11px] text-purple-700">
                  Opcional: nombre de la persona que promovió o gestionó esta suscripción.
                </p>
              </div>
            </div>
          </div>

          {/* Botón de Continuar a Tarjeta */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={handleContinueToCard}
            className="w-full py-4 px-6 rounded-2xl shadow-xl text-lg font-bold text-white bg-gradient-to-r from-[#C800A1] to-[#a00081] hover:shadow-pink-500/30 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <span>Continuar con Datos de Tarjeta</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* PASO 2: DATOS DE LA TARJETA (NUVEI TOKENIZE) */}
      {/* ─────────────────────────────────────────────────────────── */}
      {isFormReadyForCard && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {/* Resumen de los Datos Confirmados */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Resumen de la Donación
              </span>
              <button
                type="button"
                onClick={handleBackToData}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#C800A1] hover:text-[#aa028a] hover:underline"
              >
                <Edit2 className="w-3 h-3" />
                Modificar datos
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-[11px] text-gray-500 uppercase font-semibold">
                  Monto Mensual
                </p>
                <p className="font-extrabold text-[#C800A1] text-base">
                  ${monto} USD/mes
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 uppercase font-semibold">
                  Donante
                </p>
                <p className="font-bold text-gray-800 truncate">{nombre}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 uppercase font-semibold">
                  Cédula / Identificación
                </p>
                <p className="font-bold text-gray-800">{cedula}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 uppercase font-semibold">
                  Correo Electrónico
                </p>
                <p className="font-bold text-gray-800 truncate">{inputEmail}</p>
              </div>
            </div>

            {gestorDonacion && (
              <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-purple-700 font-medium">
                Gestor asignado:{" "}
                <span className="font-bold">{gestorDonacion}</span>
              </div>
            )}
          </div>

          {/* Contenedor del Formulario Seguro de Nuvei Tokenize */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#2F3388] uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C800A1]" />
                Ingresa los Datos de tu Tarjeta
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-gray-400 uppercase">
                  Encriptado por
                </span>
                <Image
                  src="/payment-logos/nuvei-logo.png"
                  alt="Nuvei"
                  width={70}
                  height={22}
                  className="h-5 w-auto object-contain"
                />
              </div>
            </div>

            {/* Marco interactivo de tokenización Nuvei */}
            <div className="relative">
              <div
                id="tokenize_nuvei_recurring"
                className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-inner min-h-[260px] flex items-center justify-center"
              >
                {!tokenizeSdkReady && (
                  <div className="flex flex-col items-center gap-2 text-gray-400 text-sm">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#C800A1]" />
                    <span>Cargando pasarela segura de Nuvei...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mensaje de Estado / Error inline */}
          {message && !txResult && (
            <div
              className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-3 ${
                status === "processing" || status === "loading"
                  ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                  : status === "error"
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-green-50 text-green-800 border-green-200"
              }`}
            >
              {status === "processing" || status === "loading" ? (
                <RefreshCw className="w-5 h-5 animate-spin text-yellow-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <p>{message}</p>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={handlePay}
              disabled={
                status === "loading" ||
                status === "processing" ||
                !tokenizeSdkReady
              }
              className={`w-full py-4 px-6 rounded-2xl shadow-xl text-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                status === "loading" || status === "processing" || !tokenizeSdkReady
                  ? "bg-gray-400 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-[#C800A1] to-[#a00081] hover:shadow-pink-500/30"
              }`}
            >
              {status === "loading" || status === "processing" ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Procesando tarjeta con Nuvei...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Guardar Tarjeta y Suscribirme (${monto} USD/mes)</span>
                </div>
              )}
            </motion.button>

            <button
              type="button"
              onClick={handleBackToData}
              disabled={status === "loading" || status === "processing"}
              className="w-full py-2.5 px-4 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a modificar datos personales</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Modal de Resultado (Éxito / Error) */}
      <AnimatePresence>
        {txResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              <div
                className={`h-3 w-full ${
                  txResult.status === "success" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <div className="p-8 text-center flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${
                    txResult.status === "success"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {txResult.status === "success" ? (
                    <CheckCircle className="w-12 h-12" />
                  ) : (
                    <AlertCircle className="w-12 h-12" />
                  )}
                </div>

                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                  {txResult.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {txResult.message}
                </p>

                {gestorDonacion && txResult.status === "success" && (
                  <div className="bg-purple-50 text-purple-700 text-xs px-3 py-1.5 rounded-full font-semibold mb-6 border border-purple-200">
                    Gestor: {gestorDonacion}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setTxResult(null);
                    setStatus("idle");
                    setMessage("");
                    if (txResult.status === "success") {
                      setIsFormReadyForCard(false);
                    }
                  }}
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition ${
                    txResult.status === "success"
                      ? "bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20"
                      : "bg-gray-800 hover:bg-gray-900"
                  }`}
                >
                  {txResult.status === "success"
                    ? "Aceptar y Continuar"
                    : "Intentar de Nuevo"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
