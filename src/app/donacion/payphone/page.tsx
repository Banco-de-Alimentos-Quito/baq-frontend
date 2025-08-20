"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PayphoneButton from "../../components/PayPhone";

function PayphonePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [monto, setMonto] = useState<number>(0);
  const [reference, setReference] = useState<string>("");

  useEffect(() => {
    const montoParam = searchParams.get("monto");
    const referenceParam = searchParams.get("reference");

    if (montoParam) {
      setMonto(parseFloat(montoParam));
    }

    if (referenceParam) {
      setReference(referenceParam);
    } else {
      setReference(`Donación BAQ - ${montoParam} USD`);
    }
  }, [searchParams]);

  const handleSuccess = (response: any) => {
    console.log("Pago exitoso:", response);
    router.push("/thank-you");
  };

  const handleError = (error: any) => {
    console.error("Error en el pago:", error);
    // Manejar error
  };
  const goBack = () => {
    router.back();
  };

  if (monto <= 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">
            No se especificó un monto válido para el pago.
          </p>
          <button
            onClick={goBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

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
              <p className="text-sm text-gray-500">Monto a pagar</p>
              <p className="text-2xl font-bold text-blue-600">${monto} USD</p>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#2F3388] mb-2">
              Pago con Payphone
            </h1>
            <p className="text-gray-600">
              Completa tu donación de forma segura
            </p>
          </div>
        </div>

        {/* Componente de Payphone */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <div className="w-full flex justify-center">
            <PayphoneButton
              amount={monto}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 rounded-xl p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">
            Información importante:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• El pago se procesa de forma segura a través de Payphone</li>
            <li>• Recibirás una confirmación por correo electrónico</li>
            <li>• Tu donación ayudará directamente al Banco de Alimentos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function PayphonePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-600 font-semibold">
              Cargando página de pago...
            </p>
          </div>
        </div>
      }
    >
      <PayphonePageContent />
    </Suspense>
  );
}
