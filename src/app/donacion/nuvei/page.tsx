"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";

// ── Tipos ───────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    PaymentCheckout: {
      modal: new (config: {
        client_app_code: string;
        client_app_key: string;
        locale?: string;
        env_mode: string;
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
  const email = searchParams.get("email") || "";
  const userId = searchParams.get("user_id") || `user_${Date.now()}`;

  const [status, setStatus] = useState<
    "idle" | "loading" | "processing" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [sdkReady, setSdkReady] = useState(false);
  const [checkoutInstance, setCheckoutInstance] =
    useState<NuveiCheckoutInstance | null>(null);

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
    const clientAppCode = process.env.NEXT_PUBLIC_NUVEI_CLIENT_CODE;
    const clientAppKey = process.env.NEXT_PUBLIC_NUVEI_CLIENT_KEY;

    try {
      const instance = new window.PaymentCheckout.modal({
        client_app_code: clientAppCode,
        client_app_key: clientAppKey,
        locale: "es",
        env_mode: nuveiEnv,

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
  }, [sdkReady]);

  // Click: fetch + open encadenados con .then() para mantener el user gesture
  const handlePay = () => {
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
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/baq";
        const initRes = await fetch(`${apiUrl}/nuvei/init`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: String(userId || `user_${Date.now()}`),
            userEmail: String(email || "donante@baq.ec"),
            amount: Number(monto),
            devReference: devReference,
            description: `Donación BAQ - $${monto} USD`,
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

  return (
    <>
      {/* jQuery primero, luego SDK de Nuvei en cadena para garantizar orden */}
      <Script
        src="https://code.jquery.com/jquery-3.5.0.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("[nuvei] jQuery cargado");
          const script = document.createElement("script");
          script.src =
            "https://cdn.paymentez.com/ccapi/sdk/payment_checkout_3.0.0.min.js";
          script.onload = () => {
            console.log("[nuvei] SDK cargado");
            setSdkReady(true);
          };
          script.onerror = () => {
            console.error("[nuvei] Error cargando SDK");
            setStatus("error");
            setMessage(
              "No se pudo cargar el procesador de pagos. Intenta recargar la página.",
            );
          };
          document.head.appendChild(script);
        }}
        onError={() => {
          console.error("[nuvei] Error cargando jQuery");
          setStatus("error");
          setMessage(
            "No se pudo cargar el procesador de pagos. Intenta recargar la página.",
          );
        }}
      />

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
                Pago con Tarjeta — Nuvei
              </h1>
              <p className="text-gray-600">
                Completa tu donación de forma segura
              </p>
            </div>
          </div>

          {/* Botón de pago */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <button
              onClick={handlePay}
              disabled={
                status === "loading" || status === "processing" || !sdkReady
              }
              className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
                status === "loading" || status === "processing"
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : !sdkReady
                    ? "bg-gray-300 cursor-wait text-gray-500"
                    : "bg-red-600 hover:bg-red-700 text-white active:scale-[0.98]"
              }`}
            >
              {!sdkReady
                ? "Cargando procesador..."
                : status === "loading"
                  ? "Iniciando pago..."
                  : status === "processing"
                    ? "Procesando..."
                    : "💳 Pagar con tarjeta"}
            </button>

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
