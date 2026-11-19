"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  HandHeart,
  QrCode,
  ShieldCheck,
  Snowflake,
} from "lucide-react";

const GOAL = 10_000;
const SUGGESTED_AMOUNTS = [5, 10, 20, 50];

export default function ChristmasCampaign() {
  const router = useRouter();
  const [amount, setAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState("");
  const selectedAmount = customAmount === "" ? amount : Number(customAmount);

  const startDonation = () => {
    if (!Number.isFinite(selectedAmount) || selectedAmount < 1) return;
    router.push(`/donacion/deuna?monto=${selectedAmount}`);
  };

  return (
    <section id="apoya-la-causa" aria-labelledby="christmas-title" className="bg-[#fffaf5] text-[#102d4c]">
      <div className="relative isolate overflow-hidden bg-[#102d4c] text-white">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] w-full sm:h-[44%] lg:h-[48%]"
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
        >
          <path d="M0 295 C170 215 340 290 490 235 C680 165 710 35 1000 0 L1000 400 L0 400 Z" fill="#EF7119" />
        </svg>
        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-12 lg:pb-28 lg:pt-20">
          <div className="relative z-10 inline-flex max-w-full items-stretch overflow-visible rounded-full border border-white/30 bg-[#EF7119] text-sm shadow-[0_7px_20px_rgba(5,22,43,.16)] sm:text-base">
            <Image
              aria-hidden="true"
              src="/gorro-navidad.png"
              alt=""
              width={512}
              height={512}
              className="pointer-events-none absolute -right-3 -top-8 z-20 h-16 w-16 rotate-[20deg] object-contain sm:-right-4 sm:-top-10 sm:h-20 sm:w-20"
            />
            <span className="flex items-center rounded-full bg-[#fff0de] px-4 py-2 font-extrabold text-[#102d4c] sm:px-6">Apoya a la causa</span>
            <span className="flex items-center px-4 py-2 font-semibold leading-tight text-white sm:px-6">Campaña especial<br className="sm:hidden" /> de Navidad</span>
          </div>

          <div className="relative mt-8 min-h-[525px] sm:min-h-[580px] lg:mt-12 lg:min-h-[510px]">
            <div className="relative z-10 max-w-[270px] sm:max-w-[390px] lg:max-w-[610px]">
              <h1 id="christmas-title" className="text-[clamp(3.25rem,13vw,5.5rem)] font-black uppercase leading-[.91] tracking-[-.035em] lg:text-[clamp(5.5rem,7vw,7rem)]">
                <span className="block">¡Que</span>
                <span className="block text-[#EF7119]">llegue</span>
                <span className="mt-2 inline-block -rotate-[2deg] rounded-xl bg-[#fff0de] px-3 py-1 text-[.69em] leading-[1] text-[#102d4c] sm:px-5">tu aporte!</span>
              </h1>
              <p className="mt-7 max-w-[320px] text-lg font-bold leading-tight sm:max-w-[500px] sm:text-2xl lg:text-3xl">
                Esta Navidad, hagamos <span className="text-[#e6ed4a]">que llegue</span> el alimento, el abrigo y la esperanza a quienes más lo necesitan.
              </p>
              <p className="mt-5 text-2xl font-black text-[#EF7119] sm:text-3xl lg:text-4xl">¡DONA AHORA!</p>
            </div>

            <div aria-hidden="true" className="absolute -right-6 bottom-0 z-0 w-[62%] max-w-[290px] sm:right-0 sm:w-[64%] sm:max-w-[475px] lg:-bottom-16 lg:right-0 lg:w-[53%] lg:max-w-[540px]">
              <Image
                src="/navidad-voluntaria.png"
                alt=""
                width={1199}
                height={1312}
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

      <div className="relative -mt-16 isolate sm:-mt-20">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-16 z-0 bg-[#f9e8d9] sm:top-20" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 sm:px-8 lg:px-12">
          <div className="relative z-10 -mx-2 w-[calc(100%+1rem)] rounded-[28px] bg-white p-5 shadow-[0_15px_35px_rgba(16,45,76,.12)] sm:mx-0 sm:w-auto sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl lg:text-3xl">Recaudación navideña</h2>
                <p className="mt-2 text-4xl font-black tracking-tight text-[#EF7119] sm:text-5xl lg:text-6xl">$0 <span className="text-[.55em]">USD</span></p>
              </div>
              <p className="rounded-full bg-[#f4f6f8] px-4 py-2 text-sm sm:text-base">Meta: <strong>$10.000 USD</strong></p>
            </div>
            <div className="mt-5 h-4 overflow-hidden rounded-full bg-[#e3e8ec]" role="progressbar" aria-label="Progreso de recaudación navideña" aria-valuemin={0} aria-valuemax={GOAL} aria-valuenow={0}>
              <div className="h-full rounded-full bg-[#EF7119]" style={{ width: "0%" }} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm sm:text-lg">
              <span><strong>0%</strong> recaudado</span>
              <span className="inline-flex items-center gap-2"><HandHeart className="h-5 w-5 text-[#EF7119]" aria-hidden="true" /> <strong>0</strong> donaciones</span>
            </div>
            <p className="mt-3 text-xs text-[#53697d]">La recaudación se mostrará al confirmar las donaciones de esta campaña.</p>
          </div>

          <div className="mt-10 sm:mt-14">
            <h2 className="mb-5 text-2xl font-black tracking-tight sm:text-3xl">Objetivo navideño</h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl bg-[#fff4e9] p-2 text-center text-[#102d4c] ring-2 ring-[#EF7119] sm:aspect-auto sm:min-h-28 sm:gap-2.5 sm:rounded-2xl sm:p-4">
                <Image src="/money-icon.svg" alt="" width={123} height={91} className="h-7 w-8 shrink-0 object-contain sm:h-9 sm:w-10" aria-hidden="true" style={{ filter: "brightness(0) saturate(100%) invert(48%) sepia(96%) saturate(1785%) hue-rotate(353deg) brightness(100%) contrast(93%)" }} />
                <strong className="text-xs leading-tight sm:text-base">10.000 USD</strong>
              </div>
              <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl bg-[#102d4c] p-2 text-center text-white sm:aspect-auto sm:min-h-28 sm:gap-2.5 sm:rounded-2xl sm:p-4">
                <Image src="/fresh-apple-icon.svg" alt="" width={106} height={123} className="h-7 w-7 shrink-0 object-contain sm:h-9 sm:w-9" aria-hidden="true" />
                <strong className="text-[11px] leading-tight sm:text-base">10.000 kg<br />de alimentos</strong>
              </div>
              <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl bg-[#102d4c] p-2 text-center text-white sm:aspect-auto sm:min-h-28 sm:gap-2.5 sm:rounded-2xl sm:p-4">
                <div className="flex items-center justify-center gap-1" aria-hidden="true">
                  <Image src="/hoodie-merchandise.svg" alt="" width={123} height={113} className="h-7 w-8 shrink-0 object-contain sm:h-9 sm:w-10" />
                  <Image src="/toys-icon.svg" alt="" width={411} height={513} className="h-7 w-6 shrink-0 object-contain sm:h-9 sm:w-7" style={{ filter: "brightness(0) saturate(100%) invert(84%) sepia(24%) saturate(583%) hue-rotate(344deg) brightness(104%) contrast(93%)" }} />
                </div>
                <strong className="text-[11px] leading-tight sm:text-base">2.000 kg<br />ropa y juguetes</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-8 sm:pb-20 lg:px-12">
        <div className="relative -mt-1 rounded-[28px] bg-white p-5 shadow-[0_12px_34px_rgba(16,45,76,.1)] sm:p-8 lg:p-10">
          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl lg:text-3xl">Elige tu monto de donación</h2>
          <div className="mt-4 grid grid-cols-4 gap-2 sm:mt-5 sm:gap-3">
            {SUGGESTED_AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={customAmount === "" && amount === value}
                onClick={() => { setAmount(value); setCustomAmount(""); }}
                className={`min-h-14 rounded-lg border-2 px-1 text-sm font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#102d4c] sm:rounded-xl sm:text-lg ${customAmount === "" && amount === value ? "border-[#EF7119] bg-[#fff0de] text-[#102d4c]" : "border-[#d6dde4] bg-white hover:border-[#EF7119]"}`}
              >${value}</button>
            ))}
            <label className={`relative col-span-4 flex min-h-14 min-w-0 items-center justify-center rounded-lg border-2 px-3 sm:rounded-xl sm:px-4 ${customAmount !== "" ? "border-[#EF7119] bg-[#fff0de]" : "border-[#d6dde4]"}`}>
              <span className="pointer-events-none absolute left-2 text-sm font-extrabold text-[#102d4c] sm:left-3 sm:text-lg">$</span>
              <input
                aria-label="Otro monto en dólares"
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                placeholder="Otro monto"
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value)}
                className={`w-full min-w-0 bg-transparent text-xs font-extrabold text-[#102d4c] outline-none placeholder:text-[#102d4c] sm:text-lg ${customAmount ? "px-2 text-center" : "pl-5 pr-0 text-left sm:pl-7"}`}
              />
            </label>
          </div>
          <button
            type="button"
            onClick={startDonation}
            disabled={!Number.isFinite(selectedAmount) || selectedAmount < 1}
            className="mt-6 flex min-h-16 w-full items-center justify-center gap-3 rounded-full bg-[#EF7119] px-5 text-center text-base font-extrabold text-white transition-colors hover:bg-[#d85e0c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#102d4c] disabled:cursor-not-allowed disabled:opacity-50 sm:text-xl"
          >
            <span>Continuar al pago con Deuna</span><ArrowRight className="h-6 w-6 shrink-0" aria-hidden="true" />
          </button>
          <div className="mt-3 flex items-center gap-4 rounded-2xl bg-[#f4f6f8] px-4 py-3.5 sm:px-6">
            <QrCode className="h-9 w-9 shrink-0 text-[#102d4c] sm:h-11 sm:w-11" aria-hidden="true" />
            <p className="border-l border-[#9babb9] pl-4 text-sm leading-snug sm:pl-6 sm:text-base"><strong className="block">Pago mediante código QR</strong>En el siguiente paso escanearás un código QR con la app de Deuna.</p>
          </div>
        </div>
        <p className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-4 text-sm leading-snug sm:text-base">
          <ShieldCheck className="h-9 w-9 shrink-0 text-[#EF7119]" aria-hidden="true" />
          <span>Tu aporte se destina a la campaña de Navidad de <strong>Banco de Alimentos Quito.</strong></span>
        </p>
      </div>
    </section>
  );
}
