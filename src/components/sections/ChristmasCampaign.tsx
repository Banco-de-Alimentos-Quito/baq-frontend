"use client";

import Image from "next/image";
import { Fredoka } from "next/font/google";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ExternalLink,
  HandHeart,
  Loader2,
  QrCode,
  ShieldCheck,
  Smartphone,
  Snowflake,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.baq.ec/api/baq";

const GOAL = 10_000;
const SUGGESTED_AMOUNTS = [5, 10, 20, 50];
const fredoka = Fredoka({ subsets: ["latin"], weight: ["600", "700"], display: "swap" });
const CAMPAIGN_DOTS = [
  { top: "8%", left: "7%", size: 15, opacity: 0.38 },
  { top: "15%", left: "18%", size: 9, opacity: 0.3 },
  { top: "5%", left: "31%", size: 12, opacity: 0.34 },
  { top: "18%", left: "43%", size: 8, opacity: 0.28 },
  { top: "7%", left: "57%", size: 17, opacity: 0.32 },
  { top: "19%", left: "70%", size: 10, opacity: 0.35 },
  { top: "9%", left: "86%", size: 8, opacity: 0.3 },
  { top: "24%", left: "95%", size: 14, opacity: 0.36 },
  { top: "35%", left: "8%", size: 9, opacity: 0.32 },
  { top: "29%", left: "23%", size: 13, opacity: 0.35 },
  { top: "38%", left: "38%", size: 8, opacity: 0.27 },
  { top: "30%", left: "54%", size: 11, opacity: 0.34 },
  { top: "41%", left: "68%", size: 15, opacity: 0.3 },
  { top: "33%", left: "82%", size: 9, opacity: 0.36 },
  { top: "48%", left: "94%", size: 12, opacity: 0.31 },
  { top: "53%", left: "14%", size: 16, opacity: 0.3 },
  { top: "47%", left: "29%", size: 9, opacity: 0.38 },
  { top: "55%", left: "75%", size: 11, opacity: 0.33 },
];

function GoalPill({
  children,
  icon,
  className = "",
}: {
  children: ReactNode;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-h-28 overflow-hidden rounded-[2rem] bg-[#007e8a] text-white shadow-[0_10px_22px_rgba(0,58,89,.14)] ${className}`}>
      <div className="flex min-w-0 flex-1 items-center justify-center px-5 py-5 text-center text-lg font-black leading-[1.02] sm:px-7 sm:text-2xl">
        {children}
      </div>
      <div className="flex w-24 shrink-0 items-center justify-center bg-[#fffdf8] px-3 py-4 text-[#ec6f1d] sm:w-32">
        {icon}
      </div>
    </div>
  );
}

export default function ChristmasCampaign() {
  const router = useRouter();
  const paymentButtonRef = useRef<HTMLButtonElement | null>(null);
  const donationSectionRef = useRef<HTMLDivElement | null>(null);
  const [amount, setAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState("");
  const selectedAmount = customAmount === "" ? amount : Number(customAmount);

  // Modo de pago: "celular" (Link a app Deuna) o "compu" (QR)
  const [deviceMode, setDeviceMode] = useState<"celular" | "compu">("celular");
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    deeplink: string;
    qr?: string;
    transactionId: string;
    internalTransactionReference: string;
    amount: number;
  } | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Progreso de recaudación real desde Supabase (campana = 'navidad_2026')
  const [collectedAmount, setCollectedAmount] = useState(0);
  const [donationsCount, setDonationsCount] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchProgreso = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/deuna/navidad/progreso`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (active && data) {
          setCollectedAmount(Number(data.total_recaudado || 0));
          setDonationsCount(Number(data.total_donaciones || 0));
        }
      } catch {
        // Silencioso si no hay conexión
      }
    };

    fetchProgreso();
    const poll = setInterval(fetchProgreso, 30000);
    return () => {
      active = false;
      clearInterval(poll);
    };
  }, []);

  // Sondeo automático silencioso para redirigir a /thank-you al recibir confirmación del webhook
  useEffect(() => {
    if (!paymentData?.internalTransactionReference) return;

    let cancelled = false;
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/deuna/navidad/status/${encodeURIComponent(
            paymentData.internalTransactionReference
          )}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.paid) {
          clearInterval(intervalId);
          router.push("/thank-you");
        }
      } catch {
        // Silencioso hasta recibir confirmación
      }
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [paymentData, router]);

  // Si el usuario cambia el monto, limpiar el pago anterior para generar uno con el nuevo monto
  const handleSelectPreset = (value: number) => {
    setAmount(value);
    setCustomAmount("");
    if (paymentData && paymentData.amount !== value) {
      setPaymentData(null);
      setPaymentError(null);
    }
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const num = Number(value);
    if (paymentData && paymentData.amount !== num) {
      setPaymentData(null);
      setPaymentError(null);
    }
  };

  const startDonation = async () => {
    if (!Number.isFinite(selectedAmount) || selectedAmount < 1) return;

    setIsGenerating(true);
    setPaymentError(null);

    try {
      // Referencia interna < 20 caracteres según documentación Deuna V2
      const shortRef = `NAV-${Date.now().toString().slice(-10)}`;
      const payload = {
        amount: Number(selectedAmount.toFixed(2)),
        detail: "Donacion Navidad BAQ",
        internalTransactionReference: shortRef,
        qrType: "static",
        format: "2",
      };

      const response = await fetch(
        `${API_BASE_URL}/deuna/navidad/payment/request`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Error al generar pago Deuna (${response.status})`);
      }

      const result = await response.json();

      if (!result.deeplink && !result.qr) {
        throw new Error("No se recibió respuesta de Deuna.");
      }

      const newPayment = {
        deeplink: result.deeplink || "",
        qr: result.qr || "",
        transactionId: result.transactionId || "",
        internalTransactionReference:
          result.internalTransactionReference || shortRef,
        amount: Number(selectedAmount.toFixed(2)),
      };

      setPaymentData(newPayment);

      // Si está en modo Link a app Deuna y hay deeplink, abrir directamente la app Deuna
      if (deviceMode === "celular" && newPayment.deeplink) {
        window.open(newPayment.deeplink, "_blank", "noopener,noreferrer");
      }
    } catch (err: any) {
      console.error("Error generando pago Deuna:", err);
      setPaymentError(
        "No pudimos generar el pago de Deuna en este momento. Por favor intenta nuevamente."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const progressPercentage = Math.min(
    100,
    Math.round((collectedAmount / GOAL) * 100)
  );

  return (
    <section id="apoya-la-causa" aria-labelledby="christmas-title" className="bg-[#fffaf5] text-[#003a59]">
      <div className="relative isolate overflow-hidden bg-[#003a59] text-white">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[42%] w-full sm:h-[44%] lg:h-[48%]"
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
        >
          <path d="M0 295 C170 215 340 290 490 235 C680 165 710 35 1000 0 L1000 400 L0 400 Z" fill="#ec6f1d" />
        </svg>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
          {CAMPAIGN_DOTS.map((dot, index) => (
            <span
              key={index}
              className="absolute rounded-full bg-[#8eb1c1]"
              style={{
                top: dot.top,
                left: dot.left,
                width: dot.size,
                height: dot.size,
                opacity: dot.opacity,
                boxShadow: "0 0 9px rgba(142, 177, 193, 0.2)",
              }}
            />
          ))}
        </div>
        <div className={`${fredoka.className} relative z-10 mx-auto max-w-7xl px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-12 lg:pb-28 lg:pt-20`}>
          <div className="relative z-20 inline-flex max-w-full items-stretch overflow-visible rounded-full border border-white/30 bg-[#ec6f1d] text-xs shadow-[0_7px_20px_rgba(5,22,43,.16)] sm:text-base">
            <Image
              aria-hidden="true"
              src="/gorro-navidad.png"
              alt=""
              width={512}
              height={512}
              className="pointer-events-none absolute -right-3 -top-8 z-20 h-16 w-16 rotate-[20deg] object-contain sm:-right-4 sm:-top-10 sm:h-20 sm:w-20"
            />
            <span className="flex shrink-0 items-center whitespace-nowrap rounded-full bg-[#fff0de] px-3 py-2 font-bold text-[#003a59] sm:px-6">Apoya a la causa</span>
            <span className="flex items-center px-3 py-2 font-semibold leading-tight text-white sm:px-6">Campaña especial<br className="sm:hidden" /> de Navidad</span>
          </div>

          <div className="relative mt-6 grid grid-cols-1 items-end gap-4 sm:mt-8 sm:gap-6 lg:mt-12 lg:min-h-[510px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <div className="relative z-10 max-w-[270px] sm:max-w-[390px] lg:max-w-[610px]">
              <h1 id="christmas-title" className="w-full">
                <svg
                  aria-labelledby="campaign-title-label"
                  className="block h-auto w-full overflow-visible"
                  role="img"
                  viewBox="0 0 663 241"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title id="campaign-title-label">¡Que llegue! Tu apoyo</title>
                  <use href="/que-llegue-tu-apoyo.svg#campaign-title-art" width="663" height="241" />
                </svg>
              </h1>
              <p className="mt-7 max-w-[320px] text-lg font-semibold leading-tight sm:max-w-[500px] sm:text-2xl lg:text-3xl">
                Esta Navidad, hagamos <span className="text-[#ffc631]">que llegue</span> el alimento, el abrigo y la esperanza a quienes más lo necesitan.
              </p>
              <button
                type="button"
                onClick={() => {
                  const target = paymentButtonRef.current ?? donationSectionRef.current;
                  target?.scrollIntoView({ behavior: "smooth", block: "center" });
                  paymentButtonRef.current?.focus({ preventScroll: true });
                }}
                className="relative z-30 mt-4 inline-flex w-fit cursor-pointer items-center justify-center rounded-full bg-[#ec6f1d] px-5 py-2 text-lg font-bold text-white shadow-[0_8px_20px_rgba(0,58,89,.22)] transition-all hover:scale-105 hover:bg-[#d85e0c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:mt-5 sm:px-6 sm:py-3 sm:text-3xl lg:text-4xl"
              >
                ¡DONA AHORA!
              </button>
            </div>

            <div aria-hidden="true" className="relative z-0 ml-auto mt-2 w-[64%] max-w-[290px] sm:max-w-[475px] lg:ml-0 lg:mt-0 lg:w-full lg:max-w-[540px] lg:justify-self-end">
              <Image
                src="/navidad-voluntaria.png"
                alt=""
                width={1199}
                height={1148}
                priority
                className="h-auto w-full drop-shadow-[0_0_7px_rgba(255,255,255,.85)]"
              />
            </div>
            <div aria-hidden="true" className="absolute right-1 top-2 hidden h-24 w-24 items-center justify-center rounded-full border border-[#f8dcc3] text-[#f8dcc3] sm:flex lg:right-12">
              <Snowflake className="h-12 w-12" strokeWidth={1.3} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 -mt-16 isolate sm:-mt-20">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-16 z-0 bg-[#003a59] sm:top-20" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 sm:px-8 lg:px-12">
          <div className="relative z-10 -mx-2 w-[calc(100%+1rem)] rounded-[28px] bg-white p-5 shadow-[0_15px_35px_rgba(16,45,76,.12)] sm:mx-0 sm:w-auto sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl lg:text-3xl">Recaudación navideña</h2>
                <p className="mt-2 text-4xl font-black tracking-tight text-[#ec6f1d] sm:text-5xl lg:text-6xl">
                  ${collectedAmount.toLocaleString("es-EC")} <span className="text-[.55em]">USD</span>
                </p>
              </div>
              <p className="rounded-full bg-[#f4f6f8] px-4 py-2 text-sm sm:text-base">Meta: <strong>$10.000 USD</strong></p>
            </div>
            <div className="mt-5 h-4 overflow-hidden rounded-full bg-[#e3e8ec]" role="progressbar" aria-label="Progreso de recaudación navideña" aria-valuemin={0} aria-valuemax={GOAL} aria-valuenow={collectedAmount}>
              <div className="h-full rounded-full bg-[#007e8a] transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm sm:text-lg">
              <span><strong>{progressPercentage}%</strong> recaudado</span>
              <span className="inline-flex items-center gap-2"><HandHeart className="h-5 w-5 text-[#ec6f1d]" aria-hidden="true" /> <strong>{donationsCount}</strong> donaciones</span>
            </div>
            <p className="mt-3 text-xs text-[#53697d]">La recaudación se mostrará al confirmar las donaciones de esta campaña.</p>
          </div>

          <div className="mt-10 sm:mt-14">
            <h2 className="mb-5 text-2xl font-black tracking-tight text-white sm:text-3xl">Objetivo navideño</h2>
            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              <GoalPill
                icon={<Image src="/objetivo-donacion-dinero.svg" alt="" width={250} height={248} className="h-14 w-14 object-contain sm:h-16 sm:w-16" aria-hidden="true" />}
              >
                10.000 USD
              </GoalPill>
              <GoalPill
                icon={<Image src="/objetivo-alimentos.svg" alt="" width={260} height={250} className="h-14 w-14 object-contain sm:h-16 sm:w-16" aria-hidden="true" />}
              >
                <>10.000 kg<br />de alimentos</>
              </GoalPill>
              <GoalPill
                icon={<Image src="/objetivo-juguetes.svg" alt="" width={264} height={262} className="h-14 w-14 object-contain sm:h-16 sm:w-16" aria-hidden="true" />}
              >
                <>2.000 kg<br />ropa y juguetes</>
              </GoalPill>
            </div>
          </div>
        </div>
      </div>

      <div ref={donationSectionRef} id="donar-deuna" className="mx-auto max-w-7xl px-4 pb-14 sm:px-8 sm:pb-20 lg:px-12">
        <div className="relative -mt-1 rounded-[2rem] bg-[#fffdf8] p-5 shadow-[0_12px_34px_rgba(16,45,76,.1)] sm:p-8 lg:p-10">
          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl lg:text-3xl">Elige tu monto de donación</h2>
          <div className="mt-4 grid grid-cols-4 gap-2 sm:mt-5 sm:gap-3">
            {SUGGESTED_AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={customAmount === "" && amount === value}
                onClick={() => handleSelectPreset(value)}
                className={`min-h-14 rounded-full border-2 px-1 text-sm font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003a59] sm:text-lg ${customAmount === "" && amount === value ? "border-[#007e8a] bg-[#007e8a] text-white" : "border-[#d6dde4] bg-white hover:border-[#ec6f1d]"}`}
              >${value}</button>
            ))}
            <label className={`relative col-span-4 flex min-h-14 min-w-0 items-center justify-center rounded-full border-2 px-3 sm:px-4 ${customAmount !== "" ? "border-[#007e8a] bg-[#e1f4f2]" : "border-[#d6dde4]"}`}>
              <span className="pointer-events-none absolute left-2 text-sm font-extrabold text-[#003a59] sm:left-3 sm:text-lg">$</span>
              <input
                aria-label="Otro monto en dólares"
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                placeholder="Otro monto"
                value={customAmount}
                onChange={(event) => handleCustomAmountChange(event.target.value)}
                className={`w-full min-w-0 bg-transparent text-xs font-extrabold text-[#003a59] outline-none placeholder:text-[#003a59] sm:text-lg ${customAmount ? "px-2 text-center" : "pl-5 pr-0 text-left sm:pl-7"}`}
              />
            </label>
          </div>

          {/* ── Selector de las 2 opciones: Link a app Deuna vs QR ── */}
          <div className="mt-6 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setDeviceMode("celular")}
              className={`flex items-center justify-center gap-2.5 rounded-2xl border-2 px-4 py-3.5 transition-all ${
                deviceMode === "celular"
                  ? "border-[#007e8a] bg-[#e1f4f2] text-[#003a59] shadow-sm"
                  : "border-[#d6dde4] bg-white text-[#53697d] hover:border-[#007e8a]/50"
              }`}
            >
              <Smartphone className="h-5 w-5 shrink-0 text-[#007e8a]" />
              <span className="text-sm font-extrabold text-[#003a59] sm:text-base">
                Link a app Deuna
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDeviceMode("compu")}
              className={`flex items-center justify-center gap-2.5 rounded-2xl border-2 px-4 py-3.5 transition-all ${
                deviceMode === "compu"
                  ? "border-[#007e8a] bg-[#e1f4f2] text-[#003a59] shadow-sm"
                  : "border-[#d6dde4] bg-white text-[#53697d] hover:border-[#007e8a]/50"
              }`}
            >
              <QrCode className="h-5 w-5 shrink-0 text-[#007e8a]" />
              <span className="text-sm font-extrabold text-[#003a59] sm:text-base">
                QR
              </span>
            </button>
          </div>

          {!paymentData ? (
            <>
              <button
                ref={paymentButtonRef}
                type="button"
                onClick={startDonation}
                disabled={
                  !Number.isFinite(selectedAmount) ||
                  selectedAmount < 1 ||
                  isGenerating
                }
                className="mt-6 flex min-h-16 w-full items-center justify-center gap-3 rounded-full bg-[#ec6f1d] px-5 text-center text-base font-extrabold text-white transition-colors hover:bg-[#d85e0c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003a59] disabled:cursor-not-allowed disabled:opacity-50 sm:text-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin shrink-0" aria-hidden="true" />
                    <span>Generando pago Deuna...</span>
                  </>
                ) : (
                  <>
                    <span>Continuar al pago con Deuna</span>
                    <ArrowRight className="h-6 w-6 shrink-0" aria-hidden="true" />
                  </>
                )}
              </button>

              {paymentError && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}
            </>
          ) : (
            <div className="mt-6 rounded-3xl border-2 border-[#007e8a] bg-white p-5 shadow-md sm:p-7">
              <div className="border-b border-[#e3e8ec] pb-3 text-center">
                <h3 className="text-lg font-extrabold text-[#003a59] sm:text-xl">
                  Donación navideña: ${paymentData.amount.toFixed(2)} USD
                </h3>
              </div>

              {deviceMode === "celular" ? (
                <div className="mt-5 flex flex-col items-center">
                  {paymentData.deeplink ? (
                    <a
                      href={paymentData.deeplink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-16 w-full items-center justify-center gap-3 rounded-full bg-[#ec6f1d] px-6 py-4 text-center text-base font-extrabold text-white shadow-lg transition-transform hover:scale-[1.01] hover:bg-[#d85e0c] sm:text-xl"
                    >
                      <Smartphone className="h-6 w-6 shrink-0" />
                      <span>Abrir aplicación Deuna (${paymentData.amount} USD)</span>
                      <ExternalLink className="h-5 w-5 shrink-0" />
                    </a>
                  ) : null}
                </div>
              ) : (
                <div className="mt-5 flex flex-col items-center justify-center">
                  {paymentData.qr && (
                    <Image
                      src={paymentData.qr}
                      alt="Código QR Deuna"
                      width={240}
                      height={240}
                      unoptimized
                      className="h-60 w-60 rounded-2xl border-2 border-[#007e8a]/30 bg-white p-2"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <p className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-4 text-sm leading-snug sm:text-base">
          <ShieldCheck className="h-9 w-9 shrink-0 text-[#ec6f1d]" aria-hidden="true" />
          <span>Tu aporte se destina a la campaña de Navidad de <strong>Banco de Alimentos Quito.</strong></span>
        </p>
      </div>
    </section>
  );
}
