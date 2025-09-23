// app/donacion/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import PaymentModal from "../components/PaymentModal";
import Image from "next/image";
import { useRouteLoading } from "@/hooks/useRouteLoading";
import { useMobile } from "@/hooks/use-mobile";

// Type for Google Analytics gtag function
declare global {
  interface Window {
    gtag: (command: string, eventName: string, params?: Record<string, any>) => void;
    dataLayer: any[];
  }
}

function calcularNinios(monto: number) {
  // Si el monto es menor al mínimo permitido, devolver 0
  if (monto < 1) return 0;
  // Ahora 1 persona por cada 2 USD
  return Math.floor(monto);
}
// Imágenes para donación única - opción 1
const PUZZLE_PIECES_UNICA_1 = [
  { key: "A1", src: "/puzzle/A1.png", style: { top: 0, left: 0 } },
  { key: "A2", src: "/puzzle/A2.png", style: { bottom: 0, left: 0 } },
  { key: "B1", src: "/puzzle/B1.png", style: { top: 0, right: 0 } },
  { key: "B2", src: "/puzzle/B2.png", style: { bottom: 0, right: 0 } },
];

// Imágenes para donación única - opción 2
const PUZZLE_PIECES_UNICA_2 = [
  { key: "C1", src: "/puzzle/C1.png", style: { top: 0, left: 0 } },
  { key: "C2", src: "/puzzle/C2.png", style: { top: 0, left: 0 } },
  { key: "D1", src: "/puzzle/D1.png", style: { top: 0, left: 0 } },
  { key: "D2", src: "/puzzle/D2.png", style: { top: 0, left: 0 } },
];

// Imágenes para donación mensual - opción 1
const PUZZLE_PIECES_MENSUAL_1 = [
  { key: "E1", src: "/puzzle/E1.png", style: { top: 0, left: 0 } },
  { key: "E2", src: "/puzzle/E2.png", style: { bottom: 0, left: 0 } },
  { key: "F1", src: "/puzzle/F1.png", style: { top: 0, right: 0 } },
  { key: "F2", src: "/puzzle/F2.png", style: { bottom: 0, right: 0 } },
];

// Imágenes para donación mensual - opción 2
const PUZZLE_PIECES_MENSUAL_2 = [
  { key: "G1", src: "/puzzle/G1.png", style: { top: 0, left: 0 } },
  { key: "G2", src: "/puzzle/G2.png", style: { top: 0, left: 0 } },
  { key: "H1", src: "/puzzle/H1.png", style: { top: 0, left: 0 } },
  { key: "H2", src: "/puzzle/H2.png", style: { top: 0, left: 0 } },
];

// Función para obtener piezas de donación única - opción 1
function getPuzzlePiecesUnica1(monto: number) {
  if (monto >= 50) return ["A1", "A2", "B1", "B2"];
  if (monto >= 30) return ["A1", "A2", "B1"];
  if (monto >= 10) return ["A1", "A2"];
  if (monto >= 2) return ["A1"];
  return [];
}

// Función para obtener piezas de donación única - opción 2
function getPuzzlePiecesUnica2(monto: number) {
  if (monto >= 50) return ["C1", "C2", "D1", "D2"];
  if (monto >= 30) return ["C1", "C2", "D1"];
  if (monto >= 10) return ["C1", "C2"];
  if (monto >= 2) return ["C1"];
  return [];
}

// Función para obtener piezas de donación mensual - opción 1
function getPuzzlePiecesMensual1(monto: number) {
  if (monto >= 50) return ["E1", "E2", "F1", "F2"];
  if (monto >= 30) return ["E1", "E2", "F1"];
  if (monto >= 10) return ["E1", "E2"];
  if (monto >= 2) return ["E1"];
  return [];
}

// Función para obtener piezas de donación mensual - opción 2
function getPuzzlePiecesMensual2(monto: number) {
  if (monto >= 50) return ["G1", "G2", "H1", "H2"];
  if (monto >= 30) return ["G1", "G2", "H1"];
  if (monto >= 10) return ["G1", "G2"];
  if (monto >= 2) return ["G1"];
  return [];
}

const MONTOS_DONACION = [2, 10, 30, 50];

export default function DonacionPage() {
  const [tipo, setTipo] = useState<"unica" | "mensual">("mensual");
  const [cantidad, setCantidad] = useState(0);
  const [otro, setOtro] = useState("");
  const [otroActivo, setOtroActivo] = useState(false);
  const [animNinios, setAnimNinios] = useState(calcularNinios(12));
  const animRef = useRef<number | null>(null);
  const isMobile = useMobile();

  // Estado para controlar qué variante del puzzle mostrar
  const [puzzleVariant, setPuzzleVariant] = useState<1 | 2>(1);

  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showDeunaModal, setShowDeunaModal] = useState(false);
  // const [showTipoButtons, setShowTipoButtons] = useState(false);
  // const [showInversionModal, setShowInversionModal] = useState(false);

  const [deunaForm, setDeunaForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    documento: "",
  });
  const [consentChecked, setConsentChecked] = useState(false);
  const [comindadesChecked, setComindadesChecked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoadingMensual, setIsLoadingMensual] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);

  const { navigateWithLoading } = useRouteLoading();

  const canSubmitDeuna =
    consentChecked ||
    (!deunaForm.nombre &&
      !deunaForm.apellido &&
      !deunaForm.correo &&
      !deunaForm.telefono &&
      !deunaForm.documento);

  // Carga

  // Animación de conteo de niños
  useEffect(() => {
    const target = calcularNinios(cantidad);
    if (animRef.current) clearInterval(animRef.current);
    if (animNinios === target) return;
    const step = animNinios < target ? 1 : -1;
    animRef.current = window.setInterval(() => {
      setAnimNinios((prev) => {
        if (prev === target) {
          if (animRef.current) clearInterval(animRef.current);
          return prev;
        }
        return prev + step;
      });
    }, 60);
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [cantidad]);

  //LOGICA PARA EL PUZZLE

  // Efecto para cambiar aleatoriamente la variante del puzzle cuando cambia el tipo
  useEffect(() => {
    setPuzzleVariant(Math.random() < 0.5 ? 1 : 2);
  }, [tipo]);

  // Función para obtener las piezas y configuración según el tipo y variante
  const getPuzzleConfig = () => {
    if (tipo === "unica") {
      if (puzzleVariant === 1) {
        return {
          pieces: PUZZLE_PIECES_UNICA_1,
          activePieces: getPuzzlePiecesUnica1(cantidad),
          backgroundImage: "/puzzle/unica-opcion1.png",
          alt: "Puzzle donación única opción 1",
        };
      } else {
        return {
          pieces: PUZZLE_PIECES_UNICA_2,
          activePieces: getPuzzlePiecesUnica2(cantidad),
          backgroundImage: "/puzzle/unica-opcion2.png",
          alt: "Puzzle donación única opción 2",
        };
      }
    } else {
      if (puzzleVariant === 1) {
        return {
          pieces: PUZZLE_PIECES_MENSUAL_1,
          activePieces: getPuzzlePiecesMensual1(cantidad),
          backgroundImage: "/puzzle/mensual-opcion1.png",
          alt: "Puzzle donación mensual opción 1",
        };
      } else {
        return {
          pieces: PUZZLE_PIECES_MENSUAL_2,
          activePieces: getPuzzlePiecesMensual2(cantidad),
          backgroundImage: "/puzzle/mensual-opcion2.png",
          alt: "Puzzle donación mensual opción 2",
        };
      }
    }
  };

  const puzzleConfig = getPuzzleConfig();

  const handleCantidad = (valor: number) => {
    setCantidad(Number(valor.toFixed(2)));
    setOtroActivo(false);
    setOtro("");
  };

  const handleOtroFocus = () => {
    setCantidad(0);
    setOtroActivo(true);
  };

  const handleDonarAhora = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (cantidad < 0) return;

    // GA4 event for donation action
    if (typeof window !== 'undefined' && window.gtag) {
      if (tipo === "mensual") {
        window.gtag('event', 'dona_ahora_mensual', {
          monto: cantidad,
          tipo_donacion: tipo,
          accion: 'procesar_donacion_mensual'
        });
      }
    }

    if (tipo === "mensual") {
      setIsLoadingMensual(true);
      setLoadingProgress(0);
    } else {
      setShowPagoModal(true);
    }
  };

  const handleDeunaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1800);
  };

  const handleCloseLoadingModal = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    setIsLoadingMensual(false);
    setLoadingProgress(0);
  };

  const handleContinueToMonthly = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    setIsLoadingMensual(false);
    setLoadingProgress(0);
    navigateWithLoading(`/donacion/mensual?monto=${cantidad}`, 100);
  };

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <div
        className="w-full flex flex-col lg:flex-row justify-center items-start gap-4 sm:gap-6 lg:gap-12 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-16 pb-8 sm:pb-12 lg:pb-16 relative"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)), url('background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.85,
        }}
      >
        {/* Sección del puzzle - se muestra primero en mobile */}
        {isMobile && (
          <div className="w-full lg:w-1/2 max-w-md lg:max-w-lg flex flex-col items-center mb-8">
            <div className="bg-gradient-to-r from-[#ffb347] to-[#ff7300] rounded-xl p-4 sm:p-6 lg:p-8 w-full shadow-lg flex flex-col items-center mb-6 sm:mb-8">
              <h1 className="text-white text-lg sm:text-xl lg:text-2xl xl:text-3xl font-extrabold text-center mb-4">
                Tu eres la <strong>pieza</strong> que falta para <strong>acabar</strong> con la desnutrición
              </h1>
              <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md">
                <Image
                  src={puzzleConfig.backgroundImage}
                  alt={puzzleConfig.alt}
                  width={400}
                  height={400}
                  className="w-full h-auto opacity-20 rounded-lg"
                />
                {/* Piezas del puzzle - renderiza según el tipo */}
                {puzzleConfig.pieces.map((piece) => {
                  const show = puzzleConfig.activePieces.includes(piece.key);
                  return (
                    <Image
                      key={piece.key}
                      src={piece.src}
                      alt={piece.key}
                      className={`absolute w-full h-full object-contain transition-opacity duration-700 ${show ? "opacity-100" : "opacity-0"
                        }`}
                      width={400}
                      height={400}
                      style={{
                        top: piece.style.top ?? "auto",
                        bottom: piece.style.bottom ?? "auto",
                        left: piece.style.left ?? "auto",
                        right: piece.style.right ?? "auto",
                      }}
                    />
                  );
                })}
              </div>
              <PersonasAlimentadas cantidad={cantidad} tipo={tipo} />
            </div>
          </div>
        )}

        {/* Sección izquierda - Formulario de donación */}
        <div className="w-full lg:w-1/2 max-w-md lg:max-w-lg flex flex-col items-center">
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 w-full shadow-[0_8px_32px_rgba(255,140,0,0.13)] flex flex-col items-center">
            <h1 className="bg-gradient-to-r from-[#ff7300] to-[#FF6347] bg-clip-text text-transparent text-xl sm:text-2xl lg:text-3xl font-extrabold text-center mb-3 sm:mb-4">
              A un <strong>clic</strong> para alimentar
            </h1>
            <p className="text-center text-sm sm:text-base lg:text-lg font-medium text-orange-500 mb-2">
              Tu aporte ayuda a transformar vidas.
            </p>
            <p className="text-center text-sm sm:text-base lg:text-lg font-medium text-orange-700 mb-4 sm:mb-5">
              Elige el <strong>tipo</strong> y <strong>monto</strong> de tu donación:
            </p>

            {/* Botones de tipo responsive */}
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 w-full mb-4 sm:mb-6">
              <button
                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base lg:text-lg transition-transform ${tipo === "unica"
                  ? "bg-gradient-to-r from-[#2F3388] to-[#1D2394] text-white shadow-lg scale-105"
                  : "bg-gray-200 text-gray-700 shadow-md hover:bg-[#2F3388] hover:text-white"
                  }`}
                onClick={() => setTipo("unica")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:mr-2">
                  <path
                    d="M17.5 8.5c-1.2-1.1-2.7-1.2-3.5-1.2-.8 0-2.3.1-3.5 1.2C8.1 9.7 7 11.5 7 13.7c0 2.2 1.2 4.3 3.1 5.1.7.3 1.4.4 2.1.4.7 0 1.4-.1 2.1-.4 1.9-.8 3.1-2.9 3.1-5.1 0-2.2-1.1-4-2.9-5.2z"
                    fill={tipo === "unica" ? "#fff" : "#ff7300"}
                  />
                </svg>
                <span className="hidden sm:inline">Única vez</span>
                <span className="sm:hidden">Única</span>
              </button>

              <button
                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base lg:text-lg transition-transform ${tipo === "mensual"
                  ? "bg-gradient-to-r from-[#2F3388] to-[#1D2394] text-white shadow-lg scale-105"
                  : "bg-gray-200 text-gray-700 shadow-md hover:bg-[#2F3388] hover:text-white"
                  }`}
                onClick={() => {
                  setTipo("mensual");
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'donacion_mensual', {
                      tipo_donacion: 'mensual',
                      accion: 'seleccion_tipo'
                    });
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="sm:mr-1">
                  <rect x="3" y="4" width="18" height="17" rx="3" fill={tipo === "mensual" ? "#fff" : "#ff7300"} fillOpacity="0.15" />
                  <rect x="3" y="8" width="18" height="13" rx="2" fill={tipo === "mensual" ? "#fff" : "#ff7300"} />
                </svg>
                Mensual
              </button>
            </div>

            {/* Montos predefinidos responsive */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6 w-full">
              {MONTOS_DONACION.map((m) => (
                <button
                  key={m}
                  className={`flex flex-col items-center rounded-lg px-3 sm:px-6 lg:px-7 py-3 sm:py-4 font-bold text-base sm:text-lg shadow-md transition-transform ${cantidad === m && !otroActivo
                    ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg scale-105"
                    : "bg-white text-orange-600 hover:brightness-110"
                    }`}
                  onClick={() => {
                    handleCantidad(m);
                    if (tipo === "mensual" && typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'monto_mensual', {
                        monto: m,
                        tipo_donacion: tipo,
                        accion: 'seleccion_monto'
                      });
                    }
                  }}
                >
                  <span className="text-xs sm:text-sm">USD</span>
                  <span className="text-lg sm:text-xl">{m}</span>
                </button>
              ))}
            </div>

            {/* Input otro monto responsive */}
            <div className="flex w-full mb-4 sm:mb-6">
              <button
                className={`rounded-l-lg px-3 sm:px-6 py-3 sm:py-4 font-bold text-sm sm:text-base lg:text-lg shadow-md transition-transform ${otroActivo
                  ? "bg-gradient-to-r from-orange-500 to-orange-300 text-white shadow-lg scale-105"
                  : "bg-gradient-to-r from-orange-500 to-orange-300 text-white shadow-md"
                  }`}
                onClick={() => {
                  handleOtroFocus();
                  if (tipo === "mensual" && typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'monto_mensual', {
                      monto: 'otro',
                      tipo_donacion: tipo,
                      accion: 'seleccion_monto_personalizado'
                    });
                  }
                }}
                type="button"
              >
                Otro
              </button>
              <input
                type="text"
                inputMode="decimal"
                pattern="^\d+(\.\d{0,2})?$"
                placeholder="Monto"
                value={otroActivo ? otro : ""}
                onFocus={handleOtroFocus}
                onChange={(e) => {
                  const raw = e.target.value;
                  // permitir vacío mientras escribe
                  if (raw === "") {
                    setOtro(raw);
                    setCantidad(0);
                    return;
                  }
                  // permitir "-" temporalmente si lo necesitas (opcional)
                  if (raw === "-") {
                    setOtro(raw);
                    setCantidad(0);
                    return;
                  }
                  // permitir solo números y hasta 2 decimales
                  if (!/^\d*\.?\d{0,2}$/.test(raw)) {
                    // ignorar caracteres inválidos sin romper el input
                    return;
                  }
                  setOtro(raw);
                  // actualizar cantidad en segundo plano (no formatear el input)
                  const parsed = parseFloat(raw);
                  if (isNaN(parsed) || parsed < 0) {
                    setCantidad(0);
                  } else {
                    setCantidad(Math.floor(parsed * 100) / 100);
                  }
                }}
                onBlur={() => {
                  // Normalizar al perder el foco: truncar a 2 decimales y mostrar formato
                  if (otro === "" || otro === "-") {
                    setOtro("");
                    setCantidad(0);
                    return;
                  }
                  const parsed = parseFloat(otro);
                  if (isNaN(parsed) || parsed < 0) {
                    setOtro("");
                    setCantidad(0);
                    return;
                  }
                  const rounded = Math.floor(parsed * 100) / 100;
                  setCantidad(Number(rounded.toFixed(2)));
                  setOtro(
                    rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2)
                  );
                }}
                className="flex-1 rounded-r-lg p-2 sm:p-3 lg:p-4 font-bold text-sm sm:text-base lg:text-lg bg-white shadow-md focus:outline-none"
              />
            </div>

            <button
              className="w-full bg-[#ED6F1D] text-white rounded-full py-3 sm:py-4 font-black text-lg sm:text-xl shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={cantidad < 1 || (otroActivo && (!otro || otro === "")) || isLoadingMensual}
              onClick={handleDonarAhora}
            >
              Donar ahora
            </button>
          </div>
        </div>

        {/* Sección derecha - Puzzle responsive - solo se muestra en desktop */}
        {!isMobile && (
          <div className="w-full lg:w-1/2 max-w-md lg:max-w-lg flex flex-col items-center mt-8 lg:mt-0">
            <div className="bg-gradient-to-r from-[#ffb347] to-[#ff7300] rounded-xl p-4 sm:p-6 lg:p-8 w-full shadow-lg flex flex-col items-center mb-6 sm:mb-8">
              <h1 className="text-white text-lg sm:text-xl lg:text-2xl xl:text-3xl font-extrabold text-center mb-4">
                Tu eres la <strong>pieza</strong> que falta para <strong>acabar</strong> con la desnutrición
              </h1>
              <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md">
                <Image
                  src={puzzleConfig.backgroundImage}
                  alt={puzzleConfig.alt}
                  width={400}
                  height={400}
                  className="w-full h-auto opacity-20 rounded-lg"
                />
                {/* Piezas del puzzle - renderiza según el tipo */}
                {puzzleConfig.pieces.map((piece) => {
                  const show = puzzleConfig.activePieces.includes(piece.key);
                  return (
                    <Image
                      key={piece.key}
                      src={piece.src}
                      alt={piece.key}
                      className={`absolute w-full h-full object-contain transition-opacity duration-700 ${show ? "opacity-100" : "opacity-0"
                        }`}
                      width={400}
                      height={400}
                      style={{
                        top: piece.style.top ?? "auto",
                        bottom: piece.style.bottom ?? "auto",
                        left: piece.style.left ?? "auto",
                        right: piece.style.right ?? "auto",
                      }}
                    />
                  );
                })}
              </div>
              <PersonasAlimentadas cantidad={cantidad} tipo={tipo} />
            </div>
          </div>
        )}
      </div>

      {/* Secciones informativas responsive */}
      <div className="w-full h-4 sm:h-8 bg-white"></div>

      <section
        className="relative w-full bg-cover bg-center mb-4 sm:mb-8 px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
        style={{ backgroundImage: "url('/beneficiarios.webp')" }}
      >
        <div className="bg-black/60 p-4 sm:p-6 lg:p-8 rounded-lg max-w-xl sm:max-w-2xl mx-auto">
          <div className="text-center text-white">
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold mb-3 sm:mb-4">
              ¿Qué hacemos con tus donaciones?
            </h2>
            <p className="text-sm sm:text-base lg:text-lg font-medium mb-6 sm:mb-8">
              Sus contribuciones son utilizadas para <b>adquirir alimentos de alto valor nutricional</b> y cubrir la logística que asegure una buena gestión y calidad de los alimentos.
            </p>
            <hr className="border-t-2 border-white mx-auto w-3/5 mb-6 sm:mb-8" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold mb-3 sm:mb-4">
              ¿Cómo lo hacemos?
            </h2>
            <p className="text-sm sm:text-base lg:text-lg font-medium">
              Los alimentos gestionados por diferentes fuentes de supermercados, centrales y otros, son complementados con los adquiridos por donaciones y enviados a través de un sistema integral de organizaciones sociales que garantizan trazabilidad y reportería para nuestros benefactores.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-gradient-to-r from-[#fff7ed] to-[#ffe0c3] flex flex-col items-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold bg-gradient-to-r from-[#ff7300] to-[#FF6347] bg-clip-text text-transparent mb-6 sm:mb-8 text-center">
          Conoce el impacto que genera tu donación
        </h2>
        <div className="flex justify-center w-full">
          <Image
            src="/que-hacemos.webp"
            alt="Impacto de tu donación"
            width={800}
            height={800}
            className="w-full max-w-sm sm:max-w-md lg:max-w-2xl xl:max-w-4xl rounded-xl lg:rounded-2xl object-cover"
          />
        </div>
      </section>

      {/* Modal de carga para donación mensual */}
      {isLoadingMensual && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md mx-4 shadow-2xl text-center relative">
            {/* Botón de cerrar */}
            <button
              onClick={handleCloseLoadingModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="mb-6">
              {/* Icono de celebración */}
              <div className="mb-4">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mx-auto text-orange-500">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor" />
                  <path d="M19 15L20.09 18.26L24 19L20.09 19.74L19 23L17.91 19.74L14 19L17.91 18.26L19 15Z" fill="currentColor" />
                  <path d="M5 15L6.09 18.26L10 19L6.09 19.74L5 23L3.91 19.74L0 19L3.91 18.26L5 15Z" fill="currentColor" />
                </svg>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#2F3388] mb-4">
                Ya elegiste tu monto
              </h3>
              <p className="text-gray-700 text-sm sm:text-base mb-4 leading-relaxed">
                Gracias a ti estamos más cerca de un Ecuador libre de hambre.
              </p>

              <div className="text-left space-y-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">1</span>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Te llegará a tu correo el documento de voluntariedad.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">2</span>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <circle cx="12" cy="16" r="1"></circle>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Luego completa la autenticación de identidad (prepara tu cédula).
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-orange-600 font-medium text-sm sm:text-base flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4"></path>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                  <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
                  <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"></path>
                </svg>
                Tu donación será segura y transparente.
              </p>
            </div>

            {/* Botón Continuar */}
            <div className="mb-4">
              <button
                onClick={handleContinueToMonthly}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 flex items-center justify-center gap-3 group cursor-pointer relative overflow-hidden animate-pulse hover:animate-none"
                style={{
                  boxShadow: '0 0 20px rgba(249, 115, 22, 0.4), 0 0 40px rgba(249, 115, 22, 0.2)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              >
                {/* Efecto de brillo continuo */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer"></div>

                <span className="text-lg relative z-10">Continuar</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:translate-x-1 transition-transform duration-200 relative z-10"
                >
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de métodos de pago */}
      <PaymentModal
        isOpen={showPagoModal}
        onClose={() => setShowPagoModal(false)}
        cantidad={cantidad}
        deunaForm={deunaForm}
        setDeunaForm={setDeunaForm}
        comindadesChecked={comindadesChecked}
        setComindadesChecked={setComindadesChecked}
        consentChecked={consentChecked}
        setConsentChecked={setConsentChecked}
        onSubmitDeuna={handleDeunaSubmit}
      />

      {/* Modal de formulario DeUna (opcional) */}
      {showDeunaModal && (
        <div
          className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center"
          onClick={() => setShowDeunaModal(false)}
        >
          <div
            className="bg-white rounded-xl p-8 w-full max-w-md shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-2xl text-[#ff7300]"
              onClick={() => setShowDeunaModal(false)}
            >
              &times;
            </button>
            <h2 className="text-center text-2xl font-extrabold text-[#2F3388] mb-6">
              Información de Donación
            </h2>
            <form onSubmit={handleDeunaSubmit} className="flex flex-col gap-4">
              {/* Campos de correo, nombre, apellido, teléfono, documento */}
              {(
                [
                  "correo",
                  "nombre",
                  "apellido",
                  "telefono",
                  "documento",
                ] as const
              ).map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">
                    {field === "correo"
                      ? "Correo Electrónico"
                      : field === "telefono"
                        ? "Número de Teléfono (opcional)"
                        : field === "documento"
                          ? "Documento de Identidad"
                          : field === "nombre"
                            ? "Nombre"
                            : "Apellido"}
                  </label>
                  <input
                    type={
                      field === "correo"
                        ? "email"
                        : field === "telefono"
                          ? "tel"
                          : "text"
                    }
                    placeholder={
                      field === "telefono"
                        ? "Número de teléfono (opcional)"
                        : `Ingresa tu ${field}`
                    }
                    value={deunaForm[field]}
                    onChange={(e) =>
                      setDeunaForm((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
              ))}

              <div className="flex items-start gap-2">
                <input
                  id="consent"
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-[3px]"
                />
                <label
                  htmlFor="consent"
                  className="text-sm text-[#2F3388] font-medium"
                >
                  Al ingresar mis datos, podrán mantener mi racha y comunicar
                  eventos.
                </label>
              </div>
              <div className="flex items-start gap-2">
                <input
                  id="comunidad"
                  type="checkbox"
                  checked={comindadesChecked}
                  onChange={(e) => setComindadesChecked(e.target.checked)}
                  className="mt-[3px]"
                />
                <label
                  htmlFor="comunidad"
                  className="text-sm text-[#2F3388] font-medium"
                >
                  Deseo pertenecer a la comunidad DeUna.
                </label>
              </div>

              <button
                type="submit"
                disabled={!canSubmitDeuna}
                className="w-full bg-gradient-to-r from-[#ff7300] to-[#ffb347] text-white py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Pago
              </button>
            </form>

            {showConfetti && (
              <div className="pointer-events-none fixed inset-0 z-50 animate-[confetti-fall_1.5s_linear]">
                {Array.from({ length: 40 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 10}%`,
                      fontSize: `${Math.random() * 18 + 12}px`,
                      color: [
                        "#ff7300",
                        "#ffb347",
                        "#2F3388",
                        "#FFD580",
                        "#FF6347",
                      ][i % 5],
                      animationDelay: `${Math.random()}s`,
                    }}
                  >
                    🎉
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar: PersonasAlimentadas
function PersonasAlimentadas({
  cantidad,
  tipo,
}: {
  cantidad: number;
  tipo: string;
}) {
  // calcular cuántas personas alimenta el monto (usa la misma lógica que calcularNinios)
  const targetPeople = calcularNinios(cantidad);

  const [personas, setPersonas] = useState<number>(targetPeople);

  useEffect(() => {
    const end = calcularNinios(cantidad);
    if (personas === end) return;
    const step = personas < end ? 1 : -1;
    const iv = setInterval(() => {
      setPersonas((prev) => {
        if (prev === end) {
          clearInterval(iv);
          return prev;
        }
        return prev + step;
      });
    }, 30);
    return () => clearInterval(iv);
  }, [cantidad]);

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 flex flex-col items-center shadow-md w-full">
      <div className="text-[#FF7E15] text-2xl sm:text-3xl font-extrabold mb-1">
        {personas}
      </div>
      <div className="text-[#b85c00] text-sm sm:text-base lg:text-lg font-bold mb-2 text-center">
        {personas === 1 ? "persona alimentada" : "Personas alimentadas"}
      </div>
      <div className="text-gray-500 text-xs sm:text-sm text-center">
        Con un solo $1 alimentas a una persona durante todo un día.
      </div>
      {tipo === "mensual" && (
        <div className="text-transparent bg-gradient-to-r from-[#2F3388] to-[#ff7300] bg-clip-text font-extrabold text-sm sm:text-base lg:text-lg mt-4 animate-[fadeInUpBounce_1s_cubic-bezier(.68,-.55,.27,1.55)] text-center">
          Proyección anual: {personas * 12} personas alimentadas al año
        </div>
      )}
    </div>
  );
}
