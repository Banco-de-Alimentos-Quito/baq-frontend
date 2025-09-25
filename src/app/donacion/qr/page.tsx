"use client";
import React, {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import { getOrCreateUserId } from "@/app/utils/utils";
import { useMobile } from "@/hooks/use-mobile";
import { useFormStore } from "@/app/store/formStore";

// Componente interno que usa useSearchParams
function QRContent() {
  console.log("🎬 === COMPONENTE QRContent CARGADO ===");
  console.log("📅 Timestamp:", new Date().toISOString());
  console.log("🔄 useSearchParams:", useSearchParams());
  console.log("🔄 useRouter:", useRouter());
  console.log("🔄 Image:", Image);
  console.log("🔄 toast:", toast);
  console.log("🔄 Toaster:", Toaster);
  console.log("🎬 === COMPONENTE QRContent CARGADO ===");
  console.log("📅 Timestamp:", new Date().toISOString());

  const params = useSearchParams();
  const cantidad = Number(params.get("monto")) || 0;
  const nombre = params.get("nombre") || "";
  const apellido = params.get("apellido") || "";
  const correo = params.get("correo") || "";
  const telefono = params.get("telefono") || "";
  const documento = params.get("documento") || "";
  const comunidad = params.get("comunidad") || "0";

  const router = useRouter();

  // ✅ VALIDACIÓN: Verificar si el usuario pasó por el formulario
  useEffect(() => {
    const formularioCompletado = sessionStorage.getItem(
      "formulario_completado"
    );
    const montoValidado = sessionStorage.getItem("monto_validado");

    if (!formularioCompletado || montoValidado !== cantidad.toString()) {
      console.log("❌ Usuario no pasó por el formulario, redirigiendo...");
      console.log("🔍 Formulario completado:", formularioCompletado);
      console.log("🔍 Monto validado:", montoValidado);
      console.log("🔍 Monto actual:", cantidad.toString());

      // Redirigir al formulario con el monto
      router.replace(`/donacion/deuna?monto=${cantidad}`);
      return;
    }

    console.log("✅ Usuario validado, puede proceder con QR");
  }, [cantidad, router]);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [correoModal, setCorreoModal] = useState("");
  const [qrData, setQrData] = useState<string>("");
  const [isLoadingQR, setIsLoadingQR] = useState(true);
  const [qrError, setQrError] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [deeplink, setDeeplink] = useState<string>("");
  const [currentTransactionRef, setCurrentTransactionRef] =
    useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const hasInitialized = useRef<boolean>(false);

  // Hook para detectar si es dispositivo móvil
  const isMobile = useMobile();

  // Función para generar el QR dinámicamente
  const generateQR = useCallback(async () => {
    console.log("🚀 === INICIANDO GENERACIÓN DE QR ===");
    console.log("📅 Timestamp:", new Date().toISOString());
    console.log("💰 Monto:", cantidad);
    console.log("👤 Datos del usuario:", {
      nombre,
      apellido,
      correo,
      telefono,
      documento,
      comunidad,
    });
    console.log("🔗 URL actual:", window.location.href);

    // ✅ GUARD: Prevenir ejecuciones múltiples simultáneas
    if (isGenerating) {
      console.log("⚠️ Ya se está generando un QR, saltando ejecución...");
      return;
    }

    if (cantidad <= 0) {
      console.log("❌ Monto inválido:", cantidad);
      setQrError("Monto inválido");
      setIsLoadingQR(false);
      return;
    }

    console.log("✅ Monto válido, procediendo con la generación...");
    try {
      console.log("🔄 Configurando estados de loading...");
      setIsGenerating(true);
      setIsLoadingQR(true);
      setQrError("");

      // ✅ GENERAR newTransactionRef PRIMERO para usar en verificación
      const newTransactionRef = `BAQ-${(
        Date.now().toString() + Math.random().toString().substr(2, 6)
      ).substr(0, 15)}`;
      console.log("🆔 Referencia de transacción generada:", newTransactionRef);

      // ✅ NUEVO: Verificar si ya existe un QR para este monto en sessionStorage
      const storageKey = `qr_data_${cantidad}`;
      const storedQRData = sessionStorage.getItem(storageKey);
      const storedTransactionRef = sessionStorage.getItem(
        `transaction_ref_${cantidad}`
      );

      if (storedQRData && storedTransactionRef) {
        console.log("✅ QR ya existe en sessionStorage, reutilizando...");
        setQrData(storedQRData);
        setCurrentTransactionRef(storedTransactionRef);

        // También restaurar transactionId y deeplink si existen
        const storedTransactionId = sessionStorage.getItem(
          `transaction_id_${cantidad}`
        );
        const storedDeeplink = sessionStorage.getItem(`deeplink_${cantidad}`);

        if (storedTransactionId) {
          setTransactionId(storedTransactionId);
          console.log("💾 TransactionId restaurado:", storedTransactionId);
        }

        if (storedDeeplink) {
          setDeeplink(storedDeeplink);
          console.log("🔗 Deeplink restaurado:", storedDeeplink);
        }

        setIsLoadingQR(false);
        setIsGenerating(false);
        console.log(
          "🎉 === QR REUTILIZADO EXITOSAMENTE (NO HAY ENVÍO AL BACKEND) ==="
        );
        return; // <-- ✅ SALIR SIN GENERAR NUEVO QR
      }

      console.log("🔧 Obteniendo o creando user_id...");
      // Obtener o crear user_id
      const userId = await getOrCreateUserId();
      console.log("👤 User ID obtenido:", userId);

      // ✅ USAR newTransactionRef ya generado
      setCurrentTransactionRef(newTransactionRef);

      // Crear detalle de la transacción - siempre "Donación BAQ"
      const detail = "Donación BAQ";
      console.log("📝 Detalle de transacción:", detail);

      const payload = {
        amount: cantidad,
        detail: detail,
        internalTransactionReference: newTransactionRef,
        qrType: "static",
        format: "2",
      };
      console.log("📦 Payload completo creado:", payload);

      console.log("🖥️ === COMANDO CURL PARA GENERAR QR ===");

      const curlCommand = `curl -X 'POST' 'https://api.baq.ec/api/baq/deuna/payment/request' -H 'accept: application/json' -H 'Content-Type: application/json' -d '${JSON.stringify(
        payload
      )}'`;
      console.log(curlCommand);
      console.log("📋 === PAYLOAD PARA GENERAR QR ===");
      console.log(JSON.stringify(payload, null, 2));
      console.log("=====================================");

      console.log("🌐 === ENVIANDO PETICIÓN PARA GENERAR QR ===");
      console.log("⏱️ Iniciando fetch para generar QR...");

      const response = await fetch(
        "https://api.baq.ec/api/baq/deuna/payment/request",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("📡 === RESPUESTA PARA GENERAR QR ===");
      console.log("🔢 Status code:", response.status);
      console.log("📋 Status text:", response.statusText);
      console.log("🔗 URL de respuesta:", response.url);

      if (!response.ok) {
        console.log("❌ ERROR: La respuesta para generar QR no es exitosa");
        console.log("🔢 Status code de error:", response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("✅ Respuesta exitosa, parseando JSON...");
      const result = await response.json();
      console.log("📊 === RESULTADO COMPLETO PARA GENERAR QR ===");
      console.log("📋 Resultado raw:", result);
      console.log(
        "🆔 TransactionId recibido:",
        result.transactionId || "No disponible"
      );
      console.log("📱 QR recibido:", result.qr ? "SÍ" : "NO");
      console.log("📅 Timestamp de respuesta:", new Date().toISOString());
      console.log("========================================");

      // Log detallado del payload de respuesta en la terminal del frontend
      console.log("🔄 === PAYLOAD DE RESPUESTA DEL QR ===");
      console.log("📋 Response Body completo:");
      console.log(JSON.stringify(result, null, 2));
      console.log("🔍 Campos específicos:");
      console.log("- TransactionId:", result.transactionId || "No disponible");
      console.log("- QR:", result.qr ? "Presente" : "No presente");
      console.log("- Deeplink:", result.deeplink || "No disponible");
      console.log(
        "- Otros campos:",
        Object.keys(result).filter(
          (key) => !["transactionId", "qr", "deeplink"].includes(key)
        )
      );
      console.log("========================================");

      if (result.qr) {
        console.log("✅ QR recibido, configurando estado...");
        setQrData(result.qr);

        // ✅ GUARDAR EN SESSIONSTORAGE para evitar regeneración
        sessionStorage.setItem(storageKey, result.qr);
        sessionStorage.setItem(
          `transaction_ref_${cantidad}`,
          newTransactionRef
        );
        console.log("💾 QR y TransactionRef guardados en sessionStorage");

        // Guardar el transactionId para usarlo en la verificación del status
        if (result.transactionId) {
          setTransactionId(result.transactionId);
          sessionStorage.setItem(
            `transaction_id_${cantidad}`,
            result.transactionId
          );
          console.log(
            "💾 TransactionId guardado en estado y sessionStorage:",
            result.transactionId
          );
        } else {
          console.log("⚠️ No se recibió transactionId en la respuesta");
        }

        // Guardar el deeplink para dispositivos móviles
        if (result.deeplink) {
          setDeeplink(result.deeplink);
          sessionStorage.setItem(`deeplink_${cantidad}`, result.deeplink);
          console.log(
            "🔗 Deeplink guardado en estado y sessionStorage:",
            result.deeplink
          );
        } else {
          console.log("⚠️ No se recibió deeplink en la respuesta");
        }

        // ✅ PREVENIR DUPLICADOS: Solo enviar al backend si NO se ha enviado antes
        const dataAlreadySent = sessionStorage.getItem(
          `data_sent_${newTransactionRef}`
        );
        const deunaEmail = sessionStorage.getItem("deunaEmail");
        const deunaTelefono = sessionStorage.getItem("deunaTelefono");
        const deunaDireccion = sessionStorage.getItem("deunaDireccion");

        const { email, phone, direccion } = useFormStore.getState();

        console.log("🔍 === VERIFICANDO DATOS PARA ENVÍO AL BACKEND ===");
        console.log("📧 Email raw:", email);
        console.log("📱 Teléfono raw:", phone);
        console.log("🏠 Dirección raw:", direccion);
        console.log("🚫 Ya enviado raw:", dataAlreadySent);
        console.log("📱 Teléfono presente:", !!deunaTelefono);
        console.log("🏠 Dirección presente:", !!deunaDireccion);
        console.log("🚫 Ya enviado anteriormente:", !!dataAlreadySent);
        console.log("💾 SessionStorage completo:", {
          deunaEmail: sessionStorage.getItem("deunaEmail"),
          deunaTelefono: sessionStorage.getItem("deunaTelefono"),
          deunaDireccion: sessionStorage.getItem("deunaDireccion"),
          dataSent: sessionStorage.getItem(`data_sent_${newTransactionRef}`),
        });

        try {
          await fetch(`https://api.baq.ec/api/baq/deuna/store-user-data`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              internalTransactionReference: newTransactionRef,
              userId: userId,
              email: email || "",
              telefono: phone,
              direccion: direccion,
            }),
          });

          // ✅ MARCAR COMO ENVIADO para evitar duplicados
          sessionStorage.setItem(`data_sent_${newTransactionRef}`, "true");
          console.log(
            "✅ Datos de DeUna enviados al backend exitosamente y marcado como enviado"
          );
        } catch (storeError) {
          console.error(
            "❌ Error enviando datos de DeUna al backend:",
            storeError
          );
          // No fallar la generación del QR por este error
        }

        console.log("✅ QR configurado exitosamente");
      } else {
        console.log("❌ ERROR: No se recibió el QR en la respuesta");
        throw new Error("No se recibió el QR en la respuesta");
      }
    } catch (error) {
      console.log("💥 === ERROR EN LA GENERACIÓN DE QR ===");
      console.error("❌ Error completo:", error);
      console.log("📋 Tipo de error:", typeof error);
      if (error instanceof Error) {
        console.log("📋 Mensaje de error:", error.message);
        console.log("📋 Stack trace:", error.stack);
      }
      console.log("📅 Timestamp del error:", new Date().toISOString());

      setQrError(
        "Error al generar el código QR. Por favor, intenta nuevamente."
      );
      console.log("❌ Error configurado en estado");
    } finally {
      console.log("🏁 === FINALIZANDO GENERACIÓN DE QR ===");
      setIsLoadingQR(false);
      setIsGenerating(false);
      console.log("🔄 Loading QR desactivado");
      console.log("🎉 === GENERACIÓN DE QR COMPLETADA ===");
    }
  }, [cantidad]); // ✅ SOLO cantidad como dependencia

  // Generar QR cuando se carga el componente
  useEffect(() => {
    console.log("🔄 === useEffect EJECUTADO ===");
    console.log("📅 Timestamp:", new Date().toISOString());
    console.log("💰 Cantidad actual:", cantidad);
    console.log("🔒 isGenerating estado:", isGenerating);
    console.log("📱 QR Data actual:", qrData ? "Existe" : "No existe");
    console.log("🆔 Current Transaction Ref:", currentTransactionRef);
    console.log("🚨 hasInitialized.current:", hasInitialized.current);

    // ✅ PREVENIR EJECUCIONES MÚLTIPLES EN LA PRIMERA CARGA
    if (hasInitialized.current) {
      console.log("⚠️ Ya se inicializó, saltando ejecución duplicada...");
      return;
    }

    hasInitialized.current = true;
    console.log("🚀 Primera ejecución, llamando a generateQR()...");
    generateQR();
  }, [cantidad, generateQR]);

  const handleConfirmPayment = async () => {
    console.log("🚀 === INICIANDO CONFIRMACIÓN DE PAGO ===");
    console.log("📅 Timestamp:", new Date().toISOString());
    console.log("💰 Monto de la donación:", cantidad);
    console.log("🆔 TransactionId guardado:", transactionId);
    console.log("👤 Datos del usuario:", {
      nombre,
      apellido,
      correo,
      telefono,
      documento,
      comunidad,
    });

    // Verificar si hay transactionId antes de mostrar el loading
    if (!transactionId) {
      console.log("❌ ERROR: No hay transactionId disponible");
      toast.error("QR no generado", {
        description:
          "Por favor, espera a que se genere el código QR antes de confirmar el pago.",
        duration: 4000,
        id: "qr-not-generated",
      });
      return;
    }

    setShowLoadingModal(true);

    try {
      console.log("🔍 Verificando estado del pago...");
      console.log("📋 Verificando si existe transactionId...");

      console.log("✅ TransactionId encontrado:", transactionId);

      const statusPayload = {
        idTransaction: transactionId,
      };

      console.log("📦 === PREPARANDO PAYLOAD PARA STATUS ===");
      console.log(
        "📋 Payload completo:",
        JSON.stringify(statusPayload, null, 2)
      );
      console.log(
        "🔗 URL de destino:",
        "https://api.baq.ec/api/baq/deuna/payment/status"
      );
      console.log("📋 Headers a enviar:", {
        accept: "application/json",
        "Content-Type": "application/json",
      });

      console.log("🖥️ === COMANDO CURL PARA STATUS ===");
      const statusCurlCommand = `curl -X 'POST' 'https://api.baq.ec/api/baq/deuna/payment/status' -H 'accept: application/json' -H 'Content-Type: application/
json' -d '${JSON.stringify(statusPayload)}'`;
      console.log(statusCurlCommand);
      console.log("📋 === PAYLOAD PARA STATUS ===");
      console.log(JSON.stringify(statusPayload, null, 2));
      console.log("=====================================");

      console.log("🌐 === ENVIANDO PETICIÓN A LA API ===");
      console.log("⏱️ Iniciando fetch...");

      const response = await fetch(
        "https://api.baq.ec/api/baq/deuna/payment/status",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(statusPayload),
        }
      );

      console.log("📡 === RESPUESTA DE LA API ===");
      console.log("🔢 Status code:", response.status);
      console.log("📋 Status text:", response.statusText);
      console.log("🔗 URL de respuesta:", response.url);
      console.log(
        "📋 Headers de respuesta:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        console.log("❌ ERROR: La respuesta no es exitosa");
        console.log("🔢 Status code de error:", response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("✅ Respuesta exitosa, parseando JSON...");
      const result = await response.json();
      console.log("📊 === RESULTADO COMPLETO DEL STATUS ===");
      console.log("📋 Resultado raw:", result);
      console.log("🔍 Estado del pago:", result.status);
      console.log(
        "🆔 ID de transacción:",
        result.idTransaction || "No disponible"
      );
      console.log("📅 Timestamp de respuesta:", new Date().toISOString());
      console.log("========================================");

      // Log detallado del payload de respuesta en la terminal del frontend
      console.log("🔄 === PAYLOAD DE RESPUESTA DEL STATUS ===");
      console.log("📋 Response Body completo:");
      console.log(JSON.stringify(result, null, 2));
      console.log("🔍 Campos específicos:");
      console.log("- Status:", result.status);
      console.log("- TransactionId:", result.idTransaction || "No disponible");
      console.log(
        "- Otros campos:",
        Object.keys(result).filter(
          (key) => key !== "status" && key !== "idTransaction"
        )
      );
      console.log("========================================");

      setShowLoadingModal(false);

      console.log("🎯 === PROCESANDO RESULTADO ===");
      console.log("🔍 Estado recibido:", result.status);
      console.log("📋 Tipo de estado:", typeof result.status);

      // Limpiar todos los toasts antes de mostrar uno nuevo
      toast.dismiss();

      if (result.status === "PENDING") {
        console.log("⏳ Estado: PENDING - Mostrando mensaje de pago pendiente");
        // Mostrar mensaje de pago pendiente
        toast.error("Pago pendiente", {
          description:
            "Tu pago aún no ha sido procesado. Por favor, completa el pago y vuelve a intentar.",
          duration: 5000,
          id: "payment-status-pending", // ID único para evitar duplicados
        });
        console.log("✅ Toast de PENDING mostrado");
      } else if (result.status === "APPROVED") {
        console.log(
          "✅ Estado: APPROVED - Mostrando mensaje de éxito y abriendo modal"
        );
        // Mostrar mensaje de éxito y abrir modal de datos complementarios
        toast.success("¡Felicitaciones por tu donación!", {
          description: "Tu pago ha sido procesado exitosamente.",
          duration: 3000,
          id: "payment-status-approved", // ID único para evitar duplicados
        });
        console.log("✅ Toast de APPROVED mostrado");

        useFormStore.getState().clearFormData();

        // Cerrar modal de loading ANTES de abrir el modal de confirmación
        setShowLoadingModal(false);

        // Abrir modal de datos complementarios
        console.log("🚪 Abriendo modal de datos complementarios...");
        console.log("✅ Modal abierto");
      } else {
        console.log(
          "❓ Estado desconocido:",
          result.status,
          "- Mostrando mensaje de estado no válido"
        );
        // Otros estados (REJECTED, etc.)
        toast.error("Estado de pago no válido", {
          description: `El estado del pago es: ${result.status}`,
          duration: 4000,
          id: "payment-status-unknown", // ID único para evitar duplicados
        });
        console.log("✅ Toast de estado desconocido mostrado");
        setShowLoadingModal(false);
      }

      console.log("🎉 === PROCESAMIENTO COMPLETADO ===");
    } catch (error) {
      console.log("💥 === ERROR EN LA VERIFICACIÓN ===");
      console.error("❌ Error completo:", error);
      console.log("📋 Tipo de error:", typeof error);
      if (error instanceof Error) {
        console.log("📋 Mensaje de error:", error.message);
        console.log("📋 Stack trace:", error.stack);
      }
      console.log("📅 Timestamp del error:", new Date().toISOString());

      setShowLoadingModal(false);
      console.log("🔄 Cerrando modal de loading...");

      toast.dismiss(); // Limpiar toasts anteriores
      console.log("🧹 Limpiando toasts anteriores...");

      toast.error("Error al verificar el pago", {
        description:
          "Hubo un problema al verificar el estado de tu pago. Por favor, intenta nuevamente.",
        duration: 4000,
        id: "payment-status", // ID único para evitar duplicados
      });
      console.log("✅ Toast de error mostrado");
      console.log("🏁 === MANEJO DE ERROR COMPLETADO ===");
    }
  };

  // const handleSubmitDonation = async () => {
  //   setShowLoadingModal(true);

  //   try {
  //     // Reutilizar el mismo user_id que se usó para generar el QR
  //     const user_id = await getOrCreateUserId();
  //     const payload = {
  //       correo_electronico: correoModal || correo || 'anonimo@baq.ec', // Email opcional, usar valor por defecto si no se proporciona
  //       monto_donar: cantidad,
  //       user_id: user_id,
  //     };

  //     const response = await fetch('https://api.baq.ec/api/baq/donaciones/donador-simple', {
  //       method: 'POST',
  //       headers: {
  //         'accept': 'application/json',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(payload)
  //     });

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error('Error response:', errorText);
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     await response.json();

  //     setShowLoadingModal(false);
  //     setShowSuccessModal(true);

  //   } catch (error) {
  //     console.error('Error submitting donation:', error);
  //     toast.error('Error al registrar la donación', {
  //       description: 'Hubo un problema al procesar tu donación. Por favor, intenta nuevamente.',
  //       duration: 4000,
  //     });
  //     setShowLoadingModal(false);
  //   }
  // };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.push("/thank-you");
  };

  return (
    <div
      style={{
        paddingTop: 120,
        paddingBottom: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 4px 24px #0001",
          padding: "40px 32px",
          maxWidth: 400,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1 className="text-[#2F3388] font-black text-2xl mb-5 text-center">
          ¡Escanea el código QR para completar tu donación!
        </h1>

        {isLoadingQR ? (
          <div className="my-[18px] flex items-center justify-center w-[220px] h-[220px] rounded-2xl border-2 border-[#ff7300] bg-white">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#f3f3f3] border-t-[#ff7300] rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Generando QR...</p>
            </div>
          </div>
        ) : qrError ? (
          <div className="my-[18px] flex items-center justify-center w-[220px] h-[220px] rounded-2xl border-2 border-red-300 bg-red-50">
            <div className="text-center p-4">
              <p className="text-sm text-red-600 mb-2">{qrError}</p>
              <button
                onClick={() => {
                  console.log("Reintentando...");
                  generateQR();
                }}
                className="px-4 py-2 bg-[#ff7300] text-white rounded-lg text-sm hover:bg-[#e66500] transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : qrData ? (
          isMobile && deeplink ? (
            // En móviles, mostrar botón con deeplink
            <div className="my-[18px] flex flex-col items-center justify-center w-[220px] h-[220px] rounded-2xl border-2 border-[#ff7300] bg-white p-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#ff7300] rounded-full flex items-center justify-center mb-3">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Pagar con DeUna
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  Toca para abrir la app
                </p>
                <a
                  href={deeplink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-[#ff7300] text-white rounded-lg text-sm font-medium hover:bg-[#e66500] transition-colors"
                >
                  Abrir DeUna
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          ) : (
            // En desktop, mostrar QR
            <Image
              src={qrData}
              alt="QR para donación"
              width={220}
              height={220}
              className="my-[18px] rounded-2xl border-2 border-[#ff7300] bg-white w-[220px] h-[220px]"
            />
          )
        ) : (
          <div className="my-[18px] flex items-center justify-center w-[220px] h-[220px] rounded-2xl border-2 border-gray-300 bg-gray-50">
            <p className="text-sm text-gray-600">No se pudo generar el QR</p>
          </div>
        )}
        <div
          style={{
            fontSize: "1.2rem",
            color: "#ff7300",
            fontWeight: 700,
            margin: "18px 0 8px 0",
          }}
        >
          Total a pagar: <span style={{ color: "#2F3388" }}>${cantidad}</span>
        </div>

        {(nombre || apellido) && (
          <div
            style={{
              color: "#2F3388",
              fontSize: "0.9rem",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Donante: {nombre} {apellido}
          </div>
        )}

        <div
          style={{
            color: "#555",
            fontSize: "1rem",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Una vez realizado el pago, tu donación será registrada
          automáticamente.
          <br />
          ¡Gracias por tu solidaridad!
        </div>

        <img
          src="https://vectorseek.com/wp-content/uploads/2023/08/Deuna-Wordmark-Logo-Vector.svg-.png"
          alt="DeUna logo"
          style={{ height: 18, marginTop: 12, opacity: 0.7 }}
        />
        <button
          onClick={handleConfirmPayment}
          disabled={!transactionId || isLoadingQR}
          style={{
            marginTop: 24,
            width: "100%",
            background:
              !transactionId || isLoadingQR
                ? "linear-gradient(90deg, #ccc, #ddd)"
                : "linear-gradient(90deg, #ff7300, #ffb347)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 18,
            border: "none",
            borderRadius: 8,
            padding: 14,
            boxShadow:
              !transactionId || isLoadingQR
                ? "0 2px 8px #ccc3"
                : "0 2px 8px #ff730033",
            cursor: !transactionId || isLoadingQR ? "not-allowed" : "pointer",
            transition: "background 0.2s",
            opacity: !transactionId || isLoadingQR ? 0.6 : 1,
          }}
        >
          {isLoadingQR
            ? "Generando QR..."
            : !transactionId
            ? "Esperando QR..."
            : "Confirmar pago"}
        </button>
      </div>

      {/* Modal de carga */}
      {showLoadingModal && (
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
              Verificando pago...
            </div>
            <div style={{ fontSize: 16, color: "#555", marginBottom: 18 }}>
              Por favor espera mientras verificamos el estado de tu pago.
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

      {/* Modal de éxito */}
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
              ¡Donación registrada exitosamente!
            </div>
            <div style={{ fontSize: 16, color: "#555", marginBottom: 18 }}>
              Gracias por tu solidaridad. Tu donación ha sido procesada
              correctamente.
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
    </div>
  );

  console.log("🎭 === COMPONENTE QRContent RENDERIZADO ===");
  console.log("📅 Timestamp:", new Date().toISOString());
}

// Componente principal con Suspense
export default function DonacionQRPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Suspense
        fallback={
          <div style={{ paddingTop: 120, textAlign: "center" }}>
            Cargando...
          </div>
        }
      >
        <QRContent />
      </Suspense>
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
        @media (max-width: 600px) {
          .navbar-tomate { height: 80px; }
          .navbar-logo { width: 100px; }
        }
      `}</style>
      <Toaster />
    </div>
  );
}
