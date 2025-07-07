"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaymentService } from "../services/paymentService";


export default function PaymentConfirmation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Capturar parámetros de PayPhone
        const id = searchParams.get("id");
        const clientTransactionId = searchParams.get("clientTransactionId");

        console.log("🔍 Parámetros de PayPhone:", { id, clientTransactionId });

        if (!id || !clientTransactionId) {
          setError("Parámetros de confirmación no encontrados");
          setStatus("error");
          return;
        }

        // Enviar al backend para confirmar
        await PaymentService.confirmPayPhoneTransaction(
          id,
          clientTransactionId
        );

        setStatus("success");

        // Redirigir a thank-you después de 2 segundos
        setTimeout(() => {
          router.push("/thank-you");
        }, 2000);
      } catch (error) {
        console.error("❌ Error procesando pago:", error);
        setError(error instanceof Error ? error.message : "Error desconocido");
        setStatus("error");
      }
    };

    processPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === "processing" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-blue-600 mb-2">
              Procesando tu pago...
            </h1>
            <p className="text-gray-600">Estamos confirmando tu donación</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              ¡Pago confirmado!
            </h1>
            <p className="text-gray-600 mb-4">
              Tu donación ha sido procesada exitosamente
            </p>
            <p className="text-sm text-gray-500">
              Redirigiendo a la página de agradecimiento...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Error en el pago
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Reintentar
              </button>
              <button
                onClick={() => router.push("/donacion")}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
              >
                Volver a donar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
