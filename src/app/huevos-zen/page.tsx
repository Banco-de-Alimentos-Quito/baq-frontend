"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Truck,
  Egg,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

export default function HuevosZenPage() {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  const toggleMoreInfo = () => {
    const nextState = !showMoreInfo;
    setShowMoreInfo(nextState);
    if (nextState) {
      setTimeout(() => {
        infoRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  };

  const highlights = [
    {
      icon: <Egg className="w-5 h-5 text-amber-400" />,
      title: "Huevos Orgánicos",
      desc: "Huevos 100% orgánicos, frescos y con los más altos estándares de calidad y nutrición.",
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-orange-400" />,
      title: "Impacto Solidario",
      desc: "Cada cubeta entregada financia nutrición digna para niños vulnerables de Quito.",
    },
    {
      icon: <Truck className="w-5 h-5 text-amber-300" />,
      title: "A tu Domicilio",
      desc: "Entregas programadas mensuales, quincenales o semanales en todo Quito.",
    },
  ];

  return (
    <main className="relative min-h-screen bg-slate-950 text-white overflow-x-hidden pt-20 lg:pt-0 flex flex-col">
      {/* ── SECCIÓN 1: SLIDE PRINCIPAL / HERO ── */}
      <section className="relative min-h-screen w-full flex flex-col justify-center overflow-hidden">
        {/* Background Image con degradado cinemático */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000"
            style={{
              backgroundImage: `url('/huevos-zen/huevos_zen_caja.jpeg')`,
            }}
          />
          {/* Capas de gradientes suaves para máxima legibilidad y estética premium */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        {/* Decorative ambient lights */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Slide Index Number Indicator (01) */}
        <div className="absolute top-20 right-6 sm:right-12 lg:right-16 select-none pointer-events-none z-0 opacity-15">
          <span className="font-black text-7xl sm:text-9xl lg:text-[11rem] tracking-tighter text-white/40 font-mono">
            01
          </span>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Columna Principal: Texto y CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Título Principal */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                  Huevos <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200">Zen</span>
                </h1>
                <p className="text-xl sm:text-2xl font-medium text-orange-100/90 leading-snug">
                  Infancias nutridas, gallinas felices.
                </p>
              </div>

              {/* Descripción */}
              <p className="text-base sm:text-lg text-slate-300/90 max-w-2xl leading-relaxed">
                Un programa único que conecta la producción de huevos orgánicos con la nutrición infantil en el Ecuador. Disfruta huevos frescos de la más alta calidad mientras apoyas a miles de niños.
              </p>

              {/* Lista de beneficios breves */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Cobro automático seguro mensual</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Presentaciones de 12 y 30 unidades</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Descuento por frecuencia mensual, quincenal y semanal</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Cobertura en todo Quito</span>
                </div>
              </div>

              {/* Botón CTA Principal y Opción MÁS INFORMACIÓN Centrada */}
              <div className="pt-4 flex flex-col items-stretch sm:items-start gap-3">
                <Link
                  href="/huevos-zen/suscripcion"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#ED6F1D] to-orange-500 hover:from-orange-600 hover:to-[#ED6F1D] text-white text-base font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
                >
                  <span>Suscribirme al Programa</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Opción MÁS INFORMACIÓN: Centrada debajo del botón de Suscribirme al Programa */}
                <div className="w-full sm:w-[285px] flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={toggleMoreInfo}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase text-slate-300 hover:text-orange-300 bg-slate-900/80 hover:bg-slate-800/90 border border-white/15 hover:border-orange-500/40 backdrop-blur-md shadow-md hover:shadow-orange-500/10 transition-all duration-200 cursor-pointer group active:scale-95"
                  >
                    <Info className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
                    <span>{showMoreInfo ? "Menos información" : "Más información"}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-orange-400 transition-transform duration-300 ${
                        showMoreInfo ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Columna Derecha: Tarjetas informativas con estética limpia */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 space-y-4"
            >
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  ¿Por qué elegir Huevo Zen?
                </h3>

                <div className="space-y-4">
                  {highlights.map((h, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-orange-500/30 transition-colors"
                    >
                      <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 shrink-0">
                        {h.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          {h.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          {h.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Banner de Garantía */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>Banco de Alimentos Quito</span>
                  <span className="text-orange-400 font-semibold">100% Solidario</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── DESPLIEGUE DE MÁS INFORMACIÓN (IMAGEN A ANCHO COMPLETO DENTRO DE 01) ── */}
      <AnimatePresence>
        {showMoreInfo && (
          <motion.section
            ref={infoRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="relative z-10 w-full min-h-screen bg-slate-950 border-t border-white/10 flex flex-col justify-center items-center overflow-hidden"
          >
            {/* 1. VERSIÓN PC (Escritorio / Laptops): Ocupa prácticamente todo el ancho de la pantalla */}
            <div className="hidden md:block w-full min-h-screen relative">
              <img
                src="/huevos-zen/info_desktop.png"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedJpg) {
                    target.dataset.triedJpg = "true";
                    target.src = "/huevos-zen/info_desktop.jpg";
                  } else {
                    target.src = "/huevos-zen/info_desktop_placeholder.svg";
                  }
                }}
                alt="Arte Huevo Zen Desktop"
                className="w-full h-full min-h-screen object-cover object-center"
              />
            </div>

            {/* 2. VERSIÓN MÓVIL (Celulares): Ocupa prácticamente todo el ancho de la pantalla */}
            <div className="block md:hidden w-full min-h-screen relative">
              <img
                src="/huevos-zen/info_mobile.png"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedJpg) {
                    target.dataset.triedJpg = "true";
                    target.src = "/huevos-zen/info_mobile.jpg";
                  } else {
                    target.src = "/huevos-zen/info_mobile_placeholder.svg";
                  }
                }}
                alt="Arte Huevo Zen Móvil"
                className="w-full h-full min-h-screen object-cover object-center"
              />
            </div>

            {/* Botón flotante discreto para cerrar información */}
            <div className="absolute bottom-8 z-20 flex items-center justify-center">
              <button
                type="button"
                onClick={toggleMoreInfo}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-white/20 hover:border-orange-500/40 text-white text-xs sm:text-sm font-semibold tracking-wider uppercase backdrop-blur-md shadow-2xl transition-all duration-200 cursor-pointer active:scale-95"
              >
                <ChevronUp className="w-4 h-4 text-orange-400" />
                <span>Cerrar</span>
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
