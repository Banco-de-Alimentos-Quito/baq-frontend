"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PayphoneButton from "../../components/PayPhone";
import PaymentMaintenanceModal from "@/app/components/PaymentMaintenanceModal";
import { useFormStore } from "@/app/store/formStore";

// Componente modal para la dirección
function AddressModal({
  isOpen,
  onClose,
  direccion,
  setDireccion,
  ciudad,
  setCiudad,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-[#2F3388]">
          Dirección para factura
        </h2>
        <p className="text-gray-600 mb-4">
          Para montos desde USD 50, necesitamos tu dirección para la factura.
        </p>
        <input
          className="border rounded-lg px-3 py-2 w-full mb-4"
          placeholder="Dirección para factura"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
        <input
          className="border rounded-lg px-3 py-2 w-full mb-4"
          placeholder="Ciudad"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!direccion.trim()}
            className={`rounded-lg px-4 py-2 text-white ${
              direccion.trim()
                ? "bg-orange-600 hover:bg-blue-700"
                : "bg-orange-300 cursor-not-allowed"
            } transition`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

function PayphonePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [monto, setMonto] = useState<number>(0);
  const [reference, setReference] = useState<string>("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  // Estado para controlar la visibilidad del modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  // Estado para saber si ya se confirmó la dirección
  const [addressConfirmed, setAddressConfirmed] = useState(false);

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

  const isHighAmount = monto >= 50;
  const billingValid = !isHighAmount || addressConfirmed;

  // Función para iniciar el pago
  const handleInitiatePayment = () => {
    if (isHighAmount && !addressConfirmed) {
      setShowAddressModal(true);
    }
  };

  // Función para confirmar la dirección
  const handleConfirmAddress = () => {
    if (direccion.trim()) {
      useFormStore.setState({
        direccion,
        ciudad,
      });
      setAddressConfirmed(true);
      setShowAddressModal(false);
    }
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

        {/* Modal para dirección */}
        <AddressModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          direccion={direccion}
          setDireccion={setDireccion}
          ciudad={ciudad}
          setCiudad={setCiudad}
          onConfirm={handleConfirmAddress}
        />

        {/* Componente de Payphone */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <div className="w-full flex justify-center">
            {isHighAmount && !addressConfirmed ? (
              <button
                onClick={handleInitiatePayment}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
              >
                Continuar con el pago
              </button>
            ) : (
              <PayphoneButton
                amount={monto}
                reference={reference || `Donación BAQ - ${monto} USD`}
                metadata={{ direccion, ciudad }}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}
          </div>

          {isHighAmount && (
            <p className="text-sm text-gray-600 mt-3">
              {addressConfirmed
                ? "Dirección de facturación registrada ✓"
                : "Para montos desde USD 50, se requiere dirección para la factura"}
            </p>
          )}
        </div>

        {/* Información adicional */}
        <div className="bg-orange-50 rounded-xl p-4 mt-6">
          <h3 className="font-semibold text-orange-800 mb-2">
            Información importante:
          </h3>
          <ul className="text-sm text-orange-700 space-y-1">
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
