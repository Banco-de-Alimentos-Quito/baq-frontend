'use client';

import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import Image from 'next/image';

// ─── COLORS ──────────────────────────────────────────────────────────────────
const HZ_ORANGE  = '#EB711B';
const HZ_GREEN   = '#7C9A44';
const HZ_DKGREEN = '#2a5c32';
const HZ_CREAM   = '#fdf6ec';
const HZ_DARK    = '#1a2e05';
const WA_GREEN   = '#25D366';

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────
export function HeroHuevosZen() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #fdf6ec 0%, #fff8f0 60%, #f0faf0 100%)',
      borderRadius: '24px',
      padding: '3rem 2rem',
      marginBottom: '2rem',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '2rem',
      border: '1px solid #f0e0c8',
    }}>
      <div style={{ flex: '1 1 300px' }}>
        <Image
          src="/huevos-zen-logo.png"
          alt="Huevos Zen Logo"
          width={260}
          height={180}
          style={{ objectFit: 'contain' }}
        />
        <h2 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 900,
          color: HZ_DARK,
          lineHeight: 1.15,
          margin: '1rem 0 0.5rem',
        }}>
          El huevo que<br />
          <span style={{ color: HZ_ORANGE }}>alimenta dos veces</span>
        </h2>
        <p style={{ color: '#4a6741', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Más nutritivo para tu familia.<br />
          Más justo para los productores.<br />
          Más digno para los animales.
        </p>
        <p style={{ color: '#5a6e55', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Cada Huevo Zen que compras ayuda a combatir la desnutrición infantil en Ecuador.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="https://wa.me/5930983208675?text=Hola%2C%20quiero%20suscribirme%20a%20Huevos%20Zen"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.85rem 2rem', borderRadius: '10px',
              background: HZ_ORANGE, color: '#fff',
              fontWeight: 700, fontSize: '1rem',
              textDecoration: 'none', boxShadow: '0 4px 20px rgba(235,113,27,0.35)',
            }}
          >
            🛒 Suscribirme ahora
          </a>
          <a
            href="/configuration"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.85rem 2rem', borderRadius: '10px',
              background: 'transparent', color: HZ_GREEN,
              fontWeight: 700, fontSize: '1rem',
              textDecoration: 'none',
              border: `2px solid ${HZ_GREEN}`,
            }}
          >
            Soy empresa / cotizar
          </a>
        </div>
      </div>
      <div style={{ flex: '1 1 260px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          border: '1px solid #f0e0c8',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            CIBU · Alimentos con Propósito
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', padding: '1rem 0' }}>
            {[
              { icon: '🥚', label: 'Más vitaminas A, D y E' },
              { icon: '💚', label: 'Omega 3 natural' },
              { icon: '🐔', label: 'Libre de jaulas' },
              { icon: '⭐', label: 'Sabor superior' },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center', width: '80px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{item.icon}</div>
                <p style={{ fontSize: '0.72rem', color: '#5a6e55', lineHeight: 1.3 }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIPLE IMPACT BANNER
// ─────────────────────────────────────────────────────────────────────────────
export function TripleImpactBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a2e05 0%, #2d5016 50%, #3a7d44 100%)',
      borderRadius: '24px',
      padding: '2.5rem 2rem',
      marginBottom: '2rem',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* decorative */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.05,
        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
          MEMBRESÍAS HUEVOS ZEN
        </p>
        <h2 style={{ color: 'white', fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,2.4rem)', margin: '0 0 0.2rem' }}>
          Nutrición que transforma vidas 🫶
        </h2>
        <p style={{ color: '#4ade80', fontWeight: 700, fontSize: '1.15rem', margin: '0 0 1.5rem', fontStyle: 'italic' }}>
          Un verdadero <strong style={{ color: 'white' }}>TRIPLE IMPACTO</strong>
        </p>

        {/* Heart card */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(8px)',
          borderRadius: '16px',
          padding: '1.2rem 2rem',
          maxWidth: 520,
          margin: '0 auto 2rem',
        }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>❤️</div>
          <p style={{ color: 'white', fontWeight: 700, fontSize: '1.05rem', margin: 0, lineHeight: 1.5 }}>
            Alimentas <span style={{ color: '#fbbf24' }}>tu hogar</span><br />
            y también el desayuno de un niño que<br />
            <span style={{ color: '#4ade80' }}>realmente lo necesita.</span>
          </p>
        </div>

        {/* Three pillars */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { icon: '🐔', title: 'BIENESTAR ANIMAL', desc: 'Gallinas libres de jaulas y felices.' },
            { icon: '👨‍👩‍👧', title: 'IMPACTO SOCIAL', desc: 'Llevamos proteína de calidad a niños en situación de vulnerabilidad.' },
            { icon: '🌿', title: 'PRODUCCIÓN RESPONSABLE', desc: 'Cuidamos el medio ambiente y apoyamos a productores locales.' },
          ].map((p) => (
            <div key={p.title} style={{
              flex: '1 1 160px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '14px',
              padding: '1.2rem 1rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{p.icon}</div>
              <p style={{ color: '#4ade80', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>{p.title}</p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', lineHeight: 1.4, margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERSHIP PRICING TABLES
// ─────────────────────────────────────────────────────────────────────────────

type PricingPlan = {
  pkg: number;
  eggs: number;
  deliveries: number;
  deliveryLabel: string;
  pricePerTray: number;
  totalPerMonth: number;
  popular?: boolean;
};

const PLANS_30: PricingPlan[] = [
  { pkg: 1, eggs: 30,  deliveries: 1, deliveryLabel: '1 entrega al mes', pricePerTray: 11.00, totalPerMonth: 11.00 },
  { pkg: 2, eggs: 60,  deliveries: 2, deliveryLabel: '2 entregas al mes', pricePerTray: 10.00, totalPerMonth: 20.00, popular: true },
  { pkg: 3, eggs: 120, deliveries: 4, deliveryLabel: '4 entregas al mes', pricePerTray: 9.50,  totalPerMonth: 38.00 },
];

const PLANS_12: PricingPlan[] = [
  { pkg: 1, eggs: 12, deliveries: 1, deliveryLabel: '1 entrega al mes', pricePerTray: 5.00, totalPerMonth: 5.00 },
  { pkg: 2, eggs: 24, deliveries: 2, deliveryLabel: '2 entregas al mes', pricePerTray: 4.50, totalPerMonth: 9.00, popular: true },
  { pkg: 3, eggs: 48, deliveries: 4, deliveryLabel: '4 entregas al mes', pricePerTray: 4.00, totalPerMonth: 16.00 },
];

const PKG_COLORS = ['#3a7d44', '#EB711B', '#f9c74f'];
const PKG_LABELS = ['', '●', '●●', '●●●●'];

function PricingTable({ plans, title, units }: { plans: PricingPlan[]; title: string; units: number }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{
      flex: '1 1 340px',
      background: 'white',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
      border: '1px solid #e8f0e9',
    }}>
      {/* Table header */}
      <div style={{
        background: HZ_GREEN,
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
      }}>
        <span style={{ fontSize: '1.8rem' }}>🥚</span>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', letterSpacing: '0.1em', margin: 0 }}>PRESENTACIÓN DE</p>
          <h3 style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem', margin: 0, lineHeight: 1 }}>
            {units} <span style={{ fontSize: '1rem', fontWeight: 600 }}>UNIDADES</span>
          </h3>
        </div>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '50px 1fr 1fr 90px 80px',
        padding: '0.6rem 1rem',
        background: '#f9f9f7',
        borderBottom: '2px solid #e8f0e9',
        gap: '0.25rem',
      }}>
        {['PKT', 'HUEVOS', 'ENTREGAS', 'VALOR\nCUBETA', 'TOTAL\nMES'].map((col) => (
          <div key={col} style={{ fontSize: '0.62rem', fontWeight: 700, color: '#666', letterSpacing: '0.07em', whiteSpace: 'pre-line', lineHeight: 1.2 }}>{col}</div>
        ))}
      </div>

      {/* Rows */}
      {plans.map((plan) => {
        const color = PKG_COLORS[plan.pkg - 1];
        const isHov = hovered === plan.pkg;
        return (
          <div
            key={plan.pkg}
            onMouseEnter={() => setHovered(plan.pkg)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'grid',
              gridTemplateColumns: '50px 1fr 1fr 90px 80px',
              padding: '0.9rem 1rem',
              borderBottom: '1px solid #f0ede8',
              gap: '0.25rem',
              alignItems: 'center',
              background: isHov ? `${color}0d` : plan.popular ? '#fffbf4' : 'white',
              transition: 'background 0.2s ease',
              cursor: 'default',
              position: 'relative',
            }}
          >
            {/* Popular badge */}
            {plan.popular && (
              <div style={{
                position: 'absolute', top: -1, right: 8,
                background: HZ_ORANGE, color: 'white',
                fontSize: '0.6rem', fontWeight: 700,
                padding: '2px 8px', borderRadius: '0 0 6px 6px',
                letterSpacing: '0.05em',
              }}>
                MÁS POPULAR
              </div>
            )}
            {/* Package number */}
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: color, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '0.9rem',
            }}>
              {plan.pkg}
            </div>
            {/* Eggs */}
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: HZ_DARK }}>{plan.eggs}</span>
              <span style={{ fontSize: '0.75rem', color: '#888' }}> huevos</span>
            </div>
            {/* Deliveries */}
            <div>
              <div style={{ fontSize: '0.78rem', color: '#555', lineHeight: 1.3 }}>{plan.deliveryLabel}</div>
              <div style={{ color: HZ_ORANGE, fontSize: '0.85rem', letterSpacing: '-0.02em' }}>
                {'🚚'.repeat(plan.deliveries > 2 ? 2 : plan.deliveries)}{plan.deliveries > 2 ? ` ×${plan.deliveries}` : ''}
              </div>
            </div>
            {/* Price per tray */}
            <div style={{ fontWeight: 700, color: '#333', fontSize: '0.95rem' }}>
              ${plan.pricePerTray.toFixed(2)}
            </div>
            {/* Total */}
            <div style={{ fontWeight: 900, color: HZ_ORANGE, fontSize: '1.2rem' }}>
              ${plan.totalPerMonth.toFixed(0)}
            </div>
          </div>
        );
      })}

      {/* CTA */}
      <div style={{ padding: '1rem 1.5rem', background: '#fafaf8' }}>
        <a
          href={`https://wa.me/5930983208675?text=Hola%2C%20quiero%20suscribirme%20a%20la%20membres%C3%ADa%20de%20${units}%20unidades`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            padding: '0.75rem', borderRadius: '10px',
            background: WA_GREEN, color: 'white',
            fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(37,211,102,0.3)',
          }}
        >
          📱 Suscribirme por WhatsApp
        </a>
      </div>
    </div>
  );
}

export function MembershipSection() {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{
        textAlign: 'center', color: HZ_DARK, fontWeight: 800,
        fontSize: '1.5rem', marginBottom: '0.5rem',
      }}>
        Elige tu Membresía Huevos Zen
      </h3>
      <p style={{ textAlign: 'center', color: '#5a6e55', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
        Más huevos al mes = menor precio por cubeta · Entrega directo a tu puerta
      </p>

      {/* Savings callout */}
      <div style={{
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'center',
      }}>
        {[
          { icon: '💰', text: 'Ahorra hasta 14% vs precio unitario' },
          { icon: '🚚', text: 'Entrega a domicilio incluida' },
          { icon: '🔄', text: 'Cancela cuando quieras' },
          { icon: '❤️', text: 'Cada compra alimenta a un niño' },
        ].map((b) => (
          <div key={b.text} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'white', padding: '0.5rem 0.9rem', borderRadius: '999px',
            border: '1px solid #e8f0e9', fontSize: '0.82rem', color: '#3a5a40',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <span>{b.icon}</span>
            <span style={{ fontWeight: 600 }}>{b.text}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <PricingTable plans={PLANS_30} title="30 Unidades" units={30} />
        <PricingTable plans={PLANS_12} title="12 Unidades" units={12} />
      </div>


    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NUTRITION IMPACT CHART — 2025 vs 2026
// ─────────────────────────────────────────────────────────────────────────────
const NUTRITION_DATA = {
  2025: [
    { name: 'Normal',              value: 63.2, color: HZ_GREEN },
    { name: 'Desnutrición',        value: 15.8, color: HZ_ORANGE },
    { name: 'Riesgo desnutrición', value: 21.1, color: '#f9c74f' },
  ],
  2026: [
    { name: 'Normal',              value: 82.4, color: HZ_GREEN },
    { name: 'Desnutrición',        value:  8.6, color: HZ_ORANGE },
    { name: 'Riesgo desnutrición', value:  9.0, color: '#f9c74f' },
  ],
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white', borderRadius: '10px', padding: '10px 16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid #f0e0c8',
      }}>
        <p style={{ fontWeight: 700, color: '#1a2e05', margin: 0 }}>{payload[0].name}</p>
        <p style={{ color: payload[0].payload.color, fontWeight: 800, fontSize: '1.2rem', margin: '2px 0 0' }}>
          {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

export function NutritionChart() {
  const [activeYear, setActiveYear] = useState<2025 | 2026>(2025);

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 4px 30px rgba(0,0,0,0.07)',
      border: '1px solid #f0e0c8',
      marginBottom: '2rem',
    }}>
      <h3 style={{ textAlign: 'center', color: HZ_DARK, fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.3rem' }}>
        Tu compra puede cambiar esto hoy
      </h3>
      <p style={{ textAlign: 'center', color: '#5a6e55', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
        En dos años, el consumo regular de Huevos Zen en programas escolares redujo el riesgo de desnutrición infantil del 21% al 9%. Esto no es una promesa. Es un resultado real.
      </p>

      {/* Year Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {([2025, 2026] as const).map((year) => (
          <button
            key={year}
            onClick={() => setActiveYear(year)}
            style={{
              padding: '0.5rem 1.5rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
              background: activeYear === year ? HZ_GREEN : '#f0f0f0',
              color: activeYear === year ? 'white' : '#555',
              fontWeight: 700, fontSize: '0.9rem',
              transition: 'all 0.2s ease',
            }}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Dual Pie Chart */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {([2025, 2026] as const).map((year) => (
          <div key={year} style={{ flex: '1 1 280px', minWidth: 0 }}>
            <p style={{
              textAlign: 'center', fontWeight: 700, fontSize: '1.1rem',
              color: year === activeYear ? HZ_GREEN : '#aaa',
              transition: 'color 0.3s', marginBottom: '0.5rem',
            }}>{year}</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={NUTRITION_DATA[year]}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90}
                  paddingAngle={3} dataKey="value"
                  animationBegin={0} animationDuration={700}
                >
                  {NUTRITION_DATA[year].map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} opacity={year === activeYear ? 1 : 0.35} />
                  ))}
                </Pie>
                {year === activeYear && <Tooltip content={<CustomTooltip />} />}
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: '0 1rem' }}>
              {NUTRITION_DATA[year].map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: item.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: '#555' }}>{item.name}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, color: item.color, fontSize: '0.85rem' }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Delta callout */}
      <div style={{
        marginTop: '1.5rem',
        background: 'linear-gradient(135deg, #f0faf0, #e8f5e9)',
        borderRadius: '12px', padding: '1rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        border: '1px solid #b7dfb9',
      }}>
        <span style={{ fontSize: '2rem' }}>📉</span>
        <div>
          <p style={{ fontWeight: 800, color: HZ_GREEN, margin: 0, fontSize: '1.05rem' }}>
            -12.1% riesgo de desnutrición · +19.2% niños en estado nutricional normal (2025→2026)
          </p>
          <p style={{ color: '#4a6741', margin: 0, fontSize: '0.85rem' }}>
            Valoración nutricional de los estudiantes de la Escuela INTI · Fuente: Banco de Alimentos Quito
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <a
          href="https://wa.me/5930983208675?text=Quiero%20ser%20parte%20del%20cambio%20con%20Huevos%20Zen"
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 2rem', borderRadius: '10px',
            background: HZ_GREEN, color: 'white',
            fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(58,125,68,0.3)',
          }}
        >
          Quiero ser parte del cambio →
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// THREE PILLARS
// ─────────────────────────────────────────────────────────────────────────────
export function ThreePillars() {
  const pillars = [
    { icon: '🐔', title: 'Bienestar animal', desc: 'Gallinas libres, sin crueldad, con alimentación natural y espacio para pastorear.' },
    { icon: '♻️', title: 'Aprovechamiento de alimentos', desc: 'Optimizamos recursos y reducimos desperdicio en toda la cadena productiva.' },
    { icon: '🍎', title: 'Nutrición infantil', desc: 'Cada huevo que vendemos contribuye a alimentar a niños en situación de vulnerabilidad.' },
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ textAlign: 'center', color: HZ_DARK, fontWeight: 800, fontSize: '1.5rem', marginBottom: '1.5rem' }}>
        Tres problemas. Una solución.
      </h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {pillars.map((p) => (
          <div key={p.title} style={{
            flex: '1 1 180px', background: 'white', borderRadius: '16px',
            padding: '1.5rem', textAlign: 'center',
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)', border: '1px solid #f0e0c8',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>{p.icon}</div>
            <h4 style={{ color: HZ_GREEN, fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{p.title}</h4>
            <p style={{ color: '#5a6e55', fontSize: '0.88rem', lineHeight: 1.5 }}>{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON TABLE
// ─────────────────────────────────────────────────────────────────────────────
export function ComparisonTable() {
  const rows = [
    { label: 'Gallinas en libre pastoreo',  industrial: false, zen: true },
    { label: 'Alimentación natural',         industrial: false, zen: true },
    { label: 'Mayor valor nutricional',      industrial: false, zen: true },
    { label: 'Bienestar animal',             industrial: false, zen: true },
    { label: 'Impacto social medible',       industrial: false, zen: true },
    { label: 'Sin antibióticos promotores',  industrial: false, zen: true },
  ];

  return (
    <div style={{
      background: 'white', borderRadius: '20px', overflow: 'hidden',
      boxShadow: '0 4px 30px rgba(0,0,0,0.07)', border: '1px solid #f0e0c8', marginBottom: '2rem',
    }}>
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f0e0c8' }}>
        <h3 style={{ color: HZ_DARK, fontWeight: 800, fontSize: '1.3rem', margin: 0 }}>
          No todos los huevos son iguales
        </h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fdf6ec' }}>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#5a6e55', fontWeight: 600, fontSize: '0.9rem' }}></th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#999', fontWeight: 700, fontSize: '0.9rem' }}>Huevos Industriales</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'center', color: HZ_GREEN, fontWeight: 800, fontSize: '0.95rem' }}>🥚 Huevos Zen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} style={{ borderTop: '1px solid #f5f0ea', background: i % 2 === 0 ? 'white' : '#fafaf8' }}>
                <td style={{ padding: '0.85rem 1.5rem', color: '#333', fontSize: '0.9rem', fontWeight: 500 }}>{row.label}</td>
                <td style={{ padding: '0.85rem 1.5rem', textAlign: 'center', fontSize: '1.1rem' }}>
                  <span style={{ color: '#e74c3c', fontWeight: 800 }}>✗</span>
                </td>
                <td style={{ padding: '0.85rem 1.5rem', textAlign: 'center', fontSize: '1.1rem' }}>
                  <span style={{ color: HZ_GREEN, fontWeight: 800 }}>✓</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '1.5rem 2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid #f0e0c8' }}>
        <a
          href="https://wa.me/5930983208675"
          target="_blank" rel="noopener noreferrer"
          style={{
            flex: 1, textAlign: 'center', padding: '0.85rem', borderRadius: '10px',
            background: HZ_ORANGE, color: 'white', fontWeight: 700, textDecoration: 'none',
            fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(235,113,27,0.3)',
          }}
        >
          Comprar ahora
        </a>
        <a href="/store" style={{
          flex: 1, textAlign: 'center', padding: '0.85rem', borderRadius: '10px',
          background: 'transparent', color: HZ_GREEN, fontWeight: 700, textDecoration: 'none',
          fontSize: '0.95rem', border: `2px solid ${HZ_GREEN}`,
        }}>
          Ver dónde comprar
        </a>
      </div>
    </div>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// IMPACT METRICS + BAR CHART
// ─────────────────────────────────────────────────────────────────────────────
export function ImpactMetrics() {
  return (
    <div style={{
      background: 'white', borderRadius: '20px', padding: '2rem',
      boxShadow: '0 4px 30px rgba(0,0,0,0.07)', border: '1px solid #f0e0c8', marginBottom: '2rem',
    }}>
      <h3 style={{ textAlign: 'center', color: HZ_DARK, fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.3rem' }}>
        Impacto real, medible y creciente
      </h3>
      <p style={{ textAlign: 'center', color: '#5a6e55', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Datos verificados por el Banco de Alimentos Quito
      </p>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
        {[
          { number: '120+', label: 'niños reciben alimentación mensual', icon: '👧' },
          { number: '12%', label: 'reducción del riesgo de desnutrición infantil', icon: '📉' },
          { number: '8+', label: 'productores de libre pastoreo en nuestra red', icon: '🌾' },
          { number: '∞', label: 'Un sistema que conecta producción responsable, mercado y nutrición', icon: '🔄' },
        ].map((m) => (
          <div key={m.label} style={{
            flex: '1 1 160px', textAlign: 'center', padding: '1.5rem 1rem',
            background: HZ_CREAM, borderRadius: '16px', border: '1px solid #f0e0c8',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{m.icon}</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: HZ_GREEN, lineHeight: 1 }}>{m.number}</div>
            <p style={{ fontSize: '0.8rem', color: '#5a6e55', marginTop: '0.5rem', lineHeight: 1.4 }}>{m.label}</p>
          </div>
        ))}
      </div>

      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[
            { name: '2025\nRiesgo',       value: 21.1, fill: '#f9c74f' },
            { name: '2025\nDesnutrición', value: 15.8, fill: HZ_ORANGE },
            { name: '2026\nRiesgo',       value:  9.0, fill: '#a8d5a2' },
            { name: '2026\nDesnutrición', value:  8.6, fill: HZ_GREEN },
          ]} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#666' }} />
            <YAxis tick={{ fontSize: 11, fill: '#666' }} unit="%" domain={[0, 30]} />
            <Tooltip formatter={(v: number) => [`${v}%`]} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {[
                { fill: '#f9c74f' }, { fill: HZ_ORANGE },
                { fill: '#a8d5a2' }, { fill: HZ_GREEN },
              ].map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#aaa', marginTop: '0.5rem' }}>
        Valoración nutricional Escuela INTI · Comparativo 2025 vs 2026 · Fuente: Banco de Alimentos Quito
      </p>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// ECOSYSTEM SECTION
// ─────────────────────────────────────────────────────────────────────────────
export function EcosystemSection() {
  return (
    <div style={{
      borderRadius: '20px', padding: '1rem',
      marginBottom: '2rem', textAlign: 'center',
    }}>
      <Image 
        src="/huevos-zen/estructura_huevos_zen.png" 
        alt="Ecosistema detrás de Huevos Zen" 
        width={1000} 
        height={400} 
        style={{ width: '100%', height: 'auto', borderRadius: '16px' }}
      />
    </div>
  );
}
