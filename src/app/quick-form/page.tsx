"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFormStore } from "@/app/store/formStore";

function QuickFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [asistente, setAsistente] = useState<string>("");
  const [monto, setMonto] = useState<number>(10);
  const [showMontoSelector, setShowMontoSelector] = useState<boolean>(true);
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    cedula: "",
    correo: "",
    banco: "Banco Pichincha",
    tipoCuenta: "Ahorro",
    numeroCuenta: "",
    aceptaTerminos: false,
  });

  const [formErrors, setFormErrors] = useState({
    nombreCompleto: "",
    cedula: "",
    correo: "",
    numeroCuenta: "",
    aceptaTerminos: "",
  });

  useEffect(() => {
    const asistenteParam = searchParams.get("asistente");
    if (asistenteParam) {
      setAsistente(asistenteParam);
      // Guardar el asistente como gestor de donación en el store
      useFormStore.setState({
        gestorDonacion: asistenteParam,
      });
    }
  }, [searchParams]);

  const MONTOS_PREDEFINIDOS = [10, 20, 30, 50];

  const bancos = [
    "Banco Pichincha",
    "Banco del Pacífico",
    "Banco de Guayaquil",
    "Produbanco",
    "Banco Bolivariano",
    "Banco Internacional",
    "Banco del Austro",
    "Banco Solidario",
    "Banco Diners Club",
    "Banco General Rumiñahui",
    "Banco de Loja",
    "Banco Procredit",
    "Banco Capital",
    "Banco Comercial de Manabí",
    "Banco Coopnacional",
    "Banco D-MIRO S.A.",
    "Mutualista Pichincha",
    "Cooperativa JEP",
  ];

  const handleMontoSelect = (valor: number) => {
    setMonto(valor);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Limpiar error al escribir
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      nombreCompleto: "",
      cedula: "",
      correo: "",
      numeroCuenta: "",
      aceptaTerminos: "",
    };

    let isValid = true;

    if (!formData.nombreCompleto.trim()) {
      errors.nombreCompleto = "El nombre completo es requerido";
      isValid = false;
    }

    if (!formData.cedula.trim()) {
      errors.cedula = "El número de cédula es requerido";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.cedula)) {
      errors.cedula = "La cédula debe tener 10 dígitos";
      isValid = false;
    }

    if (!formData.correo.trim()) {
      errors.correo = "El correo electrónico es requerido";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errors.correo = "Ingrese un correo electrónico válido";
      isValid = false;
    }

    if (!formData.numeroCuenta.trim()) {
      errors.numeroCuenta = "El número de cuenta bancaria es requerido";
      isValid = false;
    }

    if (!formData.aceptaTerminos) {
      errors.aceptaTerminos = "Debes aceptar los términos y condiciones";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleContinuar = () => {
    if (showMontoSelector) {
      setShowMontoSelector(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Guardar datos en el store
    useFormStore.setState({
      email: formData.correo,
      phone: "", // No se captura en este formulario
      identificacion: formData.cedula,
      gestorDonacion: asistente || "Asistente",
    });

    // Redirigir a la página de donación mensual con el monto
    router.push(`/donacion/mensual?monto=${monto}&quickForm=true`);
  };

  const handleBack = () => {
    if (!showMontoSelector) {
      setShowMontoSelector(true);
    } else {
      router.back();
    }
  };

  // Verificar si todos los campos obligatorios están completos
  const isFormComplete = () => {
    return (
      formData.nombreCompleto.trim() !== "" &&
      formData.cedula.trim() !== "" &&
      formData.correo.trim() !== "" &&
      formData.banco !== "" &&
      formData.numeroCuenta.trim() !== "" &&
      formData.aceptaTerminos
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-10">

      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {showMontoSelector ? (
          /* Selector de Monto */
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Asistir Donador
            </h1>
            <p className="text-gray-600 mb-1">
              Selecciona el <span className="text-orange-600 font-semibold">monto</span> de la donación:
            </p>
            <p className="text-gray-500 text-sm mb-6">Monto mínimo: $1</p>

            {/* Botones de monto predefinido */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {MONTOS_PREDEFINIDOS.map((valor) => (
                <button
                  key={valor}
                  onClick={() => handleMontoSelect(valor)}
                  className={`p-6 rounded-xl border-2 transition ${
                    monto === valor
                      ? "border-orange-600 bg-orange-50"
                      : "border-gray-200 bg-white hover:border-orange-300"
                  }`}
                >
                  <div className="text-sm text-gray-500 mb-1">USD</div>
                  <div
                    className={`text-4xl font-bold ${
                      monto === valor ? "text-orange-600" : "text-orange-500"
                    }`}
                  >
                    {valor}
                  </div>
                </button>
              ))}
            </div>

            {/* Input para otro monto */}
            <div className="flex gap-3 mb-8">
              <button
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold"
                onClick={() => {}}
              >
                Otro
              </button>
              <input
                type="number"
                placeholder="Monto (mín. $1)"
                min="1"
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Monto seleccionado */}
            <div className="bg-gray-50 rounded-xl p-6 text-center mb-8">
              <p className="text-gray-600 mb-2">Monto seleccionado:</p>
              <p className="text-4xl font-bold text-orange-600">${monto.toFixed(2)}</p>
            </div>

            {/* Información del asistente */}
            {asistente && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Asistente:</span> {asistente}
                </p>
              </div>
            )}

            {/* Botón continuar */}
            <button
              onClick={handleContinuar}
              disabled={monto < 1}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg transition ${
                monto >= 1
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Continuar
            </button>
          </div>
        ) : (
          /* Formulario de Datos del Donador */
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Datos del Donador
              </h1>
              <button
                type="button"
                onClick={() => setShowMontoSelector(true)}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium underline"
              >
                Cambiar monto
              </button>
            </div>


            {/* Nombre completo */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={handleInputChange}
                placeholder="Ingrese su nombre completo"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  formErrors.nombreCompleto
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-orange-200"
                }`}
              />
              {formErrors.nombreCompleto && (
                <p className="text-red-500 text-sm mt-1">{formErrors.nombreCompleto}</p>
              )}
            </div>

            {/* Número de cédula */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Número de cédula <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleInputChange}
                placeholder="Ingrese su número de cédula"
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  formErrors.cedula
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-orange-200"
                }`}
              />
              {formErrors.cedula && (
                <p className="text-red-500 text-sm mt-1">{formErrors.cedula}</p>
              )}
            </div>

            {/* Correo electrónico */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                placeholder="correo@ejemplo.com"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  formErrors.correo
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-orange-200"
                }`}
              />
              {formErrors.correo && (
                <p className="text-red-500 text-sm mt-1">{formErrors.correo}</p>
              )}
            </div>

            {/* Banco */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Banco <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="banco"
                  value={formData.banco}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 appearance-none bg-white"
                >
                  {bancos.map((banco) => (
                    <option key={banco} value={banco}>
                      {banco}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tipo de Cuenta */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Tipo de Cuenta <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, tipoCuenta: "Ahorro" }))
                  }
                  className={`flex-1 py-3 rounded-lg border-2 font-medium transition ${
                    formData.tipoCuenta === "Ahorro"
                      ? "border-orange-600 bg-orange-50 text-orange-600"
                      : "border-gray-300 text-gray-600 hover:border-orange-300"
                  }`}
                >
                  <span className="mr-2">
                    {formData.tipoCuenta === "Ahorro" ? "●" : "○"}
                  </span>
                  Ahorro
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, tipoCuenta: "Corriente" }))
                  }
                  className={`flex-1 py-3 rounded-lg border-2 font-medium transition ${
                    formData.tipoCuenta === "Corriente"
                      ? "border-orange-600 bg-orange-50 text-orange-600"
                      : "border-gray-300 text-gray-600 hover:border-orange-300"
                  }`}
                >
                  <span className="mr-2">
                    {formData.tipoCuenta === "Corriente" ? "●" : "○"}
                  </span>
                  Corriente
                </button>
              </div>
            </div>

            {/* Número de cuenta bancaria */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Número de cuenta bancaria <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  name="numeroCuenta"
                  value={formData.numeroCuenta}
                  onChange={handleInputChange}
                  placeholder="Cuenta bancaria"
                  className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.numeroCuenta
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-orange-200"
                  }`}
                />
                <button
                  type="button"
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01"
                    />
                  </svg>
                  Abrir banca
                </button>
              </div>
              {formErrors.numeroCuenta && (
                <p className="text-red-500 text-sm mt-1">{formErrors.numeroCuenta}</p>
              )}
            </div>

            {/* Términos y condiciones */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="aceptaTerminos"
                  checked={formData.aceptaTerminos}
                  onChange={handleInputChange}
                  className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">
                  Acepto los{" "}
                  <a
                    href="/politicas"
                    target="_blank"
                    className="text-orange-600 underline hover:text-orange-700"
                  >
                    términos y condiciones
                  </a>{" "}
                  y la{" "}
                  <a
                    href="/politicas"
                    target="_blank"
                    className="text-orange-600 underline hover:text-orange-700"
                  >
                    política de tratamiento de privacidad
                  </a>
                  . Mis datos personales están protegidos y serán utilizados únicamente
                  para el proceso de donación.
                </span>
              </label>
              {formErrors.aceptaTerminos && (
                <p className="text-red-500 text-sm mt-1">{formErrors.aceptaTerminos}</p>
              )}
            </div>

            {/* Botón enviar */}
            <button
              type="submit"
              disabled={!isFormComplete()}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg transition ${
                isFormComplete()
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Enviar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function QuickFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-orange-600 font-semibold">Cargando formulario...</p>
          </div>
        </div>
      }
    >
      <QuickFormContent />
    </Suspense>
  );
}
