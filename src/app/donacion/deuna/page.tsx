"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";

// Esquema de validación para DeUna
const FormSchema = z.object({
  email: z
    .string()
    .email({ message: "Email inválido" })
    .optional()
    .or(z.literal("")),
  telefono: z
    .string()
    .min(10, { message: "El teléfono debe tener al menos 10 dígitos" })
    .max(15, { message: "El teléfono no debe exceder 15 dígitos" })
    .regex(/^[0-9]+$/, { message: "Solo se permiten números" })
    .trim(),
  direccion: z
    .string()
    .trim()
    .min(10, { message: "La dirección debe tener al menos 10 caracteres" })
    .max(200, { message: "La dirección no debe exceder 200 caracteres" })
    .regex(/^[a-zA-Z0-9\s.,\-#]+$/, {
      message: "Solo se permiten letras, números, espacios y los caracteres . , - #",
    }),
});

type FormData = z.infer<typeof FormSchema>;

export default function DeunaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [monto, setMonto] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    telefono: "",
    direccion: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
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
    e: React.ChangeEvent<HTMLInputElement>
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

  const validateForm = () => {
    try {
      FormSchema.parse(formData);
      setErrors({});
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

    // ✅ Guardar datos en sessionStorage para uso posterior (igual que PayPal)
    sessionStorage.setItem("deunaEmail", formData.email || "");
    sessionStorage.setItem("deunaTelefono", formData.telefono);
    sessionStorage.setItem("deunaDireccion", formData.direccion);
    
    console.log('🔥 === DATOS GUARDADOS EN SESSIONSTORAGE (DEUNA FORM) ===');
    console.log('📧 Email guardado:', formData.email || "");
    console.log('📱 Teléfono guardado:', formData.telefono);
    console.log('🏠 Dirección guardada:', formData.direccion);
    console.log('✅ Datos guardados exitosamente, redirigiendo a QR...');

    // ✅ Redirigir a la página QR con los datos en sessionStorage
    router.push(`/donacion/qr?monto=${monto}`);
    setLoading(false);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-800 transition"
            >
              <span>←</span>
              Volver
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500">Monto a donar</p>
              <p className="text-2xl font-bold text-orange-600">${monto} USD</p>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#2F3388] mb-2">
              Donación con DeUna
            </h1>
            <p className="text-gray-600">Completa tus datos para continuar</p>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                className={`w-full border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Para recibir confirmación de tu donación
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="0999999999"
                className={`w-full border ${
                  errors.telefono ? "border-red-500" : "border-gray-300"
                } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                required
              />
              {errors.telefono && (
                <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
              )}
              {!formData.telefono && (
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
                placeholder="Av. Principal 123, Ciudad"
                className={`w-full border ${
                  errors.direccion ? "border-red-500" : "border-gray-300"
                } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500`}
                required
              />
              {errors.direccion && (
                <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>
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

              {/* Mostrar todos los errores de validación */}
              {Object.keys(errors).length > 0 && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="font-medium text-red-600 mb-1">
                    Por favor corrige los siguientes errores:
                  </p>
                  <ul className="list-disc pl-5 text-red-600">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field} className="mt-1">
                        {field === "email"
                          ? `Email: ${message}`
                          : field === "telefono"
                          ? `Teléfono: ${message}`
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
        </div>

        {/* Información adicional */}
        <div className="bg-orange-50 rounded-xl p-4 mt-6">
          <h3 className="font-semibold text-orange-800 mb-2">
            Información importante:
          </h3>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• El pago se procesa de forma segura a través de DeUna</li>
            <li>• Tu donación ayudará directamente al Banco de Alimentos</li>
            <li>• Recibirás un comprobante por correo electrónico</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
