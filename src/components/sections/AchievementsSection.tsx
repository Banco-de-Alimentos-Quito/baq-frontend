"use client";

import React, { useEffect, useRef, useState } from "react";

// ── Animated counter hook ──────────────────────────────────────────────
function useCountUp(end: number, duration = 2000, startOnView = true) {
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

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, startOnView]);

  return { count, ref };
}

// ── Format helpers ─────────────────────────────────────────────────────
/** Formats a number with dots as thousands separator: 86000 → "86.000" */
function formatDot(n: number) {
  return n.toLocaleString("de-DE");
}

// ── Stat card with counter ─────────────────────────────────────────────
interface StatCardProps {
  imageSrc: string;
  imageAlt: string;
  endValue: number;
  prefix?: string;
  label: string;
  formatFn?: (n: number) => string;
}

const StatCard: React.FC<StatCardProps> = ({
  imageSrc,
  imageAlt,
  endValue,
  prefix = "",
  label,
  formatFn = formatDot,
}) => {
  const { count, ref } = useCountUp(endValue, 2200);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28 md:w-32 md:h-32">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
      <span
        ref={ref}
        className="text-2xl md:text-3xl font-extrabold text-orange-500 tabular-nums"
      >
        {prefix}{formatFn(count)}
      </span>
      <span className="text-xs md:text-sm font-semibold text-gray-700 bg-orange-100 px-3 py-1 rounded-full whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};

// ── Main section ───────────────────────────────────────────────────────
const AchievementsSection: React.FC = () => {
  const { count: kilosCount, ref: kilosRef } = useCountUp(4474354, 2500);

  /** Formats the kilos number as 4'474.354 */
  const formatKilos = (n: number) => {
    const str = n.toString().padStart(7, "0");
    const millions = str.slice(0, -6) || "0";
    const thousands = str.slice(-6, -3);
    const units = str.slice(-3);
    return `${millions}'${thousands}.${units}`;
  };

  return (
    <section id="achievements-section" className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 max-w-6xl mx-auto">
          {/* Left: Hero photo — unoptimized to preserve original JPEG quality */}
          <div className="w-full lg:w-5/12 flex-shrink-0">
            <div className="relative aspect-[3/4] w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/achievements/IMG_6840.JPEG"
                alt="Beneficiaria del Banco de Alimentos de Quito recibiendo productos"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Stats */}
          <div className="w-full lg:w-7/12 flex flex-col gap-10">
            {/* "Atendimos a:" section */}
            <div>
              <p className="text-lg md:text-xl font-bold text-primary mb-1">
                En el 2025
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
                Atendimos a:
              </h2>

              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <StatCard
                  imageSrc="/achievements/PERSONAS.png"
                  imageAlt="Ilustración de personas atendidas"
                  endValue={86000}
                  prefix="+"
                  label="Personas"
                />
                <StatCard
                  imageSrc="/achievements/FAMILIAS.png"
                  imageAlt="Ilustración de familias beneficiadas"
                  endValue={4600}
                  prefix="+"
                  label="Familias Beneficiadas"
                />
                <StatCard
                  imageSrc="/achievements/INSTITUCIONES.png"
                  imageAlt="Ilustración de instituciones apoyadas"
                  endValue={97}
                  label="Instituciones"
                />
              </div>
            </div>

            {/* "Entregando:" section — centered */}
            <div className="flex flex-col items-center">
              <h3 className="text-3xl font-bold tracking-tight sm:text-4xl text-primary mb-4">
                Entregando:
              </h3>

              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 md:w-40 md:h-40">
                  <img
                    src="/achievements/ALIMENTOS.png"
                    alt="Ilustración de bolsa de alimentos"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
                <span
                  ref={kilosRef}
                  className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-800 mt-2 tabular-nums"
                >
                  {formatKilos(kilosCount)}
                </span>
                <span className="text-sm md:text-base font-semibold text-gray-700 bg-orange-100 px-5 py-1.5 rounded-full mt-2">
                  Kilos de Alimento
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
