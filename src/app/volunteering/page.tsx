import React, { useState } from "react";
import { z } from "zod";
import dotenv from "dotenv";

// Schema de validación con Zod
const DonacionAlimentosSchema = z.object({
  nombresCompletos: z.string().min(2, "Los nombres completos son requeridos"),
  correoElectronico: z.string().email("Por favor ingresa un correo válido"),
  numeroTelefonico: z
    .string()
    .regex(/^\d{10}$/, "El teléfono debe tener 10 dígitos"),
  ciudad: z.string().min(2, "La ciudad es requerida"),
  direccion: z.string().min(5, "La dirección es requerida"),
  tipoAlimento: z.string().min(1, "Selecciona el tipo de alimento"),
  cantidadEstimada: z.string().min(1, "La cantidad estimada es requerida"),
  fechaDisponibilidad: z
    .string()
    .min(1, "La fecha de disponibilidad es requerida"),
  observaciones: z.string().optional(),
});

type FormData = z.infer<typeof DonacionAlimentosSchema>;

export default function DonacionAlimentosPage() {
  const [formData, setFormData] = useState<FormData>({
    nombresCompletos: "",
    correoElectronico: "",
    numeroTelefonico: "",
    ciudad: "",
    direccion: "",
    tipoAlimento: "",
    cantidadEstimada: "",
    fechaDisponibilidad: "",
    observaciones: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validar datos
      const validatedData = DonacionAlimentosSchema.parse(formData);

      const emailReceptor ="donaciones@baq.ec";

      // Enviar email (aquí simularemos el envío)
      const emailData = {
        to: emailReceptor,
        // cc: 'alexis.sotomayor@donaya.app',
        subject: `Nueva Donación de Alimentos - ${validatedData.nombresCompletos}`,
        html: `
           <!doctype html>
          <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
        </head>
        <body style="margin:0;padding:0;background:#f7f7f7;font-family:Arial,Helvetica,sans-serif;color:#333;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
            <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.08);">
              <tr>
            <td style="background:linear-gradient(90deg,#ff8a00 0%,#f7f7f7 100%);padding:20px 24px;">
              <h1 style="margin:0;color:#ff5c00;font-size:20px;font-weight:700;">Notificación: Donación de Alimentos</h1>
            </td>
              </tr>

              <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 12px 0;font-size:14px;color:#555;">
                Se ha recibido una nueva notificación de donación. A continuación se detallan los datos proporcionados por el usuario:
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-collapse:collapse;">
                <tbody>
              <tr>
                <td style="width:40%;padding:8px 6px;font-weight:700;color:#444;background:#fafafa;border-top:1px solid #eee;">Nombres y Apellidos</td>
                <td style="padding:8px 6px;border-top:1px solid #eee;">${
                  validatedData.nombresCompletos
                }</td>
              </tr>
              <tr>
                <td style="padding:8px 6px;font-weight:700;color:#444;background:#fafafa;">Correo Electrónico</td>
                <td style="padding:8px 6px;">${
                  validatedData.correoElectronico
                }</td>
              </tr>
              <tr>
                <td style="padding:8px 6px;font-weight:700;color:#444;background:#fafafa;">Número Telefónico</td>
                <td style="padding:8px 6px;">${
                  validatedData.numeroTelefonico
                }</td>
              </tr>
              <tr>
                <td style="padding:8px 6px;font-weight:700;color:#444;background:#fafafa;">Ciudad</td>
                <td style="padding:8px 6px;">${validatedData.ciudad}</td>
              </tr>
              <tr>
                <td style="padding:8px 6px;font-weight:700;color:#444;background:#fafafa;">Dirección</td>
                <td style="padding:8px 6px;">${validatedData.direccion}</td>
              </tr>
              <tr>
                <td style="padding:8px 6px;font-weight:700;color:#444;background:#fafafa;">Tipo de Alimento</td>
                <td style="padding:8px 6px;">${validatedData.tipoAlimento}</td>
              </tr>
              <tr>
                <td style="padding:8px 6px;font-weight:700;color:#444;background:#fafafa;">Cantidad Estimada</td>
                <td style="padding:8px 6px;">${
                  validatedData.cantidadEstimada
                }</td>
              </tr>
              <tr>
                <td style="padding:8px 6px;font-weight:700;color:#444;background:#fafafa;">Fecha de Disponibilidad</td>
                <td style="padding:8px 6px;">${
                  validatedData.fechaDisponibilidad
                }</td>
              </tr>
              <tr>
                <td style="padding:8px 6px;font-weight:700;color:#444;background:#fafafa;">Observaciones</td>
                <td style="padding:8px 6px;">${
                  validatedData.observaciones || "Ninguna"
                }</td>
              </tr>
                </tbody>
              </table>

              <p style="margin:18px 0 0 0;font-size:13px;color:#666;">
                Recomendación: contactar al donante para coordinar la entrega o retiro de los alimentos.
              </p>

              <div style="margin-top:18px;text-align:center;">
                <a href="mailto:donaciones@baq.ec?subject=Coordinación%20Donaci%C3%B3n%20-${encodeURIComponent(
                  validatedData.nombresCompletos
                )}" style="display:inline-block;padding:10px 18px;background:#ff8a00;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
              Contactar al equipo de donaciones
                </a>
              </div>
            </td>
              </tr>

              <tr>
            <td style="background:#f4f4f4;padding:12px 24px;font-size:12px;color:#777;text-align:center;">
              Esta es una notificación automática del sistema de BAQ. Para más información responde a este correo o visita nuestro sitio.
            </td>
              </tr>
            </table>
          </td>
            </tr>
          </table>
        </body>
          </html>
        `,
      };

      const urlReceiver = "https://api.baq.ec/api/baq/";

      // Aquí harías la llamada a tu API para enviar el email
      const response = await fetch(`${urlReceiver}/email/enviar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        // Limpiar formulario
        setFormData({
          nombresCompletos: "",
          correoElectronico: "",
          numeroTelefonico: "",
          ciudad: "",
          direccion: "",
          tipoAlimento: "",
          cantidadEstimada: "",
          fechaDisponibilidad: "",
          observaciones: "",
        });
      } else {
        throw new Error("Error al enviar el formulario");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Errores de validación
        const fieldErrors: Partial<Record<keyof FormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof FormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error("Error al enviar formulario:", error);
        alert(
          "Hubo un error al enviar el formulario. Por favor intenta de nuevo."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Formulario Enviado!
          </h2>
          <p className="text-gray-600 mb-6">
            Gracias por tu interés en donar alimentos. Nos pondremos en contacto
            contigo pronto.
          </p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
          >
            Enviar Otra Donación
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-600 to-orange-400 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Dona Alimentos en Ecuador
          </h1>
          <p className="text-xl md:text-2xl mb-2">¡Comparte y desecha menos!</p>
          <div className="w-24 h-1 bg-white mx-auto"></div>
        </div>
      </div>

      {/* Información */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <p className="text-lg text-gray-700 leading-relaxed">
            Todas las donaciones de alimentos realizan múltiples beneficios para
            el donante, niñez, adolescencia, personas adultas mayor y personas
            con capacidades especiales. Nuestra estrategia está enfocada en
            desarrollar procesos de aprovechamiento integral de los alimentos,
            asegurando su distribución inmediata a la prolongación del ciclo de
            vida, a través de nuestra técnica profesional.
          </p>
        </div>

        {/* Formulario */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              ¿Quieres donar alimentos?
            </h2>
            <p className="text-gray-600">
              Llena el formulario a continuación para poder coordinar contigo.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            autoComplete="off"
          >
            {/* Nombres Completos */}
            <div>
              <label
                htmlFor="nombresCompletos"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombres y Apellidos *
              </label>
              <input
                type="text"
                id="nombresCompletos"
                name="nombresCompletos"
                value={formData.nombresCompletos}
                onChange={handleInputChange}
                autoComplete="name"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.nombresCompletos ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ingresa tus nombres y apellidos completos"
              />
              {errors.nombresCompletos && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.nombresCompletos}
                </p>
              )}
            </div>

            {/* Correo y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="correoElectronico"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  id="correoElectronico"
                  name="correoElectronico"
                  value={formData.correoElectronico}
                  onChange={handleInputChange}
                  autoComplete="email"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.correoElectronico
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="ejemplo@correo.com"
                />
                {errors.correoElectronico && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.correoElectronico}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="numeroTelefonico"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Número Telefónico *
                </label>
                <input
                  type="tel"
                  id="numeroTelefonico"
                  name="numeroTelefonico"
                  value={formData.numeroTelefonico}
                  onChange={handleInputChange}
                  autoComplete="tel"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.numeroTelefonico
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="0987654321"
                />
                {errors.numeroTelefonico && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.numeroTelefonico}
                  </p>
                )}
              </div>
            </div>

            {/* Ciudad y Dirección */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="ciudad"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ciudad *
                </label>
                <input
                  type="text"
                  id="ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  autoComplete="address-level2"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.ciudad ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ej: Quito, Guayaquil, Cuenca"
                />
                {errors.ciudad && (
                  <p className="mt-1 text-sm text-red-600">{errors.ciudad}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="direccion"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Dirección *
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  autoComplete="street-address"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.direccion ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Dirección completa"
                />
                {errors.direccion && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.direccion}
                  </p>
                )}
              </div>
            </div>

            {/* Tipo de Alimento */}
            <div>
              <label
                htmlFor="tipoAlimento"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tipo de Alimento *
              </label>
              <select
                id="tipoAlimento"
                name="tipoAlimento"
                value={formData.tipoAlimento}
                onChange={handleInputChange}
                autoComplete="off"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.tipoAlimento ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Selecciona el tipo de alimento</option>
                <option value="frutas-verduras">Frutas y Verduras</option>
                <option value="granos-cereales">Granos y Cereales</option>
                <option value="lacteos">Lácteos</option>
                <option value="carnes">Carnes y Proteínas</option>
                <option value="enlatados">Alimentos Enlatados</option>
                <option value="panaderia">Panadería</option>
                <option value="otros">Otros</option>
              </select>
              {errors.tipoAlimento && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.tipoAlimento}
                </p>
              )}
            </div>

            {/* Cantidad y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="cantidadEstimada"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Cantidad Estimada *
                </label>
                <input
                  type="text"
                  id="cantidadEstimada"
                  name="cantidadEstimada"
                  value={formData.cantidadEstimada}
                  onChange={handleInputChange}
                  autoComplete="off"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.cantidadEstimada
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Ej: 50 kg, 100 unidades"
                />
                {errors.cantidadEstimada && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.cantidadEstimada}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="fechaDisponibilidad"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Fecha de Disponibilidad *
                </label>
                <input
                  type="date"
                  id="fechaDisponibilidad"
                  name="fechaDisponibilidad"
                  value={formData.fechaDisponibilidad}
                  onChange={handleInputChange}
                  autoComplete="off"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.fechaDisponibilidad
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.fechaDisponibilidad && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fechaDisponibilidad}
                  </p>
                )}
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label
                htmlFor="observaciones"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Observaciones Adicionales
              </label>
              <textarea
                id="observaciones"
                name="observaciones"
                rows={4}
                value={formData.observaciones}
                onChange={handleInputChange}
                autoComplete="off"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Información adicional sobre los alimentos, condiciones especiales, etc."
              ></textarea>
            </div>

            {/* Botón Submit */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full md:w-auto px-8 py-4 rounded-lg font-semibold text-white transition duration-300 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {isSubmitting ? "Enviando..." : "Notificar de mi donación"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
