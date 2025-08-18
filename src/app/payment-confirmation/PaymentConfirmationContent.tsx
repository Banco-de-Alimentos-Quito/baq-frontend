"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PaymentService } from "../services/paymentService";
import { getOrCreateUserId } from "../utils/utils";

export default function PaymentConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      // Capturar parámetros de PayPhone
      const id = searchParams.get("id");
      const clientTransactionId = searchParams.get("clientTransactionId");
      const userId = getOrCreateUserId();
      console.log("El userId para enviar al backend es", userId)

      // Si faltan parámetros, igual redirige
      if (!id || !clientTransactionId) {
        setTimeout(() => {
          router.push("/thank-you");
        }, 2000);
        return;
      }

      // Enviar al backend para confirmar (ignora errores)
      try {
        await PaymentService.confirmPayPhoneTransaction(
          id,
          clientTransactionId,
          userId
        );
      } catch (error) {
        //Mandar al servidor
      }

      // Redirigir a thank-you después de 2 segundos
      setTimeout(() => {
        router.push("/thank-you");
      }, 2000);
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
      </div>
    </div>
  );
}
