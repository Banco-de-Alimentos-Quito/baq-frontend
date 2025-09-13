"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import Paypal from "../../components/Paypal";
import { useFormStore } from "../../store/formStore";

// Esquema de validación
const FormSchema = z.object({
  identificacion: z
    .string()
    .min(5, { message: "La dirección debe tener al menos 5 caracteres" })
    .max(200, { message: "La dirección no puede superar los 200 caracteres" })
    .regex(/^[A-Za-z0-9\s\.,#\-]+$/, {
      message:
        "La dirección solo puede contener letras, números, espacios y los caracteres . , # -",
    })
    .trim(),
  direccion: z
    .string()
    .trim()
    .min(10, { message: "La dirección debe tener al menos 10 caracteres" })
    .max(200, { message: "La dirección no debe exceder 200 caracteres" })
    .regex(/^[a-zA-Z0-9\s.,\-#]+$/, {
      message:
        "Solo se permiten letras, números, espacios y los caracteres . , - #",
    }),
  tipoIdentificacion: z.enum(["cedula", "ruc", "pasaporte"]),
});

type FormData = z.infer<typeof FormSchema>;

function PaypalPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [monto, setMonto] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    identificacion: "",
    direccion: "",
    tipoIdentificacion: "cedula",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const montoParam = searchParams.get("monto");
    if (montoParam) {
      setMonto(parseFloat(montoParam));
    } else {
      router.push("/donacion");
    }
  }, [searchParams, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error al escribir
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Coloca aquí la función mejorada:
  const validateForm = () => {
    try {
      FormSchema.parse(formData);
      setErrors({}); // Limpiar errores si la validación es exitosa
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof FormData] = err.message;
          }
        });
        setErrors(newErrors);

        // Scroll hacia el área de errores
        setTimeout(() => {
          const errorSection = document.querySelector(".text-red-600");
          if (errorSection) {
            errorSection.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isValid = validateForm();
    if (!isValid) {
      setLoading(false);
      return;
    }

    // Guardar datos en sessionStorage para uso posterior
    useFormStore.setState({
      identificacion: formData.identificacion,
      tipoIdentificacion: formData.tipoIdentificacion,
      direccion: formData.direccion,
    });

    // Marcar como enviado para mostrar PayPal
    setFormSubmitted(true);
    setLoading(false);
  };

  const handleSuccess = () => {
    // Limpiar datos después de un pago exitoso
    useFormStore.setState({
      identificacion: "",
      tipoIdentificacion: "cedula",
      direccion: "",
    });
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
            >
              <span>←</span>
              Volver
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500">Monto a donar</p>
              <p className="text-2xl font-bold text-blue-600">${monto} USD</p>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#2F3388] mb-2">
              Donación con PayPal
            </h1>
            <p className="text-gray-600">Completa tus datos para la factura</p>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {!formSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Tipo de identificación <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipoIdentificacion"
                  value={formData.tipoIdentificacion}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="cedula">Cédula</option>
                  <option value="ruc">RUC</option>
                  <option value="pasaporte">Pasaporte</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Número de{" "}
                  {formData.tipoIdentificacion === "cedula"
                    ? "Cédula"
                    : formData.tipoIdentificacion === "ruc"
                    ? "RUC"
                    : "Pasaporte"}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="identificacion"
                  value={formData.identificacion}
                  onChange={handleInputChange}
                  placeholder={`Ingresa tu ${
                    formData.tipoIdentificacion === "cedula"
                      ? "cédula"
                      : formData.tipoIdentificacion === "ruc"
                      ? "RUC"
                      : "pasaporte"
                  }`}
                  className={`w-full border ${
                    errors.identificacion ? "border-red-500" : "border-gray-300"
                  } 
                             rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  required
                />
                {errors.identificacion && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.identificacion}
                  </p>
                )}
                {!formData.identificacion && (
                  <p className="text-gray-500 text-xs mt-1">
                    Este campo es obligatorio
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Dirección completa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu dirección completa"
                  className={`w-full border ${
                    errors.direccion ? "border-red-500" : "border-gray-300"
                  } 
                             rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  required
                />
                {errors.direccion && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.direccion}
                  </p>
                )}
                {!formData.direccion && (
                  <p className="text-gray-500 text-xs mt-1">
                    Este campo es obligatorio
                  </p>
                )}
              </div>

              <div className="mt-4 text-xs border-t pt-3">
                <p>
                  <span className="text-red-500">*</span> Campos obligatorios
                </p>

                {/* Mostrar todos los errores de validación en esta sección */}
                {Object.keys(errors).length > 0 && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="font-medium text-red-600 mb-1">
                      Por favor corrige los siguientes errores:
                    </p>
                    <ul className="list-disc pl-5 text-red-600">
                      {Object.entries(errors).map(([field, message]) => (
                        <li key={field} className="mt-1">
                          {field === "identificacion"
                            ? `${
                                formData.tipoIdentificacion === "cedula"
                                  ? "Cédula"
                                  : formData.tipoIdentificacion === "ruc"
                                  ? "RUC"
                                  : "Pasaporte"
                              }: ${message}`
                            : field === "direccion"
                            ? `Dirección: ${message}`
                            : `${field}: ${message}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-300 text-white py-3 rounded-lg font-bold hover:from-orange-600 hover:to-orange-400 transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  "Continuar al pago"
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-semibold text-[#2F3388] mb-4">
                Realizar donación con PayPal
              </h2>

              {/* Envolver el componente Paypal en un contenedor con altura adecuada */}
              <div
                className="w-full max-w-md relative"
                style={{ minHeight: "200px" }}
              >
                {/* 
                  Asegurar que el componente Paypal tenga un z-index adecuado 
                  y espacio suficiente para mostrar el botón de PayPal
                */}
                <div className="z-10 relative">
                  <Paypal
                    amount={monto}
                    productDescription={`Donación BAQ - ${monto} USD`}
                    successUrl="thank-you"
                    onSuccess={handleSuccess}
                  />
                </div>
              </div>

              {/* Resumen de la información */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-700 w-full max-w-md">
                <p className="font-semibold mb-2">Resumen de la información:</p>
                <p>
                  • Tipo de identificación:{" "}
                  {formData.tipoIdentificacion === "cedula"
                    ? "Cédula"
                    : formData.tipoIdentificacion === "ruc"
                    ? "RUC"
                    : "Pasaporte"}
                </p>
                <p>• Número: {formData.identificacion}</p>
                <p>• Dirección: {formData.direccion}</p>
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 rounded-xl p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">
            Información importante:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• El pago se procesa de forma segura a través de PayPal</li>
            <li>• Tu donación ayudará directamente al Banco de Alimentos</li>
            <li>• Recibirás un comprobante por correo electrónico</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function PaypalPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PaypalPageContent />
    </Suspense>
  );
}
