"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BANK_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
} from "../../donacion/mensual/constants/formOptions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  CheckCircle,
  ShieldCheck,
  Lock,
  HeartHandshake,
  Calendar,
  Sparkles,
  ArrowRight,
  Truck,
} from "lucide-react";
import { CedulaValidator } from "../../donacion/mensual/validators/documentValidators";
import { EggPresentation, DeliveryFrequency } from "../types/huevo-zen";
import { getPricingOption } from "../constants/pricing";
import { PresentationSelector } from "../components/PresentationSelector";
import { FrequencyPricingCard } from "../components/FrequencyPricingCard";
import { GoogleMapsAddressPicker } from "../components/GoogleMapsAddressPicker";
import { HuevoZenService } from "../services/huevoZenService";

function HuevoZenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Campos específicos de Huevo Zen
  const [presentacion, setPresentacion] = useState<EggPresentation>(30);
  const [entregas, setEntregas] = useState<DeliveryFrequency>(2);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>("");

  // 2. Datos personales y de contacto
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");

  // 3. Datos bancarios
  const [banco, setBanco] = useState(BANK_OPTIONS[0].value);
  const [cuenta, setCuenta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState(ACCOUNT_TYPE_OPTIONS[0].value);

  // 4. Ubicación y Dirección
  const [direccion, setDireccion] = useState("");

  // 5. Archivos de identidad
  const [cedulaFile, setCedulaFile] = useState<File | null>(null);
  const [cedulaPreview, setCedulaPreview] = useState<string | null>(null);
  const [cedulaFileBack, setCedulaFileBack] = useState<File | null>(null);
  const [cedulaPreviewBack, setCedulaPreviewBack] = useState<string | null>(null);

  // 6. Estados de UI y validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationTouched, setValidationTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Modal de Conflicto (409)
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictMessage, setConflictMessage] = useState("");

  // Cálculo de precio dinámico
  const currentPricing = useMemo(() => {
    return getPricingOption(presentacion, entregas);
  }, [presentacion, entregas]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar cédula ecuatoriana
    const cedulaValidator = new CedulaValidator();
    if (!cedula) {
      newErrors.cedula = "La cédula es requerida";
    } else if (!cedulaValidator.validate(cedula)) {
      newErrors.cedula = "La cédula ingresada no es válida";
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "El correo es requerido";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Correo electrónico inválido";
    }

    // Validar nombre
    if (!nombre.trim()) {
      newErrors.nombre = "El nombre y apellido son requeridos";
    }

    // Validar cuenta y banco
    if (!cuenta) {
      newErrors.cuenta = "El número de cuenta es requerido";
    } else if (!/^\d{8,20}$/.test(cuenta)) {
      newErrors.cuenta = "El número de cuenta debe tener entre 8 y 20 dígitos";
    }

    if (!banco) {
      newErrors.banco = "El banco es requerido";
    }

    // Validar dirección
    if (!direccion.trim()) {
      newErrors.direccion = "La dirección detallada es requerida para el envío";
    }

    // Validar fotos de cédula y tamaño máximo (5 MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    if (!cedulaFile) {
      newErrors.archivo_cedula = "La foto frontal de la cédula es requerida";
    } else if (cedulaFile.size > MAX_FILE_SIZE) {
      newErrors.archivo_cedula = `La imagen frontal supera el límite de 5 MB (pesa ${(cedulaFile.size / (1024 * 1024)).toFixed(1)} MB)`;
    }

    if (!cedulaFileBack) {
      newErrors.archivo_cedula_trasera = "La foto trasera de la cédula es requerida";
    } else if (cedulaFileBack.size > MAX_FILE_SIZE) {
      newErrors.archivo_cedula_trasera = `La imagen trasera supera el límite de 5 MB (pesa ${(cedulaFileBack.size / (1024 * 1024)).toFixed(1)} MB)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        cedula_ruc: cedula.trim(),
        nombres_completos: nombre.trim(),
        numero_telefono: phone.trim() || "0999999999",
        correo_electronico: email.trim(),
        direccion: direccion.trim(),
        google_maps_url: googleMapsUrl || undefined,
        banco_cooperativa: banco.trim(),
        numero_cuenta: cuenta.trim(),
        tipo_cuenta: tipoCuenta as "Ahorros" | "Corriente",
        presentacion_unidades: presentacion,
        entregas_al_mes: entregas,
        total_mensual_usd: currentPricing.totalMensual,
        acepta_aporte_voluntario: true,
        acepta_tratamiento_datos: true,
      };

      // 1. Registrar datos de la suscripción
      await HuevoZenService.submitHuevoZen(payload);

      // 2. Subir fotos de comprobante de cédula
      if (cedulaFile) {
        await HuevoZenService.submitImage(cedula, cedulaFile);
      }
      if (cedulaFileBack) {
        await HuevoZenService.submitImage(cedula, cedulaFileBack);
      }

      setLoading(false);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Error procesando suscripción Huevo Zen:", err);

      const errorMsg = err.message || "Ocurrió un error al procesar la suscripción.";

      if (typeof errorMsg === "string" && errorMsg.includes("status: 409")) {
        try {
          const messagePart = errorMsg.split("message: ")[1];
          if (messagePart) {
            const errorJson = JSON.parse(messagePart);
            setConflictMessage(
              errorJson.message || "La cédula o correo ya se encuentran registrados."
            );
            setShowConflictModal(true);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Could not parse error JSON", e);
        }
      }

      setErrors({ form: errorMsg });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-gray-50 pt-28 pb-16 sm:pt-36 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
           onClick={() => router.push('/huevos-zen')}
           className="mb-6 flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:text-green-700 hover:border-green-200 hover:bg-green-50/50 shadow-sm transition-all cursor-pointer w-fit"
        >
           ← Volver a los programas
        </button>
        {/* Modal de Conflicto 409 */}
        <AnimatePresence>
          {showConflictModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100"
              >
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                  Registro Preexistente
                </h3>
                <p className="text-sm text-gray-600 text-center mb-6">
                  {conflictMessage ||
                    "Los datos proporcionados ya se encuentran registrados en nuestro sistema."}
                </p>
                <button
                  onClick={() => setShowConflictModal(false)}
                  className="w-full py-3 bg-[#ED6F1D] hover:bg-orange-600 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Entendido
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pantalla de Confirmación de Éxito */}
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-orange-100 text-center"
          >
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
              ¡Suscripción a Huevo Zen Confirmada!
            </h2>
            <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base mb-6">
              Gracias por unirte, <strong>{nombre}</strong>. Hemos enviado la confirmación y tu contrato de débito bancario en PDF a <strong>{email}</strong>.
            </p>

            {/* Resumen del pedido */}
            <div className="bg-orange-50/60 border border-orange-200 rounded-2xl p-6 text-left max-w-md mx-auto mb-8 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Presentación:</span>
                <span className="font-bold text-gray-900">Cubeta de {presentacion} huevos</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frecuencia:</span>
                <span className="font-bold text-gray-900">{currentPricing.frecuenciaNombre} ({currentPricing.frecuenciaDescripcion})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Huevos al mes:</span>
                <span className="font-bold text-gray-900">{currentPricing.totalHuevosMes} unidades</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dirección de entrega:</span>
                <span className="font-bold text-gray-900 truncate max-w-[200px]">{direccion}</span>
              </div>
              <div className="pt-3 border-t border-orange-200 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-gray-700">Débito mensual:</span>
                <span className="text-2xl font-extrabold text-[#ED6F1D]">
                  ${currentPricing.totalMensual.toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-all cursor-pointer"
              >
                Volver al Inicio
              </button>
            </div>
          </motion.div>
        ) : (
          /* Formulario Principal */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {errors.form && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm">
                  {errors.form}
                </div>
              )}

              {/* SECCIÓN 1: Presentación de Huevos */}
              <PresentationSelector
                selected={presentacion}
                onChange={(pres) => setPresentacion(pres)}
              />

              <hr className="border-gray-100" />

              {/* SECCIÓN 2: Frecuencia y Precio Dinámico */}
              <FrequencyPricingCard
                presentation={presentacion}
                selectedFrequency={entregas}
                onChange={(freq) => setEntregas(freq)}
              />

              <hr className="border-gray-100" />

              {/* SECCIÓN 3: Dirección con Google Maps */}
              <GoogleMapsAddressPicker
                direccion={direccion}
                onDireccionChange={(dir) => {
                  setDireccion(dir);
                  if (errors.direccion) setErrors({ ...errors, direccion: "" });
                }}
                onGoogleMapsUrlChange={(url) => setGoogleMapsUrl(url)}
                error={errors.direccion}
              />

              <hr className="border-gray-100" />

              {/* SECCIÓN 4: Datos Personales */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <span>4. Datos del Suscriptor</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="cedula" className="text-xs font-bold text-gray-600 uppercase">
                      Cédula / RUC *
                    </label>
                    <input
                      id="cedula"
                      name="cedula"
                      type="text"
                      maxLength={13}
                      autoComplete="off"
                      placeholder="1712345678"
                      value={cedula}
                      onChange={(e) => {
                        setCedula(e.target.value.replace(/\D/g, ""));
                        if (errors.cedula) setErrors({ ...errors, cedula: "" });
                      }}
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors text-gray-900 ${
                        errors.cedula
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:border-orange-400"
                      }`}
                    />
                    {errors.cedula && (
                      <p className="text-red-500 text-xs pl-1">{errors.cedula}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="nombre" className="text-xs font-bold text-gray-600 uppercase">
                      Nombres y Apellidos *
                    </label>
                    <input
                      id="nombre"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Tu nombre completo"
                      value={nombre}
                      onChange={(e) => {
                        setNombre(e.target.value);
                        if (errors.nombre) setErrors({ ...errors, nombre: "" });
                      }}
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors text-gray-900 ${
                        errors.nombre
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:border-orange-400"
                      }`}
                    />
                    {errors.nombre && (
                      <p className="text-red-500 text-xs pl-1">{errors.nombre}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-xs font-bold text-gray-600 uppercase">
                      Correo Electrónico *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors text-gray-900 ${
                        errors.email
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:border-orange-400"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs pl-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="telefono" className="text-xs font-bold text-gray-600 uppercase">
                      Teléfono Celular *
                    </label>
                    <input
                      id="telefono"
                      name="tel"
                      type="tel"
                      autoComplete="tel"
                      placeholder="0991234567"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition-colors text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* SECCIÓN 5: Datos Bancarios para Débito */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <span>5. Datos Bancarios para Débito Automático</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 uppercase">
                      Banco o Cooperativa *
                    </label>
                    <select
                      value={banco}
                      onChange={(e) => {
                        setBanco(e.target.value);
                        if (errors.banco) setErrors({ ...errors, banco: "" });
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition-colors text-gray-900 font-medium"
                    >
                      {BANK_OPTIONS.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 uppercase">
                      Tipo de Cuenta *
                    </label>
                    <select
                      value={tipoCuenta}
                      onChange={(e) => setTipoCuenta(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition-colors text-gray-900 font-medium"
                    >
                      {ACCOUNT_TYPE_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 uppercase">
                      Número de Cuenta *
                    </label>
                    <input
                      type="text"
                      placeholder="2200123456"
                      value={cuenta}
                      onChange={(e) => {
                        setCuenta(e.target.value.replace(/\D/g, ""));
                        if (errors.cuenta) setErrors({ ...errors, cuenta: "" });
                      }}
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors text-gray-900 ${
                        errors.cuenta
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:border-orange-400"
                      }`}
                    />
                    {errors.cuenta && (
                      <p className="text-red-500 text-xs pl-1">{errors.cuenta}</p>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* SECCIÓN 6: Fotos de Cédula */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    6. Fotos del Documento de Identidad
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Requeridas para la emisión y validez legal del contrato de autorización de débito.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Foto Frontal */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-600 uppercase">
                        Parte Frontal *
                      </label>
                      <span className="text-[11px] text-gray-400">Máx. 5 MB</span>
                    </div>
                    <div
                      className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all ${
                        cedulaFile
                          ? "border-green-400 bg-green-50/50"
                          : errors.archivo_cedula
                            ? "border-red-300 bg-red-50/50"
                            : "border-gray-300 bg-gray-50 hover:bg-gray-100/80 hover:border-orange-400"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const MAX_SIZE = 5 * 1024 * 1024;
                            if (file.size > MAX_SIZE) {
                              setCedulaFile(null);
                              setCedulaPreview(null);
                              setErrors((prev) => ({
                                ...prev,
                                archivo_cedula: `El archivo pesa ${(file.size / (1024 * 1024)).toFixed(1)} MB. El tamaño máximo permitido es de 5 MB.`,
                              }));
                            } else {
                              setCedulaFile(file);
                              setCedulaPreview(URL.createObjectURL(file));
                              setErrors((prev) => ({ ...prev, archivo_cedula: "" }));
                            }
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {cedulaPreview ? (
                        <div className="relative w-full h-32">
                          <img
                            src={cedulaPreview}
                            alt="Cédula Frontal"
                            className="w-full h-full object-contain rounded-lg"
                          />
                          <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-gray-400 gap-2">
                          <Upload className="w-7 h-7 text-orange-500" />
                          <span className="text-xs font-medium text-gray-600">
                            Subir foto frontal
                          </span>
                        </div>
                      )}
                    </div>
                    {errors.archivo_cedula && (
                      <p className="text-red-500 text-xs pl-1">
                        {errors.archivo_cedula}
                      </p>
                    )}
                  </div>

                  {/* Foto Trasera */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-600 uppercase">
                        Parte Posterior *
                      </label>
                      <span className="text-[11px] text-gray-400">Máx. 5 MB</span>
                    </div>
                    <div
                      className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all ${
                        cedulaFileBack
                          ? "border-green-400 bg-green-50/50"
                          : errors.archivo_cedula_trasera
                            ? "border-red-300 bg-red-50/50"
                            : "border-gray-300 bg-gray-50 hover:bg-gray-100/80 hover:border-orange-400"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const MAX_SIZE = 5 * 1024 * 1024;
                            if (file.size > MAX_SIZE) {
                              setCedulaFileBack(null);
                              setCedulaPreviewBack(null);
                              setErrors((prev) => ({
                                ...prev,
                                archivo_cedula_trasera: `El archivo pesa ${(file.size / (1024 * 1024)).toFixed(1)} MB. El tamaño máximo permitido es de 5 MB.`,
                              }));
                            } else {
                              setCedulaFileBack(file);
                              setCedulaPreviewBack(URL.createObjectURL(file));
                              setErrors((prev) => ({ ...prev, archivo_cedula_trasera: "" }));
                            }
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {cedulaPreviewBack ? (
                        <div className="relative w-full h-32">
                          <img
                            src={cedulaPreviewBack}
                            alt="Cédula Posterior"
                            className="w-full h-full object-contain rounded-lg"
                          />
                          <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-gray-400 gap-2">
                          <Upload className="w-7 h-7 text-orange-500" />
                          <span className="text-xs font-medium text-gray-600">
                            Subir foto posterior
                          </span>
                        </div>
                      )}
                    </div>
                    {errors.archivo_cedula_trasera && (
                      <p className="text-red-500 text-xs pl-1">
                        {errors.archivo_cedula_trasera}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Resumen Final de Débito y Botón de Envío */}
              <div className="pt-4 space-y-4">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-orange-100">
                      Total a debitar mensualmente
                    </div>
                    <div className="text-3xl font-extrabold">
                      ${currentPricing.totalMensual.toFixed(2)}{" "}
                      <span className="text-sm font-normal opacity-90">USD / mes</span>
                    </div>
                    <div className="text-xs text-orange-100 mt-0.5">
                      Cubeta de {presentacion} huevos • {currentPricing.frecuenciaNombre} ({currentPricing.totalHuevosMes} huevos/mes)
                    </div>
                    <div className="text-[11px] text-orange-100/90 mt-1 font-medium">
                      * El cobro se realizará los primeros 5 días de cada mes.
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#ED6F1D] hover:bg-orange-50 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-base"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#ED6F1D] border-t-transparent rounded-full animate-spin" />
                        <span>Procesando...</span>
                      </div>
                    ) : (
                      <>
                        <span>Confirmar Suscripción</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function HuevoZenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-[#ED6F1D] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HuevoZenContent />
    </Suspense>
  );
}
