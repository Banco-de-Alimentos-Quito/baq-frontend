"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X } from "lucide-react";
import { DonationService } from "../mensual/services/donationService";
import { CedulaValidator } from "../mensual/validators/documentValidators";

// ── Tipos ───────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    PaymentCheckout: {
      modal: new (config: {
        client_app_code?: string;
        client_app_key?: string;
        locale?: string;
        env_mode: string;
        conf?: {
          style_version?: string;
          theme?: {
            logo?: string;
            primary_color?: string;
          };
        };
        onOpen?: () => void;
        onClose?: () => void;
        onResponse?: (response: NuveiResponse) => void;
      }) => {
        open: (params: { reference: string }) => void;
        close: () => void;
      };
    };
    jQuery: unknown;
  }
  var PaymentGateway: any;
}

interface NuveiTransaction {
  id: string;
  status: string;
  status_detail: number;
  authorization_code?: string;
  message?: string;
}

interface NuveiResponse {
  error?: { description: string };
  transaction?: NuveiTransaction;
}

interface NuveiCheckoutInstance {
  open: (params: { reference: string }) => void;
  close: () => void;
}

// ── Componente principal ────────────────────────────────────────────────────

function NuveiPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const monto = parseFloat(searchParams.get("monto") || "0");
  const fallbackUserId = React.useMemo(
    () => "user_" + String(Math.floor(Date.now() / 1000)),
    [],
  );
  const userId = searchParams.get("user_id") || fallbackUserId;
  const tipo = searchParams.get("tipo") || "";
  const isRecurring = tipo === "mensual";

  const [inputEmail, setInputEmail] = useState(searchParams.get("email") || "");
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");

  // File Upload State
  const [cedulaFileFront, setCedulaFileFront] = useState<File | null>(null);
  const [cedulaPreviewFront, setCedulaPreviewFront] = useState<string | null>(
    null,
  );
  const [isDraggingFront, setIsDraggingFront] = useState(false);

  const [cedulaFileBack, setCedulaFileBack] = useState<File | null>(null);
  const [cedulaPreviewBack, setCedulaPreviewBack] = useState<string | null>(
    null,
  );
  const [isDraggingBack, setIsDraggingBack] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // If not recurring, we only need email (which could be pre-confirmed via query param)
  // If recurring, we need email, cedula, name, and images. We don't pre-confirm if recurring.
  const [preStepConfirmed, setPreStepConfirmed] = useState(
    !isRecurring && !!searchParams.get("email"),
  );

  const email = preStepConfirmed ? inputEmail : "";

  const [status, setStatus] = useState<
    "idle" | "loading" | "processing" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [sdkReady, setSdkReady] = useState(false);
  const [tokenizeSdkReady, setTokenizeSdkReady] = useState(false);
  const [checkoutInstance, setCheckoutInstance] =
    useState<NuveiCheckoutInstance | null>(null);
  const [pgSdk, setPgSdk] = useState<any>(null);

  const [txResult, setTxResult] = useState<{
    status: "success" | "error";
    title: string;
    message: string;
    txId?: string;
  } | null>(null);

  const modalInitialized = React.useRef(false);
  const currentDevRef = React.useRef("DON-fallback");

  // Inicializar el modal de Nuvei cuando el SDK esté listo
  useEffect(() => {
    if (!sdkReady || !window.PaymentCheckout || modalInitialized.current)
      return;

    // Almacenamos en ref para evitar re-inicialización en StrictMode
    modalInitialized.current = true;

    const nuveiEnv = process.env.NEXT_PUBLIC_NUVEI_ENV;

    // Credenciales CLIENT distintas según el tipo de pago:
    // - Checkout único: BANCOALIMENTOS-EC-CLIENT (NEXT_PUBLIC_NUVEI_CLIENT_*)
    // - Recurrente:     BDAQ-PR-EC-CLIENT       (NEXT_PUBLIC_NUVEI_REC_CLIENT_*)
    const clientAppCode = isRecurring
      ? process.env.NEXT_PUBLIC_NUVEI_REC_CLIENT_CODE
      : process.env.NEXT_PUBLIC_NUVEI_CLIENT_CODE;
    const clientAppKey = isRecurring
      ? process.env.NEXT_PUBLIC_NUVEI_REC_CLIENT_KEY
      : process.env.NEXT_PUBLIC_NUVEI_CLIENT_KEY;

    try {
      const instance = new window.PaymentCheckout.modal({
        locale: "es",
        env_mode: nuveiEnv,
        conf: {
          style_version: "2",
          theme: {
            logo: "https://donar.baq.ec/logo2.png",
            primary_color: "#C800A1",
          },
        },

        onOpen: () => {
          console.log("[nuvei] Modal abierto");
        },

        onClose: () => {
          console.log("[nuvei] Modal cerrado");
          if (status !== "success") {
            setStatus("idle");
            setMessage("");
          }
        },

        onResponse: (response: NuveiResponse) => {
          console.log("[nuvei] onResponse:", JSON.stringify(response));

          if (response.error) {
            setStatus("error");
            setTxResult({
              status: "error",
              title: "Error de Conexión",
              message:
                response.error.description ||
                "No se pudo comunicar de forma segura con el procesador de pagos.",
            });
            return;
          }

          const tx = response.transaction;
          if (!tx) return;

          if (tx.status === "success" && tx.status_detail === 3) {
            setStatus("success");

            // Mostrar modal gráfico de éxito
            setTxResult({
              status: "success",
              title: "¡Donación Exitosa!",
              message: `Tu pago fue aprobado exitosamente. ¡Gracias por ayudar al Banco de Alimentos Quito!`,
              txId: tx.id,
            });
          } else {
            setStatus("error");

            // Mostrar modal gráfico de rechazo
            setTxResult({
              status: "error",
              title: "Pago Rechazado",
              message:
                tx.message ||
                `No se pudo procesar la tarjeta. Por favor intenta de nuevo con una tarjeta diferente. (Código: ${tx.status_detail})`,
              txId: tx.id,
            });
          }
        },
      });

      setCheckoutInstance(instance);

      const handlePopstate = () => instance.close();
      window.addEventListener("popstate", handlePopstate);
      return () => window.removeEventListener("popstate", handlePopstate);
    } catch (err) {
      console.error("[nuvei] Error al crear modal:", err);
      setStatus("error");
      setMessage("Error al inicializar el procesador de pagos.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady, isRecurring]);

  // Inicializar el SDK de Tokenización para pagos recurrentes
  useEffect(() => {
    if (!isRecurring || !tokenizeSdkReady) return;

    // El SDK declara PaymentGateway como una clase (class PaymentGateway {...})
    // Por lo que no se añade automáticamente a 'window', debemos accederlo directamente.
    if (typeof PaymentGateway === "undefined") return;

    const nuveiEnv = process.env.NEXT_PUBLIC_NUVEI_ENV;
    const clientAppCode = process.env.NEXT_PUBLIC_NUVEI_CLIENT_CODE || "";
    const clientAppKey = process.env.NEXT_PUBLIC_NUVEI_CLIENT_KEY || "";

    if (!nuveiEnv) {
      console.error("[nuvei] NEXT_PUBLIC_NUVEI_ENV no está definida");
      setStatus("error");
      setMessage("Error de configuración: entorno de pago no definido.");
      return;
    }

    try {
      const sdk = new PaymentGateway(nuveiEnv, clientAppCode, clientAppKey);
      setPgSdk(sdk);

      const get_tokenize_data = () => ({
        locale: "es",
        user: {
          id: userId,
          email: email || "donante@baq.ec",
        },
        configuration: {
          default_country: "ECU",
        },
      });

      const responseCallback = (response: any) => {
        console.log("[nuvei] Tokenize response:", response);

        if (response.error) {
          setStatus("error");
          setTxResult({
            status: "error",
            title: "Error al guardar tarjeta",
            message:
              response.error.type ||
              response.error.description ||
              "Hubo un problema al procesar tu tarjeta.",
          });
        } else if (
          response.card &&
          response.card.status === "valid" &&
          response.card.token
        ) {
          setStatus("success");

          fetch(`${process.env.NEXT_PUBLIC_API_URL}/nuvei/save-subscription`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: response.card.token,
              bin: response.card.bin,
              userId: userId,
              email: email || "donante@baq.ec",
              monto: monto,
              cedula: cedula,
              nombre: nombre,
              response: response,
            }),
          })
            .then(async () => {
              // Upload front ID image
              if (cedulaFileFront) {
                try {
                  await DonationService.submitImage(
                    cedula + "_frontal",
                    cedulaFileFront,
                  );
                } catch (uploadError) {
                  console.error("Error uploading image frontal:", uploadError);
                }
              }

              // Upload back ID image
              if (cedulaFileBack) {
                try {
                  await DonationService.submitImage(
                    cedula + "_trasera",
                    cedulaFileBack,
                  );
                } catch (uploadError) {
                  console.error("Error uploading image trasera:", uploadError);
                }
              }

              setTxResult({
                status: "success",
                title: "¡Suscripción Activa!",
                message:
                  "Tu tarjeta fue guardada exitosamente. Tu donación mensual se procesará automáticamente.",
              });
            })
            .catch((err) => {
              console.error("Error al guardar suscripción", err);
              setTxResult({
                status: "error",
                title: "Atención",
                message:
                  "Tu tarjeta fue validada, pero hubo un problema activando la suscripción. Contáctanos.",
              });
            });
        } else if (response.card && response.card.status !== "valid") {
          setStatus("error");
          setTxResult({
            status: "error",
            title: "Tarjeta Rechazada",
            message:
              response.card.message ||
              "Tu tarjeta fue rechazada por el banco o la pasarela. Por favor intenta con otra.",
          });
        } else {
          setStatus("error");
          setTxResult({
            status: "error",
            title: "Respuesta Desconocida",
            message: "El servidor devolvió una respuesta no reconocida.",
          });
        }
      };

      const notCompletedFormCallback = (msg: string) => {
        setStatus("error");
        setMessage(
          `Formulario incompleto: ${msg}. Por favor llena todos los datos de tu tarjeta.`,
        );
      };

      sdk.generate_tokenize(
        get_tokenize_data(),
        "#tokenize_example",
        responseCallback,
        notCompletedFormCallback,
      );
    } catch (err) {
      console.error("[nuvei] Error al inicializar tokenización:", err);
      setStatus("error");
      setMessage("Error al cargar el formulario de tarjeta.");
    }
  }, [
    isRecurring,
    tokenizeSdkReady,
    userId,
    email,
    cedula,
    nombre,
    cedulaFileFront,
    cedulaFileBack,
  ]);

  // Click: fetch + open encadenados con .then() para mantener el user gesture
  const handlePay = async () => {
    if (isRecurring) {
      if (!pgSdk) {
        setStatus("error");
        setMessage("El formulario de tarjeta aún no está listo.");
        return;
      }
      setStatus("processing");
      setMessage("Procesando tarjeta de forma segura...");
      pgSdk.tokenize();
      return;
    }

    if (!checkoutInstance) {
      setStatus("error");
      setMessage("El procesador de pagos aún no está listo.");
      return;
    }

    setStatus("loading");
    setMessage("Preparando el checkout seguro...");

    const devReference = `DON-${Date.now()}`;
    currentDevRef.current = devReference; // Actualizamos la referencia persistente

    try {
      setStatus("processing");
      setMessage("Abriendo ventana de pago...");

      if (checkoutInstance) {
        // 1. Obtener Token de Referencia desde el Backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const finalEmail = email || "donante@baq.ec";
        const initRes = await fetch(`${apiUrl}/nuvei/init`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            userEmail: String(finalEmail),
            amount: Number(monto),
            devReference: devReference,
            description: isRecurring
              ? `Suscripción mensual BAQ - $${monto} USD`
              : `Donación BAQ - $${monto} USD`,
            isRecurring,
          }),
        });

        if (!initRes.ok) {
          const errorData = await initRes.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              errorData.message ||
              "Fallo en el servidor al inicializar transacción",
          );
        }

        const data = await initRes.json();

        if (!data.reference) {
          throw new Error("El servidor no devolvió una referencia válida");
        }

        // 2. Implementación de Checkout SDK v3 (PaymentCheckout.modal)
        (checkoutInstance as any).open({
          reference: data.reference,
        });
      } else {
        throw new Error("El SDK de Nuvei no está listo");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      console.error("[handlePay] Error:", msg);
      setStatus("error");
      setMessage(`No se pudo iniciar el pago: ${msg}`);
    }
  };

  if (monto <= 0) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">
            No se especificó un monto válido para el pago.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!preStepConfirmed) {
    if (isRecurring) {
      const handlePreStepSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        // Validate Nombre
        if (!nombre.trim()) {
          newErrors.nombre = "El nombre completo es requerido";
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!inputEmail.trim()) {
          newErrors.email = "El correo es requerido";
        } else if (!emailRegex.test(inputEmail)) {
          newErrors.email = "Correo inválido";
        }

        // Validate Cedula
        const cedulaValidator = new CedulaValidator();
        if (!cedula.trim()) {
          newErrors.cedula = "La cédula o RUC es requerida";
        } else if (!cedulaValidator.validate(cedula)) {
          newErrors.cedula = "La cédula o RUC no es válida";
        }

        // Validate Files
        if (!cedulaFileFront) {
          newErrors.cedulaFront = "La foto frontal de la cédula es requerida";
        }
        if (!cedulaFileBack) {
          newErrors.cedulaBack = "La foto trasera de la cédula es requerida";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
          setPreStepConfirmed(true);
        }
      };

      return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 py-12">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-xl w-full text-center relative overflow-hidden">
            <div className="mb-6">
              <Image
                src="/payment-logos/nuvei-logo.png"
                alt="Nuvei"
                width={120}
                height={40}
                className="mx-auto h-10 w-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-[#2F3388] mb-2">
              Paso Previo - Donación Recurrente
            </h1>
            <p className="text-gray-600 mb-6 text-sm">
              Ingresa tus datos personales y las fotos de tu cédula (frontal y
              trasera) para continuar con el débito recurrente seguro.
            </p>

            <form
              onSubmit={handlePreStepSubmit}
              className="flex flex-col gap-5 text-left"
            >
              {/* Nombre Completo */}
              <div>
                <label
                  htmlFor="nombreInput"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Nombres Completos *
                </label>
                <input
                  id="nombreInput"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errors.nombre) setErrors({ ...errors, nombre: "" });
                  }}
                  placeholder="Ej: Juan Carlos Pérez González"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C800A1] focus:border-transparent transition text-gray-800 ${
                    errors.nombre
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* Correo Electrónico */}
              <div>
                <label
                  htmlFor="emailInput"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Correo Electrónico *
                </label>
                <input
                  id="emailInput"
                  type="email"
                  required
                  value={inputEmail}
                  onChange={(e) => {
                    setInputEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  placeholder="tu@correo.com"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C800A1] focus:border-transparent transition text-gray-800 ${
                    errors.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Cédula / RUC */}
              <div>
                <label
                  htmlFor="cedulaInput"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Cédula / RUC *
                </label>
                <input
                  id="cedulaInput"
                  type="text"
                  required
                  maxLength={13}
                  value={cedula}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setCedula(val);
                    if (errors.cedula) setErrors({ ...errors, cedula: "" });
                  }}
                  placeholder="Ej: 1710034065"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C800A1] focus:border-transparent transition text-gray-800 ${
                    errors.cedula
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.cedula && (
                  <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>
                )}
              </div>

              {/* Uploads Section */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-[#2F3388] uppercase tracking-wider border-b pb-2">
                  Fotos de Cédula
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Front Image Upload */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Subir imagen (Cédula frontal) *
                    </span>

                    {!cedulaPreviewFront ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingFront(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDraggingFront(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingFront(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              setErrors({
                                ...errors,
                                cedulaFront:
                                  "El archivo no debe pesar más de 5MB",
                              });
                              return;
                            }
                            setCedulaFileFront(file);
                            const reader = new FileReader();
                            reader.onloadend = () =>
                              setCedulaPreviewFront(reader.result as string);
                            reader.readAsDataURL(file);
                            if (errors.cedulaFront)
                              setErrors({ ...errors, cedulaFront: "" });
                          }
                        }}
                        className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group min-h-[160px] ${
                          isDraggingFront
                            ? "border-[#C800A1] bg-[#C800A1]/5 scale-[1.02]"
                            : errors.cedulaFront
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200 bg-gray-50 hover:border-[#C800A1] hover:bg-[#C800A1]/5"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                setErrors({
                                  ...errors,
                                  cedulaFront:
                                    "El archivo no debe pesar más de 5MB",
                                });
                                return;
                              }
                              setCedulaFileFront(file);
                              const reader = new FileReader();
                              reader.onloadend = () =>
                                setCedulaPreviewFront(reader.result as string);
                              reader.readAsDataURL(file);
                              if (errors.cedulaFront)
                                setErrors({ ...errors, cedulaFront: "" });
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        <Upload className="w-6 h-6 text-[#C800A1] mb-2 group-hover:scale-110 transition-transform duration-300" />
                        <p className="text-gray-600 font-semibold text-xs text-center">
                          <span className="text-[#C800A1] font-bold">
                            Clic para subir
                          </span>
                          <br />o arrastra la imagen aquí
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          PNG, JPG (Max. 5MB)
                        </p>
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-[#C800A1] shadow-md group h-[160px]">
                        <img
                          src={cedulaPreviewFront}
                          alt="Vista previa cédula frontal"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setCedulaFileFront(null);
                              setCedulaPreviewFront(null);
                            }}
                            className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                    {errors.cedulaFront && (
                      <p className="text-red-500 text-xs pl-1">
                        {errors.cedulaFront}
                      </p>
                    )}
                  </div>

                  {/* Back Image Upload */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Subir imagen (Cédula trasera) *
                    </span>

                    {!cedulaPreviewBack ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingBack(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDraggingBack(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingBack(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              setErrors({
                                ...errors,
                                cedulaBack:
                                  "El archivo no debe pesar más de 5MB",
                              });
                              return;
                            }
                            setCedulaFileBack(file);
                            const reader = new FileReader();
                            reader.onloadend = () =>
                              setCedulaPreviewBack(reader.result as string);
                            reader.readAsDataURL(file);
                            if (errors.cedulaBack)
                              setErrors({ ...errors, cedulaBack: "" });
                          }
                        }}
                        className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group min-h-[160px] ${
                          isDraggingBack
                            ? "border-[#C800A1] bg-[#C800A1]/5 scale-[1.02]"
                            : errors.cedulaBack
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200 bg-gray-50 hover:border-[#C800A1] hover:bg-[#C800A1]/5"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                setErrors({
                                  ...errors,
                                  cedulaBack:
                                    "El archivo no debe pesar más de 5MB",
                                });
                                return;
                              }
                              setCedulaFileBack(file);
                              const reader = new FileReader();
                              reader.onloadend = () =>
                                setCedulaPreviewBack(reader.result as string);
                              reader.readAsDataURL(file);
                              if (errors.cedulaBack)
                                setErrors({ ...errors, cedulaBack: "" });
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        <Upload className="w-6 h-6 text-[#C800A1] mb-2 group-hover:scale-110 transition-transform duration-300" />
                        <p className="text-gray-600 font-semibold text-xs text-center">
                          <span className="text-[#C800A1] font-bold">
                            Clic para subir
                          </span>
                          <br />o arrastra la imagen aquí
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          PNG, JPG (Max. 5MB)
                        </p>
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-[#C800A1] shadow-md group h-[160px]">
                        <img
                          src={cedulaPreviewBack}
                          alt="Vista previa cédula trasera"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setCedulaFileBack(null);
                              setCedulaPreviewBack(null);
                            }}
                            className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                    {errors.cedulaBack && (
                      <p className="text-red-500 text-xs pl-1">
                        {errors.cedulaBack}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#C800A1] text-white py-3.5 rounded-xl hover:bg-[#a00081] transition font-bold shadow-md hover:shadow-lg active:scale-98"
              >
                Continuar
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full py-2 text-gray-500 hover:text-gray-700 transition text-sm underline text-center"
              >
                Cancelar y volver
              </button>
            </form>
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="mb-4">
              <Image
                src="/payment-logos/nuvei-logo.png"
                alt="Nuvei"
                width={120}
                height={40}
                className="mx-auto h-10 w-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-[#2F3388] mb-2">
              Paso Previo
            </h1>
            <p className="text-gray-600 mb-6">
              Ingresa tu correo electrónico para vincular tu donación y
              continuar de forma segura.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputEmail.trim()) {
                  setPreStepConfirmed(true);
                }
              }}
              className="flex flex-col gap-4 text-left"
            >
              <div>
                <label
                  htmlFor="emailInput"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Correo Electrónico
                </label>
                <input
                  id="emailInput"
                  type="email"
                  required
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C800A1] focus:border-transparent transition"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#C800A1] text-white py-3 rounded-lg hover:bg-[#a00081] transition font-semibold"
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full py-3 text-gray-500 hover:text-gray-700 transition text-sm underline"
              >
                Cancelar y volver
              </button>
            </form>
          </div>
        </div>
      );
    }
  }

  return (
    <>
      {/* SDK de Nuvei Checkout v3 (Pago Único) */}
      {!isRecurring && (
        <Script
          src="https://cdn.paymentez.com/ccapi/sdk/payment_checkout_3.0.0.min.js"
          strategy="afterInteractive"
          onLoad={() => {
            console.log("[nuvei] SDK Checkout cargado");
            setSdkReady(true);
          }}
          onError={() => {
            console.error("[nuvei] Error cargando SDK Checkout");
            setStatus("error");
            setMessage("No se pudo cargar el procesador de pagos.");
          }}
        />
      )}

      {/* SDK de Nuvei Tokenize (Pago Mensual) */}
      {isRecurring && (
        <Script
          src="https://cdn.paymentez.com/ccapi/sdk/payment_sdk_stable.min.js"
          strategy="afterInteractive"
          onLoad={() => {
            console.log("[nuvei] SDK Tokenize cargado");
            setTokenizeSdkReady(true);
          }}
          onError={() => {
            console.error("[nuvei] Error cargando SDK Tokenize");
            setStatus("error");
            setMessage(
              "No se pudo cargar el procesador de pagos para suscripciones.",
            );
          }}
        />
      )}

      <div className="min-h-screen bg-blue-50 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
              >
                <span>←</span> Volver
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Monto a pagar</p>
                <p className="text-2xl font-bold text-blue-600">${monto} USD</p>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-3">
                <Image
                  src="/payment-logos/nuvei-logo.png"
                  alt="Nuvei"
                  width={120}
                  height={40}
                  className="mx-auto h-10 w-auto"
                />
              </div>
              <h1 className="text-3xl font-bold text-[#2F3388] mb-2">
                {isRecurring
                  ? "Suscripción Mensual — Nuvei"
                  : "Pago con Tarjeta — Nuvei"}
              </h1>
              <p className="text-gray-600">
                {isRecurring
                  ? "Se cobrará automáticamente cada mes"
                  : "Completa tu donación de forma segura"}
              </p>
              {isRecurring && (
                <div className="mt-3 inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
                  </svg>
                  Cobro mensual recurrente
                </div>
              )}
            </div>
          </div>

          {/* Formulario de datos (recurrente) + Botón de pago */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            {/* Contenedor del formulario dinámico de Tokenization */}
            {isRecurring && (
              <div className="w-full mb-6 space-y-4">
                <p className="text-sm text-gray-500 font-medium mb-2">
                  Datos de la tarjeta:
                </p>
                <div
                  id="tokenize_example"
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-inner min-h-[250px]"
                ></div>
              </div>
            )}

            {isRecurring ? (
              <button
                onClick={handlePay}
                disabled={
                  status === "loading" ||
                  status === "processing" ||
                  !tokenizeSdkReady
                }
                className="w-full py-3 mt-2 rounded-md font-bold text-[17px] shadow-sm transition active:scale-[0.98] flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(140, 197, 65, 1) 0%, rgba(20, 167, 81, 1) 100%)",
                  color: "#fff",
                  border: "1px solid rgba(46, 86, 153, 0.0980392)",
                  borderBottomColor: "rgba(46, 86, 153, 0.4)",
                  borderTop: "0",
                  textShadow: "rgba(46, 86, 153, 0.298039) 0px -1px 0px",
                  opacity:
                    status === "loading" ||
                    status === "processing" ||
                    !tokenizeSdkReady
                      ? 0.65
                      : 1,
                  cursor:
                    status === "loading" ||
                    status === "processing" ||
                    !tokenizeSdkReady
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {!tokenizeSdkReady
                  ? "Cargando formulario..."
                  : status === "loading" || status === "processing"
                    ? "Procesando..."
                    : "Guardar Tarjeta y Suscribirme"}
              </button>
            ) : (
              <button
                onClick={handlePay}
                disabled={
                  status === "loading" || status === "processing" || !sdkReady
                }
                className="w-full py-4 rounded-lg font-semibold text-lg transition active:scale-[0.98]"
                style={{
                  background:
                    status === "loading" || status === "processing"
                      ? "#9ca3af"
                      : !sdkReady
                        ? "#d1d5db"
                        : "#C800A1",
                  color:
                    !sdkReady &&
                    !(status === "loading" || status === "processing")
                      ? "#6b7280"
                      : "#ffffff",
                  cursor:
                    status === "loading" || status === "processing"
                      ? "not-allowed"
                      : !sdkReady
                        ? "wait"
                        : "pointer",
                }}
              >
                {!sdkReady
                  ? "Cargando procesador..."
                  : status === "loading"
                    ? "Iniciando pago..."
                    : status === "processing"
                      ? "Procesando..."
                      : "💳 Pagar con tarjeta"}
              </button>
            )}

            {/* Status Box (Opcional si usas modal) */}
            {message && !txResult && (
              <div
                className={`mt-4 p-3 rounded-lg text-sm w-full text-center ${
                  status === "processing" || status === "loading"
                    ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                    : status === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : status === "error"
                        ? "bg-red-50 text-red-800 border border-red-200"
                        : ""
                }`}
              >
                {message}
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="bg-orange-50 rounded-xl p-4 mt-6">
            <h3 className="font-semibold text-orange-800 mb-2">
              Información importante:
            </h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• El pago se procesa de forma segura a través de Nuvei</li>
              <li>• Se aceptan tarjetas Visa, MasterCard y Diners</li>
              <li>• Recibirás una confirmación por correo electrónico</li>
              <li>• Tu donación ayudará directamente al Banco de Alimentos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL DE RESULTADO */}
      <AnimatePresence>
        {txResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              {/* Header decorativo */}
              <div
                className={`h-3 w-full ${txResult.status === "success" ? "bg-green-500" : "bg-red-500"}`}
              />

              <div className="p-8 text-center flex flex-col items-center">
                {/* Ícono animado */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg ${
                    txResult.status === "success"
                      ? "bg-green-100 text-green-500"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {txResult.status === "success" ? (
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {txResult.title}
                </h3>

                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  {txResult.message}
                </p>

                <div className="w-full">
                  {txResult.status === "success" ? (
                    <button
                      onClick={() => router.push("/thank-you")}
                      className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white text-lg font-bold rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      Continuar
                    </button>
                  ) : (
                    <button
                      onClick={() => setTxResult(null)}
                      className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 text-lg font-bold rounded-2xl transition-all shadow-sm active:scale-95"
                    >
                      Intentar con otra tarjeta
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function NuveiPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-blue-600 font-semibold">
              Cargando página de pago...
            </p>
          </div>
        </div>
      }
    >
      <NuveiPageContent />
    </Suspense>
  );
}
