"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CitySelector } from "../donacion/mensual/components/CitySelector";
import {
  BANK_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
} from "../donacion/mensual/constants/formOptions";
import { motion, AnimatePresence } from "framer-motion";
import { CedulaValidator } from "../donacion/mensual/validators/documentValidators";
import { useFormStore } from "../store/formStore";
import { DonationService } from "../donacion/mensual/services/donationService";

const PRESET_AMOUNTS = [2, 10, 30, 50];

function QuickDonateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  // Local state for form fields
  const [monto, setMonto] = useState<number>(10);
  const [customMonto, setCustomMonto] = useState<string>("");
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nombres, setNombres] = useState("");

  // New bank fields
  const [banco, setBanco] = useState(BANK_OPTIONS[0].value);
  const [cuenta, setCuenta] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState(ACCOUNT_TYPE_OPTIONS[0].value);

  // Address fields for Contract
  const [ciudad, setCiudad] = useState("Quito");
  const [direccion, setDireccion] = useState("");

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
    if (code) {
      setFormField("gestorDonacion", code);
    }
  }, [code, initUser, setFormField]);

  const handleAmountSelect = (amount: number) => {
    setMonto(amount);
    setCustomMonto("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomMonto(val);
    if (val && !isNaN(Number(val))) {
      setMonto(Number(val));
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDownloadContract = async () => {
    if (!validateForm()) {
      setValidationTouched({ ciudad: true });
      return;
    }

    try {
      const payload = {
        cedula_ruc: cedula,
        nombres_completos: nombres || "Donante Rápido",
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
        gestor_donacion: code || "DonacionRapida",
      };

      const blob = await DonationService.downloadContract(payload as any);

      // Create blob link to download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Contrato_Donacion_${cedula}.pdf`);

      // Append to html link element page and click
      document.body.appendChild(link);
      link.click();

      // Clean up and remove the link
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading contract:", error);
      alert(
        "Hubo un error al descargar el contrato. Por favor intente nuevamente.",
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Construct payload for API
      const payload = {
        cedula_ruc: cedula,
        nombres_completos: nombres || "Donante Rápido",
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
        gestor_donacion: code || "DonacionRapida",
        estatus_kyc: "Not Started", // Extra field from image, safe to include or might be ignored if not in interface but let's check interface
      };

      // Call API
      await DonationService.submitRawDonation(payload as any);

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
        <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] p-8 text-center relative overflow-hidden">
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

          {code && (
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
              <span className="text-[10px] font-mono text-white font-bold tracking-wider">
                REF: {code}
              </span>
            </div>
          )}
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
                      type="number"
                      placeholder="Otro monto"
                      value={customMonto}
                      onChange={handleCustomAmountChange}
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
                      Cédula / RUC *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={13}
                        placeholder="0999999999"
                        value={cedula}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setCedula(val);
                          if (errors.cedula)
                            setErrors({ ...errors, cedula: "" });
                        }}
                        className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:outline-none transition-colors ${
                          cedula.length >= 10
                            ? new CedulaValidator().validate(cedula)
                              ? "border-green-400 bg-green-50 focus:border-green-500"
                              : "border-red-300 bg-red-50 focus:border-red-400"
                            : errors.cedula
                              ? "border-red-300 bg-red-50"
                              : "border-gray-100 focus:border-blue-300"
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {cedula.length >= 10 &&
                          (new CedulaValidator().validate(cedula) ? (
                            <svg
                              className="w-5 h-5 text-green-500"
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
                          ) : (
                            <svg
                              className="w-5 h-5 text-red-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          ))}
                      </div>
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
                      Nombre Completo (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Juan Pérez"
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-300 transition-colors"
                    />
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

                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 25px -5px rgba(255, 107, 53, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-2xl shadow-xl text-lg font-bold text-white transition-all duration-300 mt-4 ${
                    loading
                      ? "bg-gray-300 cursor-not-allowed shadow-none"
                      : "bg-gradient-to-r from-[#FF6B35] to-[#F9844A]"
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
                  Por favor descarga tu contrato y completa el pago.
                </p>

                <div className="flex flex-col gap-4 pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadContract}
                    className="w-full py-4 px-6 rounded-xl border-2 border-[#2F3388] bg-blue-50 text-[#2F3388] font-bold text-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Descargar Contrato</span>
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
                  <button
                    onClick={() => {
                      setShowConflictModal(false);
                      setIsSubmitted(true);
                    }}
                    className="flex-1 py-3 px-4 bg-[#FF6B35] hover:bg-[#ff8c42] text-white font-bold rounded-xl transition-colors"
                  >
                    Generar Contrato
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
