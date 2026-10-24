"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CitySelector } from "../../donacion/mensual/components/CitySelector";
import {
  BANK_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
} from "../../donacion/mensual/constants/formOptions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  CheckCircle,
  Building2,
  UserCheck,
  CreditCard,
  MapPin,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { CedulaValidator } from "../../donacion/mensual/validators/documentValidators";
import { useFormStore } from "../../store/formStore";
import { DonationService } from "../../donacion/mensual/services/donationService";

const PRESET_AMOUNTS = [2, 10, 30, 50];

interface DebitoBancarioSectionProps {
  initialMonto?: number;
}

export function DebitoBancarioSection({ initialMonto = 10 }: DebitoBancarioSectionProps) {
  const router = useRouter();

  // Local state for form fields
  const [monto, setMonto] = useState<number>(initialMonto);
  const [customMonto, setCustomMonto] = useState<string>("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nombre, setNombre] = useState("");

  // Bank fields
  const [banco, setBanco] = useState(BANK_OPTIONS[0].value);
  const [cuenta, setCuenta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState(ACCOUNT_TYPE_OPTIONS[0].value);

  // Address fields for Contract
  const [ciudad, setCiudad] = useState("Quito");
  const [direccion, setDireccion] = useState("");

  // ID and file fields
  const [cedula, setCedula] = useState("");
  const [cedulaFile, setCedulaFile] = useState<File | null>(null);
  const [cedulaPreview, setCedulaPreview] = useState<string | null>(null);
  const [cedulaFileBack, setCedulaFileBack] = useState<File | null>(null);
  const [cedulaPreviewBack, setCedulaPreviewBack] = useState<string | null>(null);

  // NEW FIELD: Gestor de la Donación
  const [gestorDonacion, setGestorDonacion] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationTouched, setValidationTouched] = useState<
    Record<string, boolean>
  >({});
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Modal State
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictMessage, setConflictMessage] = useState("");

  // Store actions
  const setFormField = useFormStore((state) => state.setFormField);
  const initUser = useFormStore((state) => state.initUser);

  useEffect(() => {
    initUser();
  }, [initUser]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate Cedula using CedulaValidator
    const cedulaValidator = new CedulaValidator();
    if (!cedula) {
      newErrors.cedula = "La cédula es requerida";
    } else if (!cedulaValidator.validate(cedula)) {
      newErrors.cedula = "La cédula no es válida";
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "El correo es requerido";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Correo inválido";
    }

    // Validate Name
    if (!nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    // Validate Amount
    if (monto < 1) {
      newErrors.monto = "El monto mínimo es $1.00";
    }

    // Validate Bank Details
    if (!cuenta) {
      newErrors.cuenta = "El número de cuenta es requerido";
    }
    if (!banco) {
      newErrors.banco = "El banco es requerido";
    }

    // Validate Address
    if (!ciudad) {
      newErrors.ciudad = "La ciudad es requerida";
    }
    if (!direccion) {
      newErrors.direccion = "La dirección es requerida";
    }

    // Validate File
    if (!cedulaFile) {
      newErrors.archivo_cedula = "La foto frontal de la cédula es requerida";
    }
    if (!cedulaFileBack) {
      newErrors.archivo_cedula_trasera =
        "La foto trasera de la cédula es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Construct payload for API with the new Gestor de Donación field
      const payload = {
        cedula_ruc: cedula,
        nombres_completos: nombre,
        numero_telefono: phone || "0999999999",
        correo_electronico: email,
        direccion: direccion,
        numero_cuenta: cuenta,
        tipo_cuenta: tipoCuenta as "Ahorros" | "Corriente",
        banco_cooperativa: banco,
        monto_donar: monto,
        acepta_aporte_voluntario: true,
        acepta_tratamiento_datos: true,
        ciudad: ciudad,
        requiere_factura: false,
        estatus_kyc: "Approved",
        gestor_donacion: gestorDonacion.trim() || "BAQ",
        via_donacion: "donacion rapida 4 formas",
      };

      // 1. Register donation data
      await DonationService.submitQuickDonation(payload as any);

      // 2. Submit front and back images
      if (cedulaFile) {
        await DonationService.submitImage(cedula, cedulaFile);
      }
      if (cedulaFileBack) {
        await DonationService.submitImage(cedula, cedulaFileBack);
      }

      // Save to store for Payphone if needed
      setFormField("identificacion", cedula);
      setFormField("email", email);
      setFormField("phone", phone);
      setFormField("monto", monto.toString());
      setFormField("banco", banco);
      setFormField("cuenta", cuenta);
      setFormField("tipoCuenta", tipoCuenta);

      setLoading(false);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);

      let errorMsg = err.message || "Ocurrió un error al procesar la donación.";

      // Check for 409 Conflict
      if (typeof errorMsg === "string" && errorMsg.includes("status: 409")) {
        try {
          const messagePart = errorMsg.split("message: ")[1];
          if (messagePart) {
            const errorJson = JSON.parse(messagePart);
            if (errorJson.message === "donator has been register previously") {
              setConflictMessage(errorJson.message);
              setShowConflictModal(true);
              setLoading(false);
              return;
            }
            if (errorJson.statusCode === 409) {
              setConflictMessage(
                errorJson.message || "Error al registrar donante.",
              );
              setShowConflictModal(true);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn("Could not parse error JSON", e);
        }
      }

      setErrors({
        form: errorMsg,
      });
      setLoading(false);
    }
  };

  const isCedulaValid = useMemo(() => {
    if (!cedula) return false;
    return new CedulaValidator().validate(cedula);
  }, [cedula]);

  const isFormValid = useMemo(() => {
    return (
      cedula &&
      email &&
      nombre.trim() !== "" &&
      monto >= 1 &&
      cuenta &&
      banco &&
      ciudad &&
      direccion &&
      cedulaFile &&
      cedulaFileBack
    );
  }, [cedula, email, nombre, monto, cuenta, banco, ciudad, direccion, cedulaFile, cedulaFileBack]);

  return (
    <div className="w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#FF6B35] to-[#f9824f] p-6 sm:p-8 text-center relative overflow-hidden rounded-2xl shadow-lg mb-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold mb-3 border border-white/25">
          <Building2 className="w-3.5 h-3.5" />
          Débito Directo a Cuenta
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Donación Recurrente por Débito Bancario
        </h2>
        <p className="text-orange-100 text-sm max-w-xl mx-auto">
          Débito mensual automatizado desde cualquier cuenta de ahorros o corriente de Ecuador.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Amount Selector */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <label className="block text-sm font-bold text-gray-800">
                1. Selecciona el Monto Mensual
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleAmountSelect(amt)}
                    className={`py-3 px-2 rounded-xl font-bold text-lg transition-all duration-200 border ${
                      monto === amt && !customMonto
                        ? "bg-[#FF6B35] text-white border-[#FF6B35] shadow-md shadow-orange-500/20 scale-102"
                        : "bg-gray-50 text-gray-700 hover:bg-orange-50/70 border-gray-200"
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
                  placeholder="Otro monto personalizado"
                  value={customMonto}
                  onChange={handleCustomAmountChange}
                  onBlur={() => {
                    if (customMonto) {
                      const parsed = parseFloat(customMonto);
                      if (!isNaN(parsed)) {
                        const rounded = Math.floor(parsed * 100) / 100;
                        setCustomMonto(
                          rounded % 1 === 0
                            ? rounded.toFixed(0)
                            : rounded.toFixed(2),
                        );
                        setMonto(Number(rounded.toFixed(2)));
                      }
                    }
                  }}
                  className={`w-full pl-8 pr-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all font-bold text-gray-700 ${
                    customMonto
                      ? "border-[#FF6B35] bg-white ring-2 ring-orange-100"
                      : "border-gray-200 focus:border-[#FF6B35]"
                  }`}
                />
              </div>
              {errors.monto && (
                <p className="text-red-500 text-xs font-medium">{errors.monto}</p>
              )}
            </div>

            {/* Donor Personal Data */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#2F3388] uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                <UserCheck className="w-4 h-4 text-[#FF6B35]" />
                2. Datos del Donante
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cédula */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Cédula de Identidad *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0000000000"
                      value={cedula}
                      onChange={(e) => {
                        setCedula(e.target.value.replace(/\D/g, ""));
                        if (errors.cedula) setErrors({ ...errors, cedula: "" });
                      }}
                      onBlur={() => {
                        if (cedula && !isCedulaValid) {
                          setErrors((prev) => ({ ...prev, cedula: "La cédula no es válida" }));
                        }
                      }}
                      className={`w-full px-4 py-3 pr-10 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.cedula
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 focus:border-[#2F3388]"
                      }`}
                    />
                    {isCedulaValid && !errors.cedula && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="bg-[#22c55e] rounded-full p-0.5">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.cedula && (
                    <p className="text-red-500 text-xs">{errors.cedula}</p>
                  )}
                </div>

                {/* Nombres y Apellidos */}
                <div className="space-y-1">
                  <label htmlFor="debito-nombre" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Nombres y Apellidos *
                  </label>
                  <input
                    id="debito-nombre"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Nombre completo"
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      if (errors.nombre) setErrors({ ...errors, nombre: "" });
                    }}
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                      errors.nombre
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 focus:border-[#2F3388]"
                    }`}
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-xs">{errors.nombre}</p>
                  )}
                </div>

                {/* Correo */}
                <div className="space-y-1">
                  <label htmlFor="debito-email" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Correo Electrónico *
                  </label>
                  <input
                    id="debito-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 focus:border-[#2F3388]"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs">{errors.email}</p>
                  )}
                </div>

                {/* Celular */}
                <div className="space-y-1">
                  <label htmlFor="debito-phone" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Celular (Opcional)
                  </label>
                  <input
                    id="debito-phone"
                    name="tel"
                    type="tel"
                    autoComplete="tel"
                    placeholder="099..."
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2F3388] transition-colors"
                  />
                </div>
              </div>

              {/* CAMPO SOLICITADO: Gestor de la Donación */}
              <div className="pt-2">
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                  <label className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    Gestor de la Donación
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre de la persona que gestionó la donación (Ej: Juan Pérez / Voluntario)"
                    value={gestorDonacion}
                    onChange={(e) => setGestorDonacion(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-amber-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                  />
                  <p className="text-[11px] text-amber-700">
                    Opcional: ingresa el nombre de la persona o voluntario que gestionó la afiliación de este donante.
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Information */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#2F3388] uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                <CreditCard className="w-4 h-4 text-[#FF6B35]" />
                3. Información de la Cuenta Bancaria
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Banco o Cooperativa *
                  </label>
                  <div className="relative">
                    <select
                      value={banco}
                      onChange={(e) => setBanco(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2F3388] transition-colors appearance-none cursor-pointer text-gray-700 font-medium"
                    >
                      {BANK_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Tipo de Cuenta *
                  </label>
                  <div className="flex bg-gray-50 p-1 rounded-xl border-2 border-gray-200">
                    {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTipoCuenta(opt.value)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                          tipoCuenta === opt.value
                            ? "bg-white text-[#FF6B35] shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Número de Cuenta *
                </label>
                <input
                  type="text"
                  placeholder="Ingresa los dígitos de tu cuenta sin guiones"
                  value={cuenta}
                  onChange={(e) => {
                    setCuenta(e.target.value.replace(/\D/g, ""));
                    if (errors.cuenta) setErrors({ ...errors, cuenta: "" });
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                    errors.cuenta
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 focus:border-[#2F3388]"
                  }`}
                />
                {errors.cuenta && (
                  <p className="text-red-500 text-xs">{errors.cuenta}</p>
                )}
              </div>
            </div>

            {/* Address Details */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#2F3388] uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                <MapPin className="w-4 h-4 text-[#FF6B35]" />
                4. Dirección de Domicilio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Ciudad *
                  </label>
                  <CitySelector
                    label=""
                    name="ciudad"
                    value={ciudad}
                    required
                    error={errors.ciudad}
                    touched={validationTouched.ciudad}
                    onChange={(e) => {
                      setCiudad(e.target.value);
                      if (errors.ciudad)
                        setErrors({ ...errors, ciudad: "" });
                    }}
                    onBlur={() =>
                      setValidationTouched({
                        ...validationTouched,
                        ciudad: true,
                      })
                    }
                  />
                  {errors.ciudad && (
                    <p className="text-red-500 text-xs">{errors.ciudad}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="debito-direccion" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Dirección Completa *
                  </label>
                  <input
                    id="debito-direccion"
                    name="street-address"
                    type="text"
                    autoComplete="street-address"
                    placeholder="Calle principal, número y secundaria"
                    value={direccion}
                    onChange={(e) => {
                      setDireccion(e.target.value);
                      if (errors.direccion)
                        setErrors({ ...errors, direccion: "" });
                    }}
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                      errors.direccion
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 focus:border-[#2F3388]"
                    }`}
                  />
                  {errors.direccion && (
                    <p className="text-red-500 text-xs">{errors.direccion}</p>
                  )}
                </div>
              </div>
            </div>

            {/* File Uploads (Cédula Frontal y Trasera) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#2F3388] uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                <FileText className="w-4 h-4 text-[#FF6B35]" />
                5. Fotos de Cédula de Identidad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frontal */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Parte Frontal *
                  </label>
                  <div
                    className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                      cedulaFile
                        ? "border-green-400 bg-green-50/70"
                        : errors.archivo_cedula
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 bg-gray-50 hover:bg-gray-100/80 hover:border-orange-400"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setCedulaFile(file);
                          setCedulaPreview(URL.createObjectURL(file));
                          if (errors.archivo_cedula)
                            setErrors({ ...errors, archivo_cedula: "" });
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
                    ) : cedulaFile ? (
                      <div className="flex flex-col items-center text-green-600 gap-2">
                        <CheckCircle className="w-8 h-8" />
                        <span className="text-sm font-bold truncate max-w-[150px]">
                          {cedulaFile.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400 gap-2 text-center">
                        <Upload className="w-8 h-8 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Click para subir foto frontal
                        </span>
                        <span className="text-xs text-gray-400">JPG, PNG</span>
                      </div>
                    )}
                  </div>
                  {errors.archivo_cedula && (
                    <p className="text-red-500 text-xs">{errors.archivo_cedula}</p>
                  )}
                </div>

                {/* Trasera */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Parte Trasera *
                  </label>
                  <div
                    className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                      cedulaFileBack
                        ? "border-green-400 bg-green-50/70"
                        : errors.archivo_cedula_trasera
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 bg-gray-50 hover:bg-gray-100/80 hover:border-orange-400"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setCedulaFileBack(file);
                          setCedulaPreviewBack(URL.createObjectURL(file));
                          if (errors.archivo_cedula_trasera)
                            setErrors({
                              ...errors,
                              archivo_cedula_trasera: "",
                            });
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {cedulaPreviewBack ? (
                      <div className="relative w-full h-32">
                        <img
                          src={cedulaPreviewBack}
                          alt="Cédula Trasera"
                          className="w-full h-full object-contain rounded-lg"
                        />
                        <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      </div>
                    ) : cedulaFileBack ? (
                      <div className="flex flex-col items-center text-green-600 gap-2">
                        <CheckCircle className="w-8 h-8" />
                        <span className="text-sm font-bold truncate max-w-[150px]">
                          {cedulaFileBack.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400 gap-2 text-center">
                        <Upload className="w-8 h-8 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Click para subir foto trasera
                        </span>
                        <span className="text-xs text-gray-400">JPG, PNG</span>
                      </div>
                    )}
                  </div>
                  {errors.archivo_cedula_trasera && (
                    <p className="text-red-500 text-xs">
                      {errors.archivo_cedula_trasera}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {errors.form && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <p>{errors.form}</p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full py-4 px-6 rounded-2xl shadow-xl text-lg font-bold text-white transition-all duration-300 ${
                loading || !isFormValid
                  ? "bg-gray-300 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-[#FF6B35] to-[#f85a1e] hover:shadow-orange-500/30"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Registrando Débito Recurrente...</span>
                </div>
              ) : (
                <span>Confirmar Donación Recurrente de ${monto} USD/mes</span>
              )}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center py-10 bg-white rounded-3xl p-8 border border-green-100 shadow-xl"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h2 className="text-3xl font-extrabold text-[#2F3388]">
              ¡Registro de Débito Exitoso!
            </h2>
            <p className="text-gray-600 max-w-md mx-auto text-base">
              La donación recurrente por débito bancario de{" "}
              <strong className="text-gray-900">${monto} USD</strong> al mes ha sido registrada correctamente.
              {gestorDonacion && (
                <span className="block mt-2 text-xs font-semibold text-gray-500 bg-gray-50 py-1 px-3 rounded-full inline-block border">
                  Gestor registrado: {gestorDonacion}
                </span>
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 max-w-md mx-auto">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setCedula("");
                  setNombre("");
                  setEmail("");
                  setCuenta("");
                  setCedulaFile(null);
                  setCedulaPreview(null);
                  setCedulaFileBack(null);
                  setCedulaPreviewBack(null);
                }}
                className="flex-1 py-3.5 px-6 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 transition"
              >
                Registrar Otra
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#2F3388] text-white font-bold hover:bg-[#232669] transition shadow-md"
              >
                Ir al Inicio
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Conflicto (409) */}
      <AnimatePresence>
        {showConflictModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Atención
                </h3>
                <p className="text-gray-600 mb-6 text-sm">{conflictMessage}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConflictModal(false)}
                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
