"use client";
import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useFormValidation, FormData } from "./hooks/useFormValidation";
import { ValidatedInput, ValidatedSelect } from "./components/FormFields";
import { BANK_OPTIONS, ACCOUNT_TYPE_OPTIONS } from "./constants/formOptions";
import { DonationService } from "./services/donationService";

export default function DonacionMensualForm() {
  const params = useSearchParams();
  const router = useRouter();
  const monto = Number(params.get("monto")) || 0;

  // Añadir estado para la factura
  const [quiereFactura, setQuiereFactura] = useState<boolean | null>(null);

  // Debug: monitorear cambios en quiereFactura
  React.useEffect(() => {
    console.log(
      "🔄 DEBUG - Estado quiereFactura cambió a:",
      quiereFactura,
      typeof quiereFactura
    );
  }, [quiereFactura]);

  const [form, setForm] = useState<FormData>({
    cedula: "",
    nombres: "",
    numero: "",
    correo: "",
    direccion: "",
    cuenta: "",
    tipoCuenta: "",
    banco: "",
    otroBanco: "",
    ciudad: "",
    acepta: false,
  });

  const [enviado, setEnviado] = useState(false);
  const [tocado, setTocado] = useState<{ [k: string]: boolean }>({});
  const [termsChecked, setTermsChecked] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    errors,
    validationState,
    documentType,
    validateField,
    clearValidation,
    validateEcuadorianId,
  } = useFormValidation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;

    const newValue =
      type === "checkbox" ? (target as HTMLInputElement).checked : value;

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setTocado((prev) => ({ ...prev, [name]: true }));

    // Validar campo en tiempo real si tiene valor
    if (value && name in form) {
      validateField(name as keyof FormData, value);
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTocado((prev) => ({ ...prev, [name]: true }));

    if (value && name in form) {
      validateField(name as keyof FormData, value);
    }
  };

  const isFormValid = () => {
    const requiredFields =
      form.cedula &&
      form.nombres &&
      form.numero &&
      form.correo &&
      form.direccion &&
      form.cuenta &&
      form.tipoCuenta &&
      form.banco &&
      form.ciudad &&
      form.acepta &&
      termsChecked;

    // Añadir validación de la opción de factura
    const facturaSeleccionada = quiereFactura !== null;

    if (form.banco === "Otra") {
      return requiredFields && form.otroBanco;
    }

    return requiredFields && facturaSeleccionada;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    const allFieldsKeys = Object.keys(form) as (keyof FormData)[];
    const allTouched = allFieldsKeys.reduce((acc, key) => {
      acc[key as string] = true;
      return acc;
    }, {} as { [k: string]: boolean });

    setTocado({ ...allTouched, acepta: true });

    if (!isFormValid()) {
      return;
    }

    if (!validateEcuadorianId(form.cedula)) {
      toast.error("Cédula/RUC inválido", {
        description:
          "El formato de la cédula o RUC ingresado no es válido. Verifica e intenta nuevamente.",
        duration: 5000,
      });
      return;
    }

    setEnviado(true);

    try {
      // Debug: mostrar el valor antes de enviar
      console.log("🚀 DEBUG - Valor de quiereFactura:", quiereFactura);
      console.log("🚀 DEBUG - Tipo de quiereFactura:", typeof quiereFactura);
      console.log("🚀 DEBUG - quiereFactura === true:", quiereFactura === true);
      console.log(
        "🚀 DEBUG - quiereFactura === false:",
        quiereFactura === false
      );
      console.log("🚀 DEBUG - quiereFactura ?? false:", quiereFactura ?? false);

      // Asegurar que el valor sea booleano explícito
      const facturaValue = quiereFactura === true ? true : false;
      console.log(
        "🚀 DEBUG - Valor final facturaValue:",
        facturaValue,
        typeof facturaValue
      );

      await DonationService.submitDonation(
        form,
        monto,
        termsChecked,
        facturaValue
      );
      setEnviado(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("❌ Error submitting form:", error);

      let errorMessage = "Error al enviar el formulario";
      let errorDescription =
        "Hubo un problema al procesar tu solicitud. Por favor, intenta nuevamente.";

      if (error instanceof Error) {
        if (error.message.includes("Missing required fields")) {
          errorMessage = "Campos requeridos faltantes";
          errorDescription = error.message;
        } else if (error.message.includes("must be")) {
          errorMessage = "Error de validación";
          errorDescription = error.message;
        } else if (error.message.includes("HTTP error! status: 400")) {
          errorMessage = "Error de validación del servidor";
          errorDescription =
            "Los datos enviados no cumplen con los requisitos del servidor.";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Error de conexión";
          errorDescription =
            "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
        }
      }

      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000,
      });
      setEnviado(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setForm({
      cedula: "",
      nombres: "",
      numero: "",
      correo: "",
      direccion: "",
      cuenta: "",
      tipoCuenta: "",
      banco: "",
      otroBanco: "",
      ciudad: "",
      acepta: false,
    });
    setTocado({});
    setTermsChecked(false);
    setQuiereFactura(null);
    clearValidation();
    
    // Redirigir a la página de inicio
    router.push("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Espacio reservado para navbar (sin mostrarlo) */}
      <div
        style={{
          paddingTop: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            borderRadius: 24,
            boxShadow: "0 4px 24px #0001",
            padding: "40px 32px",
            maxWidth: 420,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          <h1
            style={{
              color: "#2F3388",
              fontWeight: 900,
              fontSize: "1.5rem",
              marginBottom: 18,
              textAlign: "center",
            }}
          >
            Donación mensual
          </h1>

          <div style={{ width: "100%" }}>
            <ValidatedInput
              label="Cédula/RUC/Pasaporte"
              name="cedula"
              value={form.cedula}
              placeholder="Ej: 1710034065, 1710034065001, A1234567"
              required
              validation={validationState.cedula}
              error={errors.cedula}
              touched={tocado.cedula}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {documentType && form.cedula && (
              <div
                style={{
                  marginTop: "4px",
                  padding: "4px 8px",
                  backgroundColor: "#e6f7ff",
                  border: "1px solid #91d5ff",
                  borderRadius: "4px",
                  fontSize: "12px",
                  color: "#1890ff",
                  fontWeight: "500",
                }}
              >
                ✓ {documentType} detectado
              </div>
            )}
          </div>

          <ValidatedInput
            label="Nombres Completos"
            name="nombres"
            value={form.nombres}
            placeholder="Ej: Juan Carlos Pérez González"
            required
            validation={validationState.nombres}
            error={errors.nombres}
            touched={tocado.nombres}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <ValidatedInput
            label="Número de teléfono"
            name="numero"
            type="tel"
            value={form.numero}
            placeholder="Ej: 0991234567"
            required
            validation={validationState.numero}
            error={errors.numero}
            touched={tocado.numero}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <ValidatedInput
            label="Correo electrónico"
            name="correo"
            type="email"
            value={form.correo}
            placeholder="tucorreo@email.com"
            required
            validation={validationState.correo}
            error={errors.correo}
            touched={tocado.correo}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <ValidatedInput
            label="Dirección"
            name="direccion"
            value={form.direccion}
            placeholder="Ej: Av. Principal 123 y Secundaria"
            required
            validation={validationState.direccion}
            error={errors.direccion}
            touched={tocado.direccion}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <ValidatedInput
            label="Ciudad"
            name="ciudad"
            value={form.ciudad}
            placeholder="Ej: Quito, Guayaquil, Cuenca"
            required
            validation={validationState.ciudad}
            error={errors.ciudad}
            touched={tocado.ciudad}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <ValidatedInput
            label="Número de cuenta del donador"
            name="cuenta"
            value={form.cuenta}
            placeholder="Ej: 1234567890"
            required
            validation={validationState.cuenta}
            error={errors.cuenta}
            touched={tocado.cuenta}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <ValidatedSelect
            label="Tipo de cuenta"
            name="tipoCuenta"
            value={form.tipoCuenta}
            options={ACCOUNT_TYPE_OPTIONS}
            placeholder="Selecciona el tipo de cuenta"
            required
            touched={tocado.tipoCuenta}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <ValidatedSelect
            label="Banco o cooperativa"
            name="banco"
            value={form.banco}
            options={BANK_OPTIONS}
            placeholder="Selecciona tu banco o cooperativa"
            required
            touched={tocado.banco}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          {form.banco === "Otra" && (
            <ValidatedInput
              label="Especifica tu banco o cooperativa"
              name="otroBanco"
              value={form.otroBanco}
              placeholder="Nombre de tu banco o cooperativa"
              required
              touched={tocado.otroBanco}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          )}

          <ValidatedInput
            label="Monto a donar"
            name="monto"
            type="number"
            value={monto.toString()}
            readOnly
            onChange={() => {}}
            onBlur={() => {}}
          />

          <div style={{ width: "100%", marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#2F3388",
              }}
            >
              ¿Deseas recibir factura?
            </label>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => {
                  console.log(
                    "✅ DEBUG - Antes: quiereFactura =",
                    quiereFactura
                  );
                  setQuiereFactura(true);
                  console.log(
                    "✅ DEBUG - Después: setQuiereFactura(true) ejecutado"
                  );
                  // Verificar después de un pequeño delay
                  setTimeout(() => {
                    console.log(
                      "✅ DEBUG - Estado después del setTimeout:",
                      quiereFactura
                    );
                  }, 100);
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "2px solid",
                  borderColor: quiereFactura === true ? "#ff7300" : "#e2e8f0",
                  borderRadius: "8px",
                  background: quiereFactura === true ? "#fff0e6" : "#fff",
                  color: quiereFactura === true ? "#ff7300" : "#4a5568",
                  fontWeight: quiereFactura === true ? "600" : "400",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Sí, quiero factura
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log(
                    "❌ DEBUG - Antes: quiereFactura =",
                    quiereFactura
                  );
                  setQuiereFactura(false);
                  console.log(
                    "❌ DEBUG - Después: setQuiereFactura(false) ejecutado"
                  );
                  // Verificar después de un pequeño delay
                  setTimeout(() => {
                    console.log(
                      "❌ DEBUG - Estado después del setTimeout:",
                      quiereFactura
                    );
                  }, 100);
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "2px solid",
                  borderColor: quiereFactura === false ? "#ff7300" : "#e2e8f0",
                  borderRadius: "8px",
                  background: quiereFactura === false ? "#fff0e6" : "#fff",
                  color: quiereFactura === false ? "#ff7300" : "#4a5568",
                  fontWeight: quiereFactura === false ? "600" : "400",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                No, gracias
              </button>
            </div>
            {quiereFactura === null && (
              <p
                style={{ color: "#e53e3e", fontSize: "13px", marginTop: "4px" }}
              >
                Por favor selecciona una opción
              </p>
            )}
          </div>

          <div
            style={{
              width: "100%",
              margin: "12px 0",
              background: "#f8fafc",
              borderRadius: 8,
              padding: 12,
              border: "1px solid #eee",
              color: "#2F3388",
              fontSize: 15,
            }}
          >
            <input
              type="checkbox"
              name="acepta"
              checked={form.acepta}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              style={{ marginRight: 8 }}
            />
            <span>
              Acepto que se me debite mensualmente este monto a favor de la
              Fundación Banco de Alimentos Quito.
            </span>
            {tocado.acepta && !form.acepta && (
              <span
                style={{
                  color: "#e53e3e",
                  fontSize: 13,
                  display: "block",
                  marginTop: 4,
                }}
              >
                Debes aceptar la cláusula
              </span>
            )}
          </div>

          <div
            style={{
              width: "100%",
              margin: "12px 0",
              background: "#f8fafc",
              borderRadius: 8,
              padding: 12,
              border: "1px solid #eee",
              color: "#2F3388",
              fontSize: 15,
            }}
          >
            <input
              type="checkbox"
              name="terms"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
              required
              style={{ marginRight: 8 }}
            />
            <span>
              Acepto que he leído previamente los{" "}
              <Link
                href="/politicas"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Términos y Condiciones, y Política de Tratamiento de Datos
                Personales
              </Link>
              .
            </span>
          </div>

          <button
            type="submit"
            disabled={!isFormValid() || enviado}
            style={{
              width: "100%",
              background: "linear-gradient(90deg, #ff7300, #ffb347)",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 18,
              border: "none",
              borderRadius: 8,
              padding: 14,
              marginTop: 8,
              boxShadow: "0 2px 8px #ff730033",
              cursor: !isFormValid() || enviado ? "not-allowed" : "pointer",
              opacity: !isFormValid() || enviado ? 0.5 : 1,
              transition: "background 0.2s",
            }}
          >
            {enviado ? "Enviando..." : "Generar contrato"}
          </button>

          {enviado && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "rgba(0,0,0,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  boxShadow: "0 4px 24px #0002",
                  padding: "48px 32px",
                  minWidth: 320,
                  maxWidth: 380,
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#2F3388",
                    marginBottom: 18,
                  }}
                >
                  Enviando solicitud...
                </div>
                <div style={{ fontSize: 16, color: "#555", marginBottom: 18 }}>
                  Por favor espera mientras procesamos tu información.
                </div>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    border: "4px solid #f3f3f3",
                    borderTop: "4px solid #ff7300",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto",
                  }}
                ></div>
              </div>
            </div>
          )}

          {showSuccessModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "rgba(0,0,0,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  boxShadow: "0 4px 24px #0002",
                  padding: "48px 32px",
                  minWidth: 320,
                  maxWidth: 380,
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#2F3388",
                    marginBottom: 18,
                  }}
                >
                  ¡Solicitud enviada exitosamente!
                </div>
                <div style={{ fontSize: 16, color: "#555", marginBottom: 18 }}>
                  Revisa tu correo electrónico para acceder al portal y
                  completar tu donación mensual.
                </div>
                <button
                  onClick={handleCloseSuccessModal}
                  style={{
                    background: "linear-gradient(90deg, #ff7300, #ffb347)",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 18,
                    border: "none",
                    borderRadius: 8,
                    padding: 14,
                    marginTop: 8,
                    boxShadow: "0 2px 8px #ff730033",
                    cursor: "pointer",
                  }}
                >
                  Aceptar
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="w-full h-24 md:h-15"></div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .navbar-tomate {
          width: 100vw;
          background: #ED6F1D;
          display: flex;
          align-items: center;
          height: 110px;
          box-shadow: 0 2px 12px rgba(255,99,71,0.10);
          position: fixed;
          top: 0;
          left: 0;
          z-index: 20;
          padding: 0 0 0 0;
        }
        .navbar-logo {
          width: 140px;
          object-fit: contain;
          margin-left: 24px;
        }
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translateY(-100px); }
          100% { opacity: 0; transform: translateY(100vh); }
        }
        @media (max-width: 600px) {
          .navbar-tomate { height: 80px; }
          .navbar-logo { width: 100px; }
        }
      `}</style>
    </div>
  );
}
