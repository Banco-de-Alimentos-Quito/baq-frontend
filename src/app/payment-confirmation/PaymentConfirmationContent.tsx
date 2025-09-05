"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PaymentService } from "../services/paymentService";
import { getOrCreateUserId } from "../utils/utils";

export default function PaymentConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<
    "processing" | "success" | "error" | "failed"
  >("processing");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const processPayment = async () => {
      // Verificar si ya se procesó esta transacción específica
      const id = searchParams.get("id");
      const clientTransactionId = searchParams.get("clientTransactionId");

      if (!id || !clientTransactionId) {
        setStatus("error");
        setMessage("Parámetros de transacción inválidos o incompletos");
        return;
      }

      // Comprobar si esta transacción ya fue procesada
      const processedTransactions = JSON.parse(
        localStorage.getItem("processedTransactions") || "{}"
      );
      const transactionKey = `${id}-${clientTransactionId}`;

      if (processedTransactions[transactionKey]) {
        router.replace("/thank-you");
        return;
      }

      const userId = getOrCreateUserId();

      const numericId = Number(id);

      try {
        const response = await PaymentService.confirmPayPhoneTransaction(
          numericId,
          clientTransactionId,
          userId
        );

        if (response.status === "Approved" || response.status === "Aproved") {
          // Registrar esta transacción como procesada
          processedTransactions[transactionKey] = {
            timestamp: new Date().toISOString(),
            amount: response.amount || 0,
          };
          localStorage.setItem(
            "processedTransactions",
            JSON.stringify(processedTransactions)
          );

          // Continuar con el flujo normal
          setStatus("success");
          setMessage(response.message || "Transacción confirmada exitosamente");

          setTimeout(() => {
            router.push("/thank-you");
          }, 3000);
        } else if (response.status === "Cancelado") {
          setStatus("failed");
          setMessage(response.message || "La Transacción ha sido cancelada");
        } else {
          setStatus("error");
          setError("Error al procesar el pago");
        }
      } catch (error) {
        console.error("💥 Error al confirmar transacción:", error);
        setStatus("error");
        setMessage("Error de conexión al confirmar la transacción");
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
        {/* Estado: Éxito */}
        {status === "success" && (
          <>
            <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-green-600"
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
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              ¡Pago Exitoso!
            </h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
              Redirigiendo a la página de agradecimiento...
            </p>
          </>
        )}

        {/* Estado: Error */}
        {status === "error" && (
          <>
            <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Error en el Pago
            </h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push("/donacion")}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Volver al inicio
            </button>
          </>
        )}

        {/* Estado: Fallido - AGREGAR ESTE BLOQUE */}
        {status === "failed" && (
          <>
            <div className="bg-yellow-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-yellow-600 mb-2">
              Pago No Aprobado
            </h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push("/donacion")}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Volver al inicio
            </button>
          </>
        )}
      </div>
    </div>
  );
}
