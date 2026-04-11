"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Script from "next/script";

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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/baq";

  // Polling para verificar status del webhook
  const pollOrderStatus = useCallback(
    async (devReference: string, attempts = 0) => {
      if (attempts > 10) {
        setStatus("success");
        setMessage(
          "✓ Pago enviado. Recibirás un email de confirmación pronto."
        );
        return;
      }

      await new Promise((r) => setTimeout(r, 2000));

      try {
        const res = await fetch(`${apiUrl}/nuvei/status/${devReference}`);
        const data = await res.json();

        if (data.status === "paid") {
          setStatus("success");
          setMessage("✓ ¡Pago confirmado! Revisa tu correo electrónico.");
          setTimeout(() => router.push("/thank-you"), 2000);
        } else if (data.status === "failed") {
          setStatus("error");
          setMessage(
            "El pago fue rechazado. Intenta con otra tarjeta."
          );
        } else {
          pollOrderStatus(devReference, attempts + 1);
        }
      } catch {
        pollOrderStatus(devReference, attempts + 1);
      }
    },
    [router, apiUrl]
  );

  // Inicializar el modal de Nuvei cuando el SDK esté listo
  useEffect(() => {
    if (!sdkReady || !window.PaymentCheckout) return;

    const nuveiEnv = process.env.NEXT_PUBLIC_NUVEI_ENV || "stg";
    const clientAppCode = process.env.NEXT_PUBLIC_NUVEI_CLIENT_CODE || "NUVEISTG-EC-CLIENT";
    const clientAppKey = process.env.NEXT_PUBLIC_NUVEI_CLIENT_KEY || "rvpKAv2tc49x6YL38fvtv5jJxRRiPs";

    console.log("[nuvei] Inicializando modal con:", {
      client_app_code: clientAppCode,
      client_app_key: clientAppKey ? clientAppKey.substring(0, 6) + "..." : "VACÍA",
      env_mode: nuveiEnv,
    });

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
            setMessage(`Error: ${response.error.description}`);
            return;
          }

          const tx = response.transaction;
          if (!tx) return;

          if (tx.status === "success" && tx.status_detail === 3) {
            setStatus("success");
            setMessage(
              `✓ Pago procesado. Verificando con el banco... (TX: ${tx.id})`
            );
            pollOrderStatus(`DON-${Date.now()}`);
          } else {
            setStatus("error");
            setMessage(
              `Pago no completado. Estado: ${tx.status} (detalle: ${tx.status_detail})`
            );
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
    setMessage("Conectando con el procesador de pagos...");

    const devReference = `DON-${Date.now()}`;

    fetch(`${apiUrl}/nuvei/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        userEmail: email || "donante@baq.ec",
        amount: monto,
        description: `Donación BAQ - $${monto} USD`,
        devReference,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error del servidor");
        return res.json();
      })
      .then(({ reference }) => {
        console.log("[nuvei] Reference obtenida:", reference);
        setStatus("processing");
        setMessage("Abriendo ventana de pago...");
        checkoutInstance.open({ reference });
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        console.error("[handlePay] Error:", msg);
        setStatus("error");
        setMessage(`No se pudo iniciar el pago: ${msg}`);
      });
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
          script.src = "https://cdn.paymentez.com/ccapi/sdk/payment_checkout_3.0.0.min.js";
          script.onload = () => {
            console.log("[nuvei] SDK cargado");
            setSdkReady(true);
          };
          script.onerror = () => {
            console.error("[nuvei] Error cargando SDK");
            setStatus("error");
            setMessage("No se pudo cargar el procesador de pagos. Intenta recargar la página.");
          };
          document.head.appendChild(script);
        }}
        onError={() => {
          console.error("[nuvei] Error cargando jQuery");
          setStatus("error");
          setMessage("No se pudo cargar una dependencia requerida.");
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
                <p className="text-2xl font-bold text-blue-600">
                  ${monto} USD
                </p>
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
                status === "loading" ||
                status === "processing" ||
                !sdkReady
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

            {/* Status Box */}
            {message && (
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

          {/* Tarjetas de prueba (solo en staging) */}
          {(process.env.NEXT_PUBLIC_NUVEI_ENV === "stg" ||
            !process.env.NEXT_PUBLIC_NUVEI_ENV) && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
              <h3 className="font-semibold text-blue-800 mb-2">
                🧪 Tarjetas de prueba (staging)
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  Exitosa: <code className="bg-blue-100 px-1 rounded">4111111111111111</code>
                </p>
                <p>
                  Fallida: <code className="bg-blue-100 px-1 rounded">4242424242424242</code>
                </p>
                <p>
                  CVV: <code className="bg-blue-100 px-1 rounded">634</code> &nbsp; Exp:{" "}
                  <code className="bg-blue-100 px-1 rounded">01/28</code>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
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
