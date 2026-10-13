"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Upload,
  RefreshCw,
  Building2,
  ShieldCheck,
  ArrowRight,
  Phone,
  Mail,
  HelpCircle,
  Clock,
  Users,
  Info,
} from "lucide-react";
import {
  MembresiaHuevoZenService,
  VerificacionVoluntarioResponse,
  EstadoSemanaResponse,
} from "./services/membresiaService";

export default function MembresiaHuevoZenPage() {
  // ── Estados del formulario ──
  const [cedula, setCedula] = useState("");
  const [tipoBanco, setTipoBanco] = useState("Banco Pichincha");
  const [otroBanco, setOtroBanco] = useState("");
  const [numeroComprobante, setNumeroComprobante] = useState("");
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ── Estados de validación y carga ──
  const [isValidating, setIsValidating] = useState(false);
  const [verificacion, setVerificacion] =
    useState<VerificacionVoluntarioResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Estado semanal de cupos y apertura (consultado en tiempo real) ──
  const [estadoSemana, setEstadoSemana] = useState<EstadoSemanaResponse | null>(null);
  const [loadingEstado, setLoadingEstado] = useState(true);

  // ── Estado de tooltips activos (para móviles y accesibilidad) ──
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // ── Estados de copiar al portapapeles ──
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Cargar estado real de la semana
  useEffect(() => {
    const fetchEstado = async () => {
      try {
        const est = await MembresiaHuevoZenService.obtenerEstadoSemana();
        setEstadoSemana(est);
      } catch (err) {
        console.error("Error al cargar estado semanal:", err);
      } finally {
        setLoadingEstado(false);
      }
    };
    fetchEstado();
  }, []);

  // ── Lógica real basada en la fecha y cupos del sistema ──
  const diaEsAbierto = estadoSemana?.abierto_por_dia ?? true;
  const limiteCupos = estadoSemana?.limite_cupos ?? 130;
  const cuposEstanAgotados = estadoSemana?.cupos_agotados ?? false;
  const totalInscritos = estadoSemana?.total_inscritos ?? 0;
  const cuposDisponibles =
    estadoSemana?.cupos_disponibles ?? Math.max(0, limiteCupos - totalInscritos);
  const estaAbierto =
    estadoSemana !== null
      ? estadoSemana.abierto
      : diaEsAbierto && !cuposEstanAgotados;

  // ── Validación de la cédula ──
  const handleVerificarCedula = async () => {
    const cleanCedula = cedula.trim();
    if (!cleanCedula) {
      setVerificacion({
        valido: false,
        codigo: "CEDULA_INVALIDA",
        mensaje: "Por favor ingresa un número de cédula.",
      });
      return;
    }

    setIsValidating(true);
    setErrorMessage(null);
    try {
      const res = await MembresiaHuevoZenService.verificarCedula(cleanCedula);
      setVerificacion(res);
    } catch {
      setVerificacion({
        valido: false,
        codigo: "NO_FORMA_PARTE",
        mensaje: "Error de conexión al verificar cédula. Por favor intenta de nuevo.",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // ── Manejo de archivo de comprobante ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setComprobanteFile(file);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setComprobanteFile(file);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  // ── Enviar formulario ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!estaAbierto) {
      setErrorMessage("Las inscripciones no están disponibles en este momento.");
      return;
    }

    if (!verificacion || !verificacion.valido) {
      setErrorMessage("Debes verificar tu cédula de voluntario operativo antes de continuar.");
      return;
    }

    const bancoFinal = tipoBanco === "Otro" ? otroBanco.trim() : tipoBanco;
    if (!bancoFinal) {
      setErrorMessage("Por favor selecciona o escribe el banco del que realizaste la transferencia.");
      return;
    }

    if (!numeroComprobante.trim()) {
      setErrorMessage("Por favor ingresa el número de comprobante.");
      return;
    }

    if (!comprobanteFile) {
      setErrorMessage("Por favor sube la imagen de tu comprobante de pago.");
      return;
    }

    setIsSubmitting(true);
    try {
      await MembresiaHuevoZenService.registrarMembresia(
        cedula,
        bancoFinal,
        numeroComprobante,
        comprobanteFile
      );
      setSubmitSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Ocurrió un error al registrar la membresía.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCedula("");
    setNumeroComprobante("");
    setComprobanteFile(null);
    setPreviewUrl(null);
    setVerificacion(null);
    setSubmitSuccess(false);
    setErrorMessage(null);
  };

  return (
    <div className="w-full min-h-screen relative bg-slate-50 text-slate-800 font-sans overflow-x-hidden pt-6 pb-12">
      {/* Fondo luminoso y limpio con sutil degradado institucional */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/40 via-white to-slate-100/80 pointer-events-none" />

      {/* CONTENEDOR PRINCIPAL TIPO CARD (Estilo Nuvei) */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 animate-in fade-in duration-300">
          
          {/* ── CABECERA CENTRADA: LOGOS + TÍTULO ── */}
          <div className="flex flex-col items-center text-center space-y-3 mb-5">
            <div className="flex items-center justify-center gap-4 py-1">
              <Link href="/" className="hover:opacity-90 transition-opacity">
                <Image
                  src="/logo2.png"
                  alt="Banco de Alimentos Quito"
                  width={110}
                  height={42}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>
              <div className="h-6 w-px bg-gray-200" />
              <Link href="/huevos-zen" className="hover:opacity-90 transition-opacity">
                <Image
                  src="/huevos-zen-logo.png"
                  alt="Huevos Zen"
                  width={100}
                  height={42}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            <div>
              <span className="inline-block bg-orange-100 text-[#ED6F1D] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                Exclusivo Voluntariado Operativo
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2F3388] tracking-tight">
                Membresía Huevo Zen
              </h1>
            </div>

            {/* ── INFORMACIÓN DEL PROGRAMA Y CUBETA 12 HUEVOS (REDACTADA CON CLARIDAD) ── */}
            <div className="space-y-2.5 text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
              {/* Objetivo del Programa */}
              <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 text-amber-950 text-left sm:text-center">
                <p className="font-bold text-amber-900 text-xs sm:text-[13px] mb-1 flex items-center justify-center gap-1.5">
                  <span>🥚</span> Objetivo del Programa
                </p>
                <p className="leading-relaxed text-xs text-amber-900/90 font-medium">
                  El valor aportado corresponde a la cubeta de huevos de gallinas libres de jaula. El producto adicional entregado es para consumo inmediato y se otorga en calidad de donación solidaria.
                </p>
              </div>

              {/* Cubeta de 12 Huevos Zen */}
              <p className="text-gray-600 leading-relaxed text-xs text-left sm:text-center px-1">
                <strong className="text-gray-800 font-semibold">Cubeta de 12 Huevos Zen:</strong>{" "}
                Huevos agroecológicos de máxima frescura, 100% libres de jaula y con certificación de bienestar animal. Con cada entrega semanal fortaleces la nutrición infantil a través del Banco de Alimentos Quito.
              </p>
            </div>
          </div>

          {/* ── TÉRMINOS Y CONDICIONES (CON TOOLTIPS / POP-UPS ESTILO NUVEI) ── */}
          <div className="mb-5 bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Términos y Condiciones Importantes
              </span>
              <span className="text-[10px] text-gray-400">Pasa el cursor o toca cada punto</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              
              {/* 1. ¿Qué pasa si no retiran? */}
              <div
                className="bg-white border border-gray-200 p-2.5 rounded-xl relative group cursor-help transition hover:border-amber-400"
                onClick={() => setActiveTooltip(activeTooltip === "no_retiran" ? null : "no_retiran")}
              >
                <div className="flex items-center justify-between text-gray-700 font-semibold text-xs">
                  <span className="truncate">¿Si no retiran?</span>
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                </div>
                {/* Pop-up / Tooltip */}
                <div
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] leading-relaxed rounded-xl z-30 shadow-2xl transition-all pointer-events-none ${
                    activeTooltip === "no_retiran" ? "block opacity-100" : "hidden group-hover:block group-hover:opacity-100"
                  }`}
                >
                  <p className="font-bold text-amber-300 mb-1 border-b border-gray-700 pb-1">
                    Entrega y Retiro
                  </p>
                  <p>
                    Las cubetas deben retirarse en la fecha y horario asignados. Al ser un producto alimenticio perecedero, si no es retirado a tiempo no se acumula ni se garantiza su reserva para semanas posteriores.
                  </p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              </div>

              {/* 2. Valor incompleto */}
              <div
                className="bg-white border border-gray-200 p-2.5 rounded-xl relative group cursor-help transition hover:border-amber-400"
                onClick={() => setActiveTooltip(activeTooltip === "incompleto" ? null : "incompleto")}
              >
                <div className="flex items-center justify-between text-gray-700 font-semibold text-xs">
                  <span className="truncate">Valor incompleto</span>
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                </div>
                {/* Pop-up / Tooltip */}
                <div
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] leading-relaxed rounded-xl z-30 shadow-2xl transition-all pointer-events-none ${
                    activeTooltip === "incompleto" ? "block opacity-100" : "hidden group-hover:block group-hover:opacity-100"
                  }`}
                >
                  <p className="font-bold text-amber-300 mb-1 border-b border-gray-700 pb-1">
                    Valor de Transferencia
                  </p>
                  <p>
                    El comprobante debe coincidir exactamente con el valor establecido. Comprobantes con valores incompletos no garantizan la entrega ni reserva de la cubeta hasta completar el pago total.
                  </p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              </div>

              {/* 3. Producto adicional de consumo inmediato */}
              <div
                className="bg-white border border-gray-200 p-2.5 rounded-xl relative group cursor-help transition hover:border-amber-400"
                onClick={() => setActiveTooltip(activeTooltip === "adicional" ? null : "adicional")}
              >
                <div className="flex items-center justify-between text-gray-700 font-semibold text-xs">
                  <span className="truncate">Producto adicional</span>
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                </div>
                {/* Pop-up / Tooltip */}
                <div
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] leading-relaxed rounded-xl z-30 shadow-2xl transition-all pointer-events-none ${
                    activeTooltip === "adicional" ? "block opacity-100" : "hidden group-hover:block group-hover:opacity-100"
                  }`}
                >
                  <p className="font-bold text-amber-300 mb-1 border-b border-gray-700 pb-1">
                    Producto Adicional Donado
                  </p>
                  <p>
                    El producto adicional es de consumo inmediato y es donado, por lo que no garantiza reposición bajo ninguna circunstancia.
                  </p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              </div>

              {/* 4. Disponible solo de Jueves a Domingo */}
              <div
                className="bg-white border border-gray-200 p-2.5 rounded-xl relative group cursor-help transition hover:border-amber-400"
                onClick={() => setActiveTooltip(activeTooltip === "horario" ? null : "horario")}
              >
                <div className="flex items-center justify-between text-gray-700 font-semibold text-xs">
                  <span className="truncate">Jueves a Domingo</span>
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                </div>
                {/* Pop-up / Tooltip */}
                <div
                  className={`absolute bottom-full right-0 sm:left-1/2 sm:-translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] leading-relaxed rounded-xl z-30 shadow-2xl transition-all pointer-events-none ${
                    activeTooltip === "horario" ? "block opacity-100" : "hidden group-hover:block group-hover:opacity-100"
                  }`}
                >
                  <p className="font-bold text-amber-300 mb-1 border-b border-gray-700 pb-1">
                    Días Habilitados
                  </p>
                  <p>
                    Disponible exclusivamente de <strong>Jueves a Domingo</strong> (o hasta agotar los cupos semanales). No se aceptan registros fuera de estos días.
                  </p>
                  <div className="absolute top-full right-4 sm:left-1/2 sm:-translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              </div>

            </div>
          </div>

          {/* ── DATOS BANCARIOS COMPACTOS ── */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 mb-5 text-xs text-emerald-950">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Datos para Depósito o Transferencia
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-xs">
              <p>
                <span className="font-bold text-gray-700">Banco:</span> Banco Pichincha
              </p>
              <div className="flex items-center justify-between">
                <p>
                  <span className="font-bold text-gray-700">Cuenta:</span>{" "}
                  <span className="font-mono font-bold text-emerald-900">2100282579</span> (Cta. Corriente)
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy("2100282579", "cta")}
                  className="p-1 text-emerald-700 hover:text-emerald-900 rounded hover:bg-emerald-100 transition"
                  title="Copiar cuenta"
                >
                  {copiedKey === "cta" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p>
                  <span className="font-bold text-gray-700">RUC:</span>{" "}
                  <span className="font-mono font-bold text-gray-900">1791921429001</span>
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy("1791921429001", "ruc")}
                  className="p-1 text-emerald-700 hover:text-emerald-900 rounded hover:bg-emerald-100 transition"
                  title="Copiar RUC"
                >
                  {copiedKey === "ruc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p>
                <span className="font-bold text-gray-700">A nombre de:</span> Banco de Alimentos Quito
              </p>
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span className="font-bold text-gray-700">Teléfono:</span>{" "}
                  <a href="tel:0987954289" className="hover:underline font-mono text-emerald-950 font-semibold">
                    0987954289
                  </a>
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy("0987954289", "tel")}
                  className="p-1 text-emerald-700 hover:text-emerald-900 rounded hover:bg-emerald-100 transition"
                  title="Copiar teléfono"
                >
                  {copiedKey === "tel" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-emerald-600" />
                <span className="font-bold text-gray-700">Correo:</span> sostenibilidad@baq.ec
              </p>
            </div>
          </div>

          {/* ── BARRA DE DISPONIBILIDAD Y CUPOS (LÍMITE CONFIGURADO A 130) ── */}
          <div className="mb-5 p-3 rounded-2xl border transition-all text-xs flex items-center justify-between bg-blue-50/70 border-blue-200 text-blue-900">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong className="font-bold">Cupos Semanales:</strong>{" "}
                {cuposDisponibles} disponibles de {limiteCupos} cubetas
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
              <Clock className="w-3.5 h-3.5" />
              <span>Jueves a Domingo</span>
            </div>
          </div>

          {/* ── CASO A: BLOQUEO POR DÍA (LUNES A MIÉRCOLES) ── */}
          {!diaEsAbierto && (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl text-center space-y-3 mb-4 animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-amber-900">
                Inscripciones Semanales Cerradas
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 max-w-md mx-auto leading-relaxed">
                El formulario de registro para la cubeta semanal se habilita exclusivamente de <strong>Jueves a Domingo</strong> (o hasta agotar los {limiteCupos} cupos disponibles).
              </p>
              <p className="text-xs text-amber-700 font-medium">
                Próxima apertura: Este Jueves a primera hora.
              </p>
            </div>
          )}

          {/* ── CASO B: BLOQUEO POR CUPOS AGOTADOS ── */}
          {diaEsAbierto && cuposEstanAgotados && (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3 mb-4 animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-rose-900">
                Cupos Agotados para esta Semana
              </h3>
              <p className="text-xs sm:text-sm text-rose-800 max-w-md mx-auto leading-relaxed">
                Se han completado los {limiteCupos} cupos disponibles para la entrega de esta semana. Las primeras {limiteCupos} personas que pagaron serán las primeras en recibir sus cubetas.
              </p>
              <p className="text-xs text-rose-700 font-medium">
                Te esperamos el próximo jueves para la nueva entrega semanal.
              </p>
            </div>
          )}

          {/* ── MODAL DE ENVÍO EXITOSO (Estilo Nuvei) ── */}
          {submitSuccess ? (
            <div className="py-8 text-center flex flex-col items-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-green-50 text-[#8CC541] flex items-center justify-center mb-4 shadow-inner border border-green-200">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-bold text-[#2F3388] mb-2">¡Inscripción Recibida!</h3>
              <p className="text-gray-600 text-sm mb-6 max-w-md leading-relaxed">
                Hemos recibido los datos de tu comprobante. Tu membresía de la Cubeta de 12 Huevos Zen para el voluntariado operativo está en proceso de confirmación.
              </p>

              <div className="w-full max-w-sm bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs space-y-2 text-left mb-6">
                <div className="flex justify-between border-b border-gray-200 pb-1.5">
                  <span className="text-gray-500 font-medium">Voluntario:</span>
                  <span className="font-bold text-gray-800">{verificacion?.nombre}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-1.5">
                  <span className="text-gray-500 font-medium">Cédula:</span>
                  <span className="font-mono font-semibold text-gray-800">{cedula}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-1.5">
                  <span className="text-gray-500 font-medium">Tipo de Banco:</span>
                  <span className="font-semibold text-gray-800">
                    {tipoBanco === "Otro" ? otroBanco : tipoBanco}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">No. Comprobante:</span>
                  <span className="font-mono font-bold text-[#ED6F1D]">{numeroComprobante}</span>
                </div>
              </div>

              <div className="w-full max-w-sm">
                <Link
                  href="/"
                  className="w-full block py-3.5 px-4 bg-[#ED6F1D] hover:bg-[#d85e0f] text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 text-center"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          ) : estaAbierto ? (
            /* ── FORMULARIO ACTIVO (LOS 3 DATOS REQUERIDOS) ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* 1. CÉDULA */}
              <div>
                <label htmlFor="cedula-input" className="block text-xs font-bold text-gray-700 mb-1">
                  1. Cédula de Identidad *
                </label>
                <div className="flex gap-2">
                  <input
                    id="cedula-input"
                    type="text"
                    value={cedula}
                    onChange={(e) => {
                      setCedula(e.target.value);
                      if (verificacion) setVerificacion(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleVerificarCedula();
                      }
                    }}
                    placeholder="Ingresa tu cédula (ej. 1712345678)"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ED6F1D]/40 focus:border-[#ED6F1D] text-sm font-mono transition"
                  />
                  <button
                    id="verificar-cedula-btn"
                    type="button"
                    onClick={handleVerificarCedula}
                    disabled={isValidating || !cedula.trim()}
                    className="px-4 py-2.5 bg-[#2F3388] hover:bg-[#23266b] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {isValidating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verificando...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verificar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* MENSAJES DE EVALUACIÓN DE LA CÉDULA */}
                {verificacion && (
                  <div className="mt-2">
                    {/* No forma parte del BAQ */}
                    {verificacion.codigo === "NO_FORMA_PARTE" && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span><strong>La persona no forma parte del baq</strong></span>
                      </div>
                    )}

                    {/* No es voluntario operativo */}
                    {verificacion.codigo === "NO_ES_OPERATIVO" && (
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span><strong>No es voluntario operativo</strong></span>
                      </div>
                    )}

                    {/* Error de cédula vacía */}
                    {verificacion.codigo === "CEDULA_INVALIDA" && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{verificacion.mensaje}</span>
                      </div>
                    )}

                    {/* Ya registrado */}
                    {verificacion.codigo === "YA_REGISTRADO" && (
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <strong className="block text-amber-900">Membresía previamente registrada</strong>
                          <span>{verificacion.mensaje}</span>
                        </div>
                      </div>
                    )}

                    {/* Confirmado con éxito */}
                    {verificacion.valido && (
                      <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <div>
                          <strong className="block text-green-900">✓ Voluntario Operativo confirmado</strong>
                          <span>Hola, {verificacion.nombre}. Ya puedes completar tu registro.</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. TIPO DE BANCO */}
              <div>
                <label htmlFor="banco-select" className="block text-xs font-bold text-gray-700 mb-1">
                  2. Tipo de Banco (Emisor del pago) *
                </label>
                <select
                  id="banco-select"
                  value={tipoBanco}
                  onChange={(e) => setTipoBanco(e.target.value)}
                  disabled={!verificacion?.valido}
                  className={`w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ED6F1D]/40 focus:border-[#ED6F1D] text-sm text-gray-800 transition ${
                    !verificacion?.valido ? "opacity-50 cursor-not-allowed bg-gray-100" : ""
                  }`}
                >
                  <option value="Banco Pichincha">Banco Pichincha</option>
                  <option value="Banco Guayaquil">Banco Guayaquil</option>
                  <option value="Banco del Pacífico">Banco del Pacífico</option>
                  <option value="Produbanco">Produbanco</option>
                  <option value="Banco Internacional">Banco Internacional</option>
                  <option value="Banco Bolivariano">Banco Bolivariano</option>
                  <option value="Banco de Loja">Banco de Loja</option>
                  <option value="Banco General Rumiñahui">Banco General Rumiñahui</option>
                  <option value="Banco Solidario">Banco Solidario</option>
                  <option value="Cooperativa JEP">Cooperativa JEP</option>
                  <option value="Cooperativa Policía Nacional">Cooperativa Policía Nacional</option>
                  <option value="Cooperativa 29 de Octubre">Cooperativa 29 de Octubre</option>
                  <option value="Cooperativa Alianza del Valle">Cooperativa Alianza del Valle</option>
                  <option value="Cooperativa Andalucía">Cooperativa Andalucía</option>
                  <option value="Cooperativa Oscus">Cooperativa Oscus</option>
                  <option value="Cooperativa Cooprogreso">Cooperativa Cooprogreso</option>
                  <option value="DeUna">DeUna</option>
                  <option value="Otro">Otro Banco / Cooperativa</option>
                </select>

                {tipoBanco === "Otro" && (
                  <input
                    type="text"
                    value={otroBanco}
                    onChange={(e) => setOtroBanco(e.target.value)}
                    disabled={!verificacion?.valido}
                    placeholder="Escribe el nombre de tu banco o cooperativa"
                    className="mt-2 w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ED6F1D]/40 focus:border-[#ED6F1D] text-sm transition"
                  />
                )}
              </div>

              {/* 3. NÚMERO DE COMPROBANTE */}
              <div>
                <label htmlFor="comprobante-input" className="block text-xs font-bold text-gray-700 mb-1">
                  3. Número de Comprobante / Transacción *
                </label>
                <input
                  id="comprobante-input"
                  type="text"
                  value={numeroComprobante}
                  onChange={(e) => setNumeroComprobante(e.target.value)}
                  disabled={!verificacion?.valido}
                  placeholder="Ej. 09182310"
                  className={`w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ED6F1D]/40 focus:border-[#ED6F1D] text-sm font-mono transition ${
                    !verificacion?.valido ? "opacity-50 cursor-not-allowed bg-gray-100" : ""
                  }`}
                />
              </div>

              {/* 4. IMAGEN DEL COMPROBANTE (Estilo Drag & Drop Nuvei) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  4. Comprobante de Transferencia / Depósito *
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => verificacion?.valido && fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center w-full min-h-[90px] border-2 border-dashed rounded-xl p-3 text-center transition ${
                    !verificacion?.valido
                      ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                      : comprobanteFile
                      ? "border-green-400 bg-green-50/50 cursor-pointer"
                      : "border-gray-300 hover:border-[#ED6F1D] bg-gray-50/50 hover:bg-orange-50/30 cursor-pointer"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    id="comprobante-file-input"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    disabled={!verificacion?.valido}
                    className="hidden"
                  />

                  {comprobanteFile ? (
                    <div className="flex items-center gap-3">
                      {previewUrl && (
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-gray-200 shrink-0">
                          <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                        </div>
                      )}
                      <div className="text-left text-xs">
                        <p className="font-bold text-gray-800 truncate max-w-[240px]">{comprobanteFile.name}</p>
                        <p className="text-gray-500">{(comprobanteFile.size / 1024).toFixed(0)} KB · Clic para cambiar</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <p className="text-xs text-gray-600">
                        <span className="font-bold text-[#ED6F1D]">Haz clic para subir</span> o arrastra y suelta tu comprobante
                      </p>
                      <p className="text-[10px] text-gray-400">JPG, PNG, WEBP o PDF (máx. 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ERROR GLOBAL */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* BOTÓN ENVIAR */}
              <div className="pt-2">
                <button
                  id="submit-membresia-btn"
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !verificacion?.valido ||
                    !numeroComprobante.trim() ||
                    !comprobanteFile
                  }
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#ED6F1D] hover:bg-[#d85e0f] transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Registrando comprobante...</span>
                    </>
                  ) : (
                    <>
                      <span>Finalizar Registro de Membresía</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : null}

          {/* ── SECCIÓN DE AYUDA / CONTACTO EN CASO DE ERROR O TURNOS AGOTADOS ── */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-amber-900 font-bold text-xs sm:text-sm">
                <HelpCircle className="w-4 h-4 text-[#ED6F1D] shrink-0" />
                <span>¿Ya hiciste el depósito pero se acabaron los turnos o crees que hubo un error?</span>
              </div>
              <p className="text-amber-800 text-[11px] sm:text-xs leading-relaxed max-w-md mx-auto">
                Si realizaste tu pago a tiempo y no alcanzaste cupo o tuviste algún inconveniente, contáctanos a:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <a
                  href="mailto:jmunoz@baq.ec?subject=Consulta%20Membres%C3%ADa%20Huevo%20Zen"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 hover:border-[#ED6F1D] text-amber-950 hover:text-[#ED6F1D] rounded-xl font-medium text-xs transition shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5 text-[#ED6F1D]" />
                  <span>jmunoz@baq.ec</span>
                </a>
                <a
                  href="mailto:jperdomo@baq.ec?subject=Consulta%20Membres%C3%ADa%20Huevo%20Zen"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 hover:border-[#ED6F1D] text-amber-950 hover:text-[#ED6F1D] rounded-xl font-medium text-xs transition shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5 text-[#ED6F1D]" />
                  <span>jperdomo@baq.ec</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
