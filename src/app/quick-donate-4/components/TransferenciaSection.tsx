"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  Upload,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  UserCheck,
  RefreshCw,
  FileText,
  Mail,
  Phone,
  User,
  Fingerprint,
  ArrowRight,
} from "lucide-react";
import { CedulaValidator } from "../../donacion/mensual/validators/documentValidators";

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

const BANK_ORIGIN_OPTIONS = [
  "Banco Pichincha",
  "Banco Guayaquil",
  "Produbanco",
  "Banco del Pacífico",
  "Banco Bolivariano",
  "Banco Internacional",
  "Cooperativa JEP",
  "Cooperativa Policía Nacional",
  "DeUna / Payphone / Otra",
];

export function TransferenciaSection() {
  const [monto, setMonto] = useState<number>(10);
  const [customMonto, setCustomMonto] = useState<string>("");

  const [nombres, setNombres] = useState("");
  const [cedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [bancoOrigen, setBancoOrigen] = useState(BANK_ORIGIN_OPTIONS[0]);
  const [numeroComprobante, setNumeroComprobante] = useState("");
  const [gestorDonacion, setGestorDonacion] = useState("");

  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [comprobantePreview, setComprobantePreview] = useState<string | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
      errs.nombres = "El nombre del donante es requerido";
    }

    if (!cedula.trim()) {
      errs.cedula = "La cédula o RUC es requerida";
    } else if (!new CedulaValidator().validate(cedula.trim())) {
      errs.cedula = "La cédula ingresada no es válida";
    }

    if (monto < 1) {
      errs.monto = "El monto mínimo de donación es $1.00 USD";
    }

    if (!numeroComprobante.trim()) {
      errs.numeroComprobante = "El número de comprobante o referencia es requerido";
    }

    if (!comprobanteFile) {
      errs.comprobante = "Por favor adjunta la foto o captura del comprobante";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validate()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nombres_completos", nombres.trim());
      formData.append("cedula_ruc", cedula.trim());
      formData.append("monto", monto.toString());
      if (correo.trim()) formData.append("correo_electronico", correo.trim());
      if (telefono.trim()) formData.append("numero_telefono", telefono.trim());
      formData.append("numero_comprobante", numeroComprobante.trim());
      formData.append("banco_origen", bancoOrigen);
      formData.append("gestor_donacion", gestorDonacion.trim() || "BAQ");

      if (comprobanteFile) {
        formData.append("file", comprobanteFile);
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/baq";

      const res = await fetch(`${apiUrl}/donaciones/transferencia`, {
        method: "POST",
        body: formData,
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
            "No pudimos registrar tu comprobante en este momento. Por favor, verifica tu conexión o intenta nuevamente en unos minutos.";
        }
        throw new Error(rawMsg);
      }

      setLoading(false);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      let friendlyMsg =
        err?.message ||
        "Ocurrió un error al enviar el comprobante de transferencia.";
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
      setErrorMessage(friendlyMsg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-6 sm:p-8 text-center relative overflow-hidden rounded-2xl shadow-lg mb-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold mb-3 border border-white/25">
          <Building className="w-3.5 h-3.5" />
          Transferencia Bancaria Directa
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Donación por Transferencia Bancaria
        </h2>
        <p className="text-emerald-100 text-sm max-w-xl mx-auto">
          Transfiere desde tu banca móvil o web y sube tu comprobante para verificar tu donación.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <div className="space-y-8">
            {/* Tarjeta de Datos Bancarios Oficiales del BAQ */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white p-6 sm:p-7 rounded-2xl border-2 border-emerald-200/80 shadow-md">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">
                      Cuenta Oficial Banco Pichincha
                    </h3>
                    <p className="text-xs text-emerald-800 font-medium">
                      Fundación de Ayuda Social Banco de Alimentos Quito
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
                  Cta. Corriente
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {/* Número de Cuenta */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200/60 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block">
                      Número de Cuenta Corriente
                    </span>
                    <span className="text-xl font-black text-emerald-900 tracking-wider">
                      2100282579
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("2100282579", "cuenta")}
                    className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition active:scale-95 flex items-center gap-1 text-xs font-semibold"
                    title="Copiar número de cuenta"
                  >
                    {copiedField === "cuenta" ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* RUC */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200/60 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block">
                      RUC Institucional
                    </span>
                    <span className="text-base font-extrabold text-gray-800">
                      1791921429001
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("1791921429001", "ruc")}
                    className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition active:scale-95 flex items-center gap-1 text-xs font-semibold"
                    title="Copiar RUC"
                  >
                    {copiedField === "ruc" ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Beneficiario y Teléfono */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200/60 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block">
                      A nombre de / Beneficiario
                    </span>
                    <span className="text-sm font-bold text-gray-800 block">
                      Banco de Alimentos Quito
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold block mt-0.5">
                      Tel: 0983208675
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("0983208675", "telefono")}
                    className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition"
                    title="Copiar teléfono"
                  >
                    {copiedField === "telefono" ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Correo de confirmación */}
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200/60 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block">
                      Correo para transferencias
                    </span>
                    <span className="text-sm font-bold text-gray-800 block truncate">
                      sostenibilidad@baq.ec
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("sostenibilidad@baq.ec", "correo")}
                    className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition"
                    title="Copiar correo"
                  >
                    {copiedField === "correo" ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Formulario de Registro de Transferencia */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Monto */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <label className="block text-sm font-bold text-gray-800">
                  1. Monto Transferido
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAmountSelect(amt)}
                      className={`py-3 px-2 rounded-xl font-bold text-lg transition-all duration-200 border ${
                        monto === amt && !customMonto
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-102"
                          : "bg-gray-50 text-gray-700 hover:bg-emerald-50/70 border-gray-200"
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
                    placeholder="Otro monto transferido"
                    value={customMonto}
                    onChange={handleCustomAmountChange}
                    className={`w-full pl-8 pr-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all font-bold text-gray-700 ${
                      customMonto
                        ? "border-emerald-600 bg-white ring-2 ring-emerald-100"
                        : "border-gray-200 focus:border-emerald-600"
                    }`}
                  />
                </div>
                {errors.monto && (
                  <p className="text-red-500 text-xs font-medium">{errors.monto}</p>
                )}
              </div>

              {/* Datos del Donante y Transferencia */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#2F3388] uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  2. Datos del Donante y de la Operación
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombres Completos */}
                  <div className="space-y-1">
                    <label htmlFor="transfer-name" className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      Nombres Completos *
                    </label>
                    <input
                      id="transfer-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Nombre de la persona o empresa"
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.nombres
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:border-emerald-600"
                      }`}
                    />
                    {errors.nombres && (
                      <p className="text-red-500 text-xs">{errors.nombres}</p>
                    )}
                  </div>

                  {/* Cédula o RUC */}
                  <div className="space-y-1">
                    <label htmlFor="transfer-cedula" className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                      <Fingerprint className="w-3.5 h-3.5 text-gray-400" />
                      Cédula / RUC *
                    </label>
                    <input
                      id="transfer-cedula"
                      name="cedula"
                      type="text"
                      autoComplete="off"
                      placeholder="1710000000"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.cedula
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:border-emerald-600"
                      }`}
                    />
                    {errors.cedula && (
                      <p className="text-red-500 text-xs">{errors.cedula}</p>
                    )}
                  </div>

                  {/* Correo Electrónico */}
                  <div className="space-y-1">
                    <label htmlFor="transfer-email" className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      Correo Electrónico (Opcional)
                    </label>
                    <input
                      id="transfer-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="donante@ejemplo.com"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors"
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-1">
                    <label htmlFor="transfer-phone" className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      Teléfono / WhatsApp (Opcional)
                    </label>
                    <input
                      id="transfer-phone"
                      name="tel"
                      type="tel"
                      autoComplete="tel"
                      placeholder="099..."
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors"
                    />
                  </div>

                  {/* Banco de Origen */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      Banco Emisor (Desde dónde transferiste)
                    </label>
                    <select
                      value={bancoOrigen}
                      onChange={(e) => setBancoOrigen(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors cursor-pointer text-gray-700 font-medium"
                    >
                      {BANK_ORIGIN_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Número de Comprobante / Referencia */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      Número de Comprobante / Referencia *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 98745210"
                      value={numeroComprobante}
                      onChange={(e) => setNumeroComprobante(e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.numeroComprobante
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:border-emerald-600"
                      }`}
                    />
                    {errors.numeroComprobante && (
                      <p className="text-red-500 text-xs">
                        {errors.numeroComprobante}
                      </p>
                    )}
                  </div>
                </div>

                {/* CAMPO SOLICITADO: Gestor de la Donación */}
                <div className="pt-2">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                    <label className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      Gestor de la Donación
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre de la persona que gestionó la donación (Ej: Carlos Proaño / Voluntario)"
                      value={gestorDonacion}
                      onChange={(e) => setGestorDonacion(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                    <p className="text-[11px] text-emerald-700">
                      Opcional: nombre de la persona que coordinó o recibió esta transferencia.
                    </p>
                  </div>
                </div>
              </div>

              {/* Subida de Comprobante (Bucket de Supabase) */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#2F3388] uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  3. Foto o Captura del Comprobante de Transferencia *
                </h3>

                <div
                  className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                    comprobanteFile
                      ? "border-emerald-500 bg-emerald-50/60"
                      : errors.comprobante
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 bg-gray-50 hover:bg-gray-100/80 hover:border-emerald-400"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setComprobanteFile(file);
                        if (file.type.startsWith("image/")) {
                          setComprobantePreview(URL.createObjectURL(file));
                        } else {
                          setComprobantePreview(null);
                        }
                        if (errors.comprobante) {
                          setErrors({ ...errors, comprobante: "" });
                        }
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  {comprobantePreview ? (
                    <div className="relative w-full max-w-xs h-48 mx-auto">
                      <img
                        src={comprobantePreview}
                        alt="Comprobante de Transferencia"
                        className="w-full h-full object-contain rounded-xl shadow-sm"
                      />
                      <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    </div>
                  ) : comprobanteFile ? (
                    <div className="flex flex-col items-center text-emerald-700 gap-2">
                      <CheckCircle className="w-10 h-10" />
                      <span className="font-bold text-sm">{comprobanteFile.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(comprobanteFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center gap-3 text-gray-500">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Upload className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">
                          Arrastra tu comprobante o haz click aquí
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Formatos aceptados: JPG, PNG, WEBP, PDF (Máx. 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {errors.comprobante && (
                  <p className="text-red-500 text-xs font-medium">
                    {errors.comprobante}
                  </p>
                )}
              </div>

              {errorMessage && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Botón de Envío */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-2xl shadow-xl text-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-emerald-600 to-teal-700 hover:shadow-emerald-600/30"
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Subiendo Comprobante y Registrando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Registrar Donación por Transferencia (${monto} USD)</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </motion.button>
            </form>
          </div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center py-10 bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>

            <h2 className="text-3xl font-extrabold text-[#2F3388]">
              ¡Comprobante de Transferencia Registrado!
            </h2>
            <p className="text-gray-600 max-w-md mx-auto text-base">
              Hemos recibido los datos de tu transferencia por un monto de{" "}
              <strong className="text-gray-900">${monto} USD</strong>. Nuestro equipo validará el comprobante en la cuenta bancaria.
            </p>

            <div className="bg-emerald-50 rounded-2xl p-4 max-w-md mx-auto text-left text-xs text-emerald-900 space-y-1.5 border border-emerald-200">
              <p>
                <strong>Donante:</strong> {nombres} ({cedula})
              </p>
              <p>
                <strong>Comprobante No:</strong> {numeroComprobante}
              </p>
              <p>
                <strong>Banco Origen:</strong> {bancoOrigen}
              </p>
              {gestorDonacion && (
                <p>
                  <strong>Gestor de la Donación:</strong> {gestorDonacion}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 max-w-md mx-auto">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setNombres("");
                  setCedula("");
                  setCorreo("");
                  setTelefono("");
                  setNumeroComprobante("");
                  setComprobanteFile(null);
                  setComprobantePreview(null);
                }}
                className="flex-1 py-3.5 px-6 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 transition"
              >
                Registrar Otra
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition shadow-md"
              >
                Ir al Inicio
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
