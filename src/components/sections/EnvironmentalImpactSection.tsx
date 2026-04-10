"use client";

import React, { useEffect, useRef, useState } from "react";

// ── Animated counter hook ──────────────────────────────────────────────
function useCountUp(end: number, duration = 2000, startOnView = true, decimals = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!startOnView || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const factor = Math.pow(10, decimals);

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end * factor) / factor);
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, startOnView, decimals]);

  return { count, ref };
}

// ── Main section ───────────────────────────────────────────────────────
const EnvironmentalImpactSection: React.FC = () => {
  const { count: co2Count, ref: co2Ref } = useCountUp(2.46, 2200, true, 2);
  const { count: ch4Count, ref: ch4Ref } = useCountUp(101.57, 2200, true, 2);
  const { count: carsCount, ref: carsRef } = useCountUp(534, 2000);

  return (
    <section id="environmental-impact-section" className="pb-16 md:pb-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Impacto Ambiental
            </h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto mt-4"></div>
          </div>

          {/* Stats grid — centered */}
          <div className="grid grid-cols-2 gap-6 md:gap-10 max-w-2xl mx-auto">
            {/* CO2 */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                <img
                  src="/environmental/dioxido-de-carbono.png"
                  alt="Ilustración de planeta tierra - dióxido de carbono"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <div>
                <span
                  ref={co2Ref}
                  className="text-3xl md:text-4xl font-extrabold text-orange-500 tabular-nums"
                >
                  {co2Count.toFixed(2)}
                </span>
                <span className="text-xl md:text-2xl font-bold text-orange-500 ml-1">
                  mil
                </span>
              </div>
              <div className="space-y-1">
                <span className="block text-xs md:text-sm font-semibold text-gray-700 bg-orange-100 px-3 py-1 rounded-full">
                  Emisiones de CO₂ evitadas
                </span>
                <span className="block text-xs text-gray-500 font-medium">
                  (toneladas métricas)
                </span>
                <span className="block text-xs md:text-sm font-semibold text-orange-600">
                  (dióxido de carbono)
                </span>
              </div>
            </div>

            {/* CH4 */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                <img
                  src="/environmental/gases-de-metano.png"
                  alt="Ilustración de gases de metano"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <div>
                <span
                  ref={ch4Ref}
                  className="text-3xl md:text-4xl font-extrabold text-orange-500 tabular-nums"
                >
                  {ch4Count.toFixed(2)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="block text-xs md:text-sm font-semibold text-gray-700 bg-orange-100 px-3 py-1 rounded-full">
                  Emisiones de CH₄ evitadas
                </span>
                <span className="block text-xs text-gray-500 font-medium">
                  (toneladas métricas)
                </span>
                <span className="block text-xs md:text-sm font-semibold text-orange-600">
                  (gases de metano)
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle equivalence */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="text-center sm:text-right">
              <p className="text-sm md:text-base text-gray-600 font-medium">
                Vehículos equivalentes por año
              </p>
              <p className="text-xs text-gray-400">
                (1 vehículo = 4.6tCO₂/año)
              </p>
            </div>
            <div className="bg-orange-500 text-white px-6 py-3 rounded-xl shadow-lg">
              <span className="text-xl md:text-2xl font-extrabold">
                +<span ref={carsRef} className="tabular-nums">{carsCount}</span>
              </span>
              <span className="block text-sm font-semibold">
                autos recorridos en la ciudad de Quito
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-sm font-bold text-gray-700">
              Banco de Alimentos Quito 2025
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnvironmentalImpactSection;

