'use client';

import React from 'react';
import Image from 'next/image';
import {
  HeroHuevosZen,
  TripleImpactBanner,
  MembershipSection,
  NutritionChart,
  ThreePillars,
  ComparisonTable,
  ImpactMetrics,
  EcosystemSection,
} from './HuevosZenComponents';

const HZ_GREEN  = '#7C9A44';
const HZ_ORANGE = '#EB711B';
const HZ_DARK   = '#1a2e05';
const WA_GREEN  = '#25D366';

export default function HuevosZenLandingPage() {
  return (
    <div style={{ background: '#fdf8f3', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a2e05 0%, #2d4a14 100%)',
        padding: '2.5rem 0 3rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.07,
          backgroundImage: 'radial-gradient(circle, #4ade80 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <Image src="/huevos-zen-logo.png" alt="Huevos Zen" width={130} height={90} style={{ objectFit: 'contain' }} />
            <div>
              <span style={{
                display: 'inline-block', padding: '3px 12px', borderRadius: '999px',
                background: 'rgba(74,222,128,0.2)', color: '#4ade80',
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
                border: '1px solid rgba(74,222,128,0.3)', marginBottom: '0.5rem',
              }}>
                🥚 MEMBRESÍAS · CIBU ALIMENTOS CON PROPÓSITO
              </span>
              <h1 style={{
                color: 'white', fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
                fontWeight: 900, margin: 0, lineHeight: 1.1,
              }}>
                Huevos Zen — Más que un huevo,<br />
                <span style={{ color: '#4ade80' }}>una mejor elección.</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', margin: '0.5rem 0 0' }}>
                Gallinas felices · Nutrición que transforma · Impacto real medible
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Back link Top */}
        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
          <a href="/huevos-zen" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.2rem', borderRadius: '10px',
            background: 'white', color: HZ_GREEN,
            fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
            border: `2px solid ${HZ_GREEN}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}>
            ← Explorar todos los programas
          </a>
        </div>

        {/* 1. Hero */}
        <HeroHuevosZen />

        {/* 2. Triple impact + membresías anchor */}
        <div id="membresias">
          <TripleImpactBanner />

          {/* 3. Membership pricing tables */}
          <MembershipSection />
        </div>

        {/* 4. Nutrition chart 2025 vs 2026 */}
        <div id="impacto">
          <NutritionChart />
        </div>

        {/* 5. Three pillars */}
        <ThreePillars />



        {/* 7. Product comparison */}
        <ComparisonTable />

        {/* 9. Impact metrics + bar chart */}
        <ImpactMetrics />

        {/* 10. Brand ecosystem */}
        <EcosystemSection />


        {/* Back link Bottom */}
        <div style={{ textAlign: 'left', marginTop: '1rem' }}>
          <a href="/huevos-zen" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.2rem', borderRadius: '10px',
            background: 'white', color: HZ_GREEN,
            fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
            border: `2px solid ${HZ_GREEN}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}>
            ← Explorar todos los programas
          </a>
        </div>
      </div>

    </div>
  );
}
