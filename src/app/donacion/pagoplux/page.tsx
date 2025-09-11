"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PpxButton from "../../components/PluxButton";
import { generatePayboxData } from "../../configuration/ppx.data";
import Image from "next/image";
import PaymentMaintenanceModal from "@/app/components/PaymentMaintenanceModal";

function PagoPluxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [payboxData, setPayboxData] = useState(null);

  const monto = searchParams.get("monto");
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");

  // Recuperar dirección de URL o sessionStorage
  const direccionFromURL = searchParams.get("direccion");
  const direccion = direccionFromURL
    ? decodeURIComponent(direccionFromURL)
    : sessionStorage.getItem("direccionDonador") || "";

  useEffect(() => {
    // Verificar que todos los parámetros estén presentes
    if (!monto || !email || !phone) {
      //alert("Datos de pago incompletos. Redirigiendo...");
      //router.push("/donacion");
      //return;
    }

    // Generar los datos de configuración para PagoPlux
    const data = generatePayboxData(monto, email, phone);

    setPayboxData(data);
    setIsLoading(false);
  }, [monto, email, phone, router]);

  const handleGoBack = () => {
    router.push("/donacion");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-600">
            Preparando pago...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <Image
              src="/icono-logo-naranja.webp"
              alt="Banco de Alimentos Quito"
              width={120}
              height={60}
              className="mx-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Finalizar Donación
          </h1>
          <p className="text-gray-600">
            Monto:{" "}
            <span className="font-bold text-orange-600">${monto} USD</span>
          </p>
        </div>

        {/* Información del usuario */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Datos de contacto:
          </h3>
          <p className="text-sm text-gray-600">📧 {email}</p>
          <p className="text-sm text-gray-600">📱 {phone}</p>
        </div>

        {/* Botón de PagoPlux */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Haz clic en el botón para proceder con el pago
          </p>
          {payboxData && (
            <div className="flex justify-center">
              <PpxButton data={{...(typeof payboxData === "object" && payboxData !== null ? payboxData : {}), direccion: direccion}} />
            </div>
          )}
        </div>

        {/* Botón de regresar */}
        <div className="flex justify-center">
          <button
            onClick={handleGoBack}
            className="text-orange-600 hover:text-orange-800 font-semibold transition-colors duration-200"
          >
            ← Regresar a donaciones
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            🔒 Tu información está protegida con SSL
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Procesado por PagoPlux - Plataforma segura de pagos
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PagoPluxPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <PagoPluxContent />
    </Suspense>
  );
}
