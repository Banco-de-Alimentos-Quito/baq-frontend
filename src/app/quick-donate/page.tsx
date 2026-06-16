"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CitySelector } from "../donacion/mensual/components/CitySelector";
import {
  BANK_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
} from "../donacion/mensual/constants/formOptions";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, CheckCircle } from "lucide-react";
import { CedulaValidator } from "../donacion/mensual/validators/documentValidators";
import { useFormStore } from "../store/formStore";
import { DonationService } from "../donacion/mensual/services/donationService";

const PRESET_AMOUNTS = [2, 10, 30, 50];

function QuickDonateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Local state for form fields
  const [monto, setMonto] = useState<number>(10);
  const [customMonto, setCustomMonto] = useState<string>("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nombre, setNombre] = useState("");

  // New bank fields
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

    // Validate Cedula using the robust algorithm
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

    // Validate Address (New)
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
      // Construct payload for API
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
        estatus_kyc: "Not Started",
        gestor_donacion: "BAQ",
      };

      // 1. First, register the donation data
      await DonationService.submitQuickDonation(payload as any);

      // 2. Submit the images
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
          // Attempt to extract the JSON message part
          const messagePart = errorMsg.split("message: ")[1];
          if (messagePart) {
            const errorJson = JSON.parse(messagePart);
            if (errorJson.message === "donator has been register previously") {
              setConflictMessage(errorJson.message);
              setShowConflictModal(true);
              setLoading(false);
              return;
            }
            // Handle other 409s differently or generically if needed, but per request:
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
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden relative z-10 border border-white/50 backdrop-blur-xl my-8"
      >
        <div className="bg-[#FF6B35] p-8 text-center relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
          />

          <h1 className="text-3xl font-bold text-white mb-2 relative z-10 font-sans tracking-tight">
            Donación Rápida
          </h1>
          <p className="text-orange-50 text-sm font-medium tracking-normal opacity-90 relative z-10">
            Tu ayuda llega a quienes más lo necesitan
          </p>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Amount Selector */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 pl-1">
                    Selecciona el monto
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleAmountSelect(amt)}
                        className={`py-2 px-1 rounded-xl font-bold text-lg transition-all duration-200 ${
                          monto === amt && !customMonto
                            ? "bg-[#FF6B35] text-white shadow-lg scale-105"
                            : "bg-gray-50 text-gray-600 hover:bg-orange-50 border border-transparent hover:border-orange-200"
                        }`}
                      >
                        ${amt}
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
                      placeholder="Otro monto"
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
                          : "border-gray-100 focus:border-orange-300"
                      }`}
                    />
                  </div>
                  {errors.monto && (
                    <p className="text-red-500 text-xs pl-1">{errors.monto}</p>
                  )}
                </div>

                <div className="h-px bg-gray-100 my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cédula */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 pl-1 uppercase tracking-wide">
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
                            : "border-gray-100 focus:border-blue-300"
                        }`}
                      />
                      {isCedulaValid && !errors.cedula && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="bg-[#22c55e] rounded-full p-0.5">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.cedula && (
                      <p className="text-red-500 text-xs pl-1">
                        {errors.cedula}
                      </p>
                    )}
                  </div>

                  {/* Correo */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 pl-1 uppercase tracking-wide">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.email
                          ? "border-red-300 bg-red-50"
                          : "border-gray-100 focus:border-blue-300"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs pl-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-[#2F3388] uppercase tracking-wider border-b pb-2">
                    Información Bancaria
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 pl-1 uppercase tracking-wide">
                        Banco *
                      </label>
                      <div className="relative">
                        <select
                          value={banco}
                          onChange={(e) => setBanco(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-300 transition-colors appearance-none cursor-pointer"
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
                      <label className="text-xs font-bold text-gray-500 pl-1 uppercase tracking-wide">
                        Tipo de Cuenta *
                      </label>
                      <div className="flex bg-gray-50 p-1 rounded-xl border-2 border-gray-100">
                        {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setTipoCuenta(opt.value)}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                              tipoCuenta === opt.value
                                ? "bg-white text-[#FF6B35] shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 pl-1 uppercase tracking-wide">
                      Número de Cuenta *
                    </label>
                    <input
                      type="text"
                      placeholder="0000000000"
                      value={cuenta}
                      onChange={(e) => {
                        setCuenta(e.target.value.replace(/\D/g, ""));
                        if (errors.cuenta) setErrors({ ...errors, cuenta: "" });
                      }}
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.cuenta
                          ? "border-red-300 bg-red-50"
                          : "border-gray-100 focus:border-blue-300"
                      }`}
                    />
                    {errors.cuenta && (
                      <p className="text-red-500 text-xs pl-1">
                        {errors.cuenta}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 pl-1 uppercase tracking-wide">
                      Celular (Opcional)
                    </label>
                    <input
                      type="tel"
                      placeholder="099..."
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-300 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 pl-1 uppercase tracking-wide">
                      Nombres y Apellidos *
                    </label>
                    <input
                      type="text"
                      placeholder="Tu nombre completo"
                      value={nombre}
                      onChange={(e) => {
                        setNombre(e.target.value);
                        if (errors.nombre) setErrors({ ...errors, nombre: "" });
                      }}
                      className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.nombre
                          ? "border-red-300 bg-red-50"
                          : "border-gray-100 focus:border-blue-300"
                      }`}
                    />
                    {errors.nombre && (
                      <p className="text-red-500 text-xs pl-1">
                        {errors.nombre}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address Details - Required for Contract */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-[#2F3388] uppercase tracking-wider border-b pb-2">
                    Dirección
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 pl-1 uppercase tracking-wide">
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
                        <p className="text-red-500 text-xs pl-1">
                          {errors.ciudad}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 pl-1 uppercase tracking-wide">
                        Dirección Completa *
                      </label>
                      <input
                        type="text"
                        placeholder="Av. Amazonas y..."
                        value={direccion}
                        onChange={(e) => {
                          setDireccion(e.target.value);
                          if (errors.direccion)
                            setErrors({ ...errors, direccion: "" });
                        }}
                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                          errors.direccion
                            ? "border-red-300 bg-red-50"
                            : "border-gray-100 focus:border-blue-300"
                        }`}
                      />
                      {errors.direccion && (
                        <p className="text-red-500 text-xs pl-1">
                          {errors.direccion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* File Uploads */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-[#2F3388] uppercase tracking-wider border-b pb-2">
                    Fotos de Cédula
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Frontal */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 pl-1 uppercase tracking-wide">
                        Parte Frontal *
                      </label>
                      <div
                        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all ${
                          cedulaFile
                            ? "border-green-400 bg-green-50"
                            : errors.archivo_cedula
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-blue-400"
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
                              alt="Cedula Frontal"
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
                          <div className="flex flex-col items-center text-gray-400 gap-2">
                            <Upload className="w-8 h-8" />
                            <span className="text-sm font-medium">
                              Click para subir foto
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

                    {/* Trasera */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 pl-1 uppercase tracking-wide">
                        Parte Trasera *
                      </label>
                      <div
                        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all ${
                          cedulaFileBack
                            ? "border-green-400 bg-green-50"
                            : errors.archivo_cedula_trasera
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-blue-400"
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
                              alt="Cedula Trasera"
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
                          <div className="flex flex-col items-center text-gray-400 gap-2">
                            <Upload className="w-8 h-8" />
                            <span className="text-sm font-medium">
                              Click para subir foto
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

                {errors.form && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200 flex items-start gap-3">
                    <p>{errors.form}</p>
                  </div>
                )}

                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 25px -5px rgba(255, 107, 53, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !isFormValid}
                  className={`w-full py-4 px-6 rounded-2xl shadow-xl text-lg font-bold text-white transition-all duration-300 mt-4 ${
                    loading || !isFormValid
                      ? "bg-gray-300 cursor-not-allowed shadow-none"
                      : "bg-[#FF6B35]"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    <span>Donar ${monto} Ahora</span>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-8"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-[#2F3388]">
                  ¡Gracias por tu donación!
                </h2>
                <p className="text-gray-600">
                  Tus datos han sido registrados correctamente.
                  <br />
                  Por favor completa el pago.
                </p>

                <div className="flex flex-col gap-4 pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/")}
                    className="w-full py-4 px-6 rounded-xl border-2 border-[#2F3388] bg-blue-50 text-[#2F3388] font-bold text-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Regresar</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

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
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Atención
                </h3>
                <p className="text-gray-600 mb-6">{conflictMessage}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConflictModal(false)}
                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                  >
                    Cerrar
                  </button>
                  {!(
                    conflictMessage.toLowerCase().includes("registr") ||
                    conflictMessage.toLowerCase().includes("register")
                  ) && (
                    <button
                      onClick={() => {
                        setShowConflictModal(false);
                        setIsSubmitted(true);
                      }}
                      className="flex-1 py-3 px-4 bg-[#FF6B35] hover:bg-[#ff8c42] text-white font-bold rounded-xl transition-colors"
                    >
                      Generar Contrato
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function QuickDonatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      }
    >
      <QuickDonateContent />
    </Suspense>
  );
}
