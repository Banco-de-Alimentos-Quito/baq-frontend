"use client";

import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "huevos-zen",
    slug: "huevos-zen",
    title: "Huevos Zen",
    subtitle: "Infancias nutridas, gallinas felices.",
    description:
      "Un programa único que conecta el bienestar animal con la nutrición infantil. Cada huevo donado es un paso hacia un Ecuador más saludable y equitativo.",
    bg: "/huevos-zen-bg.jpg",
    accent: "#4ade80",
    accentGlow: "rgba(74,222,128,0.55)",
    palette: {
      overlay: "linear-gradient(135deg, rgba(234,179,8,0.82) 0%, rgba(202,138,4,0.65) 50%, rgba(161,98,7,0.4) 100%)",
      grid: "rgba(74,222,128,0.18)",
      titleColor: "#1a2e05",
      subtitleColor: "#14532d",
      descColor: "#1c4a27",
      btnBg: "#16a34a",
      btnHover: "#15803d",
      btnText: "#ffffff",
    },
    cta: "Conocer el Programa",
    tag: "🥚 Nutrición",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BLUEPRINT GRID
// ─────────────────────────────────────────────────────────────────────────────
function BlueprintGrid({ color, id }: { color: string; id: string }) {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.45 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={`g-${id}`} width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke={color} strokeWidth="0.7" />
        </pattern>
        <pattern id={`gm-${id}`} width="192" height="192" patternUnits="userSpaceOnUse">
          <rect width="192" height="192" fill={`url(#g-${id})`} />
          <path d="M 192 0 L 0 0 0 192" fill="none" stroke={color} strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#gm-${id})`} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION BANNER
// ─────────────────────────────────────────────────────────────────────────────
function SectionBanner({ section, index }: { section: (typeof SECTIONS)[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  const getTargetUrl = () => {
    if (section.slug === "huevos-zen") return "/huevos-zen/suscripcion";
    return `/blog/${section.slug}`;
  };

  const handleClick = () => {
    window.open(getTargetUrl(), "_blank");
  };

  const handleCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getTargetUrl(), "_blank");
  };

  return (
    <div
      id={section.id}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      style={{
        flex: hovered ? "1.4 1 0" : "1 1 0",
        minHeight: 0,
        position: "relative",
        width: "100%",
        cursor: "pointer",
        overflow: "hidden",
        border: hovered ? `2.5px solid ${section.accent}` : "2.5px solid transparent",
        boxShadow: hovered
          ? `0 0 0 4px ${section.accentGlow}, 0 0 40px 8px ${section.accentGlow}, inset 0 0 30px 2px ${section.accentGlow}`
          : "none",
        transition: "flex 0.45s cubic-bezier(0.34,1.1,0.64,1), box-shadow 0.25s ease, border-color 0.25s ease",
        zIndex: hovered ? 10 : 1,
      }}
    >
      {/* BG photo */}
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${section.bg})`,
          backgroundSize: "cover", backgroundPosition: "center",
          transition: "transform 0.55s ease",
          transform: hovered ? "scale(1.04)" : "scale(1)",
        }}
      />

      {/* Color overlay */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: section.palette.overlay,
          transition: "opacity 0.3s ease",
          opacity: hovered ? 0.72 : 0.88,
        }}
      />

      {/* Blueprint grid */}
      <BlueprintGrid color={section.palette.grid} id={section.id} />

      {/* Glow border pulse */}
      {hovered && (
        <div style={{
          position: "absolute", inset: 0,
          border: `3px solid ${section.accent}`,
          boxShadow: `0 0 24px 6px ${section.accentGlow}`,
          pointerEvents: "none",
          animation: "borderPulse 0.9s ease-in-out infinite alternate",
        }} />
      )}

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 2, height: "100%",
        display: "flex", alignItems: "center",
        padding: "0 5vw", gap: "2rem",
      }}>
        {/* Text block */}
        <div style={{ flex: "0 0 auto", maxWidth: "580px" }}>
          {/* Tag */}
          <span style={{
            display: "inline-block", padding: "4px 14px", borderRadius: "999px",
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            background: "rgba(255,255,255,0.15)", color: section.palette.titleColor,
            border: `1px solid ${section.accent}`, marginBottom: "0.8rem", backdropFilter: "blur(4px)",
          }}>
            {section.tag}
          </span>

          {/* Title */}
          <h2 style={{
            margin: 0,
            fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
            fontWeight: 900, lineHeight: 1.05,
            color: section.palette.titleColor, letterSpacing: "-0.02em",
            textShadow: "0 2px 16px rgba(0,0,0,0.25)",
            transition: "transform 0.3s ease",
            transform: hovered ? "translateX(8px)" : "translateX(0)",
          }}>
            {section.title}
          </h2>

          {/* Subtitle */}
          <p style={{
            margin: "0.45rem 0 0.9rem",
            fontSize: "clamp(0.95rem, 2vw, 1.25rem)",
            fontWeight: 500, color: section.palette.subtitleColor, lineHeight: 1.4,
            transition: "transform 0.35s ease",
            transform: hovered ? "translateX(8px)" : "translateX(0)",
          }}>
            {section.subtitle}
          </p>

          {/* Description */}
          <p style={{
            margin: "0 0 1.1rem",
            fontSize: "clamp(0.8rem, 1.4vw, 1rem)",
            color: section.palette.descColor, lineHeight: 1.6, maxWidth: "460px",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
          }}>
            {section.description}
          </p>

          {/* CTA */}
          <button
            onClick={handleCtaClick}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.65rem 1.6rem", borderRadius: "8px",
              background: section.palette.btnBg, color: section.palette.btnText,
              fontWeight: 700, fontSize: "0.92rem", border: "none", cursor: "pointer",
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateY(0) scale(1)" : "translateY(12px) scale(0.95)",
              transition: "opacity 0.35s ease 0.05s, transform 0.35s ease 0.05s, background 0.2s ease",
              boxShadow: `0 4px 20px ${section.accentGlow}`,
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = section.palette.btnHover; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = section.palette.btnBg; }}
          >
            {section.cta}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Index number */}
        <div style={{ flex: "1 1 auto", display: "flex", justifyContent: "flex-end", alignItems: "center", paddingRight: "2vw" }}>
          <span style={{
            fontSize: "clamp(5rem, 14vw, 11rem)",
            fontWeight: 900, lineHeight: 1,
            color: section.accent,
            opacity: hovered ? 0.28 : 0.1,
            transition: "opacity 0.4s ease",
            userSelect: "none", letterSpacing: "-0.05em",
          }}>
            0{index + 1}
          </span>
        </div>
      </div>

      {/* Click tooltip */}
      {hovered && (
        <div style={{
          position: "absolute", bottom: "14px", right: "24px",
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
          borderRadius: "8px", padding: "6px 14px",
          color: "#fff", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em",
          display: "flex", alignItems: "center", gap: "6px",
          animation: "fadeInUp 0.25s ease",
        }}>
          🔗 Haga clic para ver más →
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function HuevosZenPage() {
  return (
    <>
      <style>{`
        @keyframes borderPulse {
          0%   { opacity: 0.6; }
          100% { opacity: 1; box-shadow: 0 0 48px 16px currentColor; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hz-wrapper {
          width: 100%;
          height: calc(100vh - 64px);
          margin-top: 64px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-sizing: border-box;
        }
      `}</style>

      {/* Stacked banners — full viewport minus main header */}
      <div className="hz-wrapper">
        {SECTIONS.map((section, i) => (
          <SectionBanner key={section.id} section={section} index={i} />
        ))}
      </div>
    </>
  );
}
