'use client';

import React, { useState, useEffect, useRef } from "react";

const cantidades = [12, 20, 30, 50];

// SVG simple de niño (puedes reemplazarlo por uno más bonito si lo deseas)
const NinoSVG = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" style={{margin: '0 2px'}}>
    <circle cx="19" cy="11" r="7" fill="#FFD580" stroke="#FF7300" strokeWidth="2"/>
    <rect x="12" y="18" width="14" height="14" rx="7" fill="#FFB347" stroke="#FF7300" strokeWidth="2"/>
    <rect x="7" y="32" width="6" height="4" rx="2" fill="#FF7300"/>
    <rect x="25" y="32" width="6" height="4" rx="2" fill="#FF7300"/>
  </svg>
);

function calcularNinios(monto: number) {
  return Math.max(1, Math.floor(monto / 12));
}

const accionesFundacion = [
  "Entrega de alimentos nutritivos",
  "Charlas de educación alimentaria",
  "Apoyo a comedores comunitarios",
  "Seguimiento a familias vulnerables",
  "Promoción de hábitos saludables"
];

export default function DonacionPage() {
  const [tipo, setTipo] = useState("mensual");
  const [cantidad, setCantidad] = useState(12);
  const [otro, setOtro] = useState("");
  const [otroActivo, setOtroActivo] = useState(false);
  const [ninios, setNinios] = useState(calcularNinios(12));
  const [animNinios, setAnimNinios] = useState(calcularNinios(12));
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const target = calcularNinios(cantidad);
    if (animRef.current) clearInterval(animRef.current);
    if (animNinios === target) return;
    const step = animNinios < target ? 1 : -1;
    animRef.current = window.setInterval(() => {
      setAnimNinios(prev => {
        if (prev === target) {
          if (animRef.current) clearInterval(animRef.current);
          return prev;
        }
        return prev + step;
      });
    }, 60);
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [cantidad]);

  useEffect(() => {
    setNinios(calcularNinios(cantidad));
  }, [cantidad]);

  const handleCantidad = (valor: number) => {
    setCantidad(valor);
    setOtroActivo(false);
    setOtro("");
  };

  const handleOtro = () => {
    setCantidad(0);
    setOtroActivo(true);
  };

  // Para mostrar máximo 10 niños y el resto como +N
  const maxNinos = 10;
  const ninosExtra = animNinios > maxNinos ? animNinios - maxNinos : 0;
  const ninosArray = Array(Math.min(animNinios, maxNinos)).fill(0);

  return (
    <div style={{ minHeight: "100vh", background: "#fff7ed" }}>
      <style>{`
        body, html, #__next {
          background: #fff !important;
        }
        .header-bar img {
          height: 120px;
          width: 120px;
          object-fit: contain;
          border-radius: 0;
          background: none;
          margin-right: 0;
          margin-left: 8px;
        }
        .welcome-section {
          width: 100vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-top: 0;
          margin-bottom: 32px;
          padding-top: 24px;
          padding-bottom: 8px;
        }
        .welcome-title {
          font-size: 2.6rem;
          font-weight: 900;
          color: #ff7300;
          letter-spacing: 1px;
          animation: fadeInDown 1s cubic-bezier(.68,-0.55,.27,1.55);
        }
        .welcome-subtitle {
          font-size: 1.5rem;
          font-weight: 700;
          color: #b85c00;
          margin-top: 8px;
          letter-spacing: 0.5px;
          animation: fadeInUp 1.2s cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes fadeInDown {
          0% { opacity: 0; transform: translateY(-40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .main-flex {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          gap: 48px;
          min-height: 100vh;
          padding-top: 0;
          width: 100vw;
        }
        .main-left {
          flex: 1 1 420px;
          max-width: 440px;
          min-width: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .main-right {
          flex: 1 1 420px;
          max-width: 480px;
          min-width: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .donacion-card {
          background: #fff;
          border-radius: 32px;
          padding: 44px 36px 36px 36px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(255,140,0,0.13);
          position: relative;
          z-index: 1;
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .donacion-desc {
          text-align: center;
          font-size: 1.1rem;
          color: #b85c00;
          margin-bottom: 28px;
          font-weight: 500;
        }
        .donacion-btn-group {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
          gap: 18px;
          width: 100%;
        }
        .donacion-btn {
          background: #fff3e0;
          color: #b85c00;
          border: none;
          border-radius: 24px;
          padding: 16px 40px;
          font-weight: 700;
          font-size: 1.1rem;
          box-shadow: 0 2px 8px rgba(255,140,0,0.10);
          cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .donacion-btn.selected {
          background: linear-gradient(90deg, #ff7300 60%, #ffb347 100%);
          color: #fff;
          box-shadow: 0 4px 16px rgba(255,140,0,0.18);
          transform: scale(1.05);
        }
        .donacion-btn:hover {
          background: #ffe0b2;
          color: #ff7300;
        }
        .donacion-btn svg {
          width: 22px;
          height: 22px;
        }
        .donacion-monto-label {
          text-align: center;
          font-weight: 700;
          margin-bottom: 18px;
          color: #b85c00;
          font-size: 1.1rem;
          letter-spacing: 0.2px;
        }
        .donacion-montos {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          margin-bottom: 20px;
          justify-content: center;
          width: 100%;
        }
        .donacion-monto-btn {
          background: #fff3e0;
          color: #b85c00;
          border: none;
          border-radius: 18px;
          padding: 18px 28px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.1s;
          box-shadow: 0 2px 8px rgba(255,140,0,0.08);
          min-width: 110px;
        }
        .donacion-monto-btn.selected {
          background: linear-gradient(90deg, #ff7300 60%, #ffb347 100%);
          color: #fff;
          box-shadow: 0 4px 16px rgba(255,140,0,0.18);
          transform: scale(1.05);
        }
        .donacion-monto-btn:hover {
          background: #ffe0b2;
          color: #ff7300;
        }
        .donacion-input-row {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          width: 100%;
        }
        .donacion-input-currency {
          background: #fff3e0;
          border-radius: 12px;
          padding: 16px 8px;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          color: #b85c00;
        }
        .donacion-input {
          flex: 2;
          border: none;
          border-radius: 12px;
          padding: 16px 8px;
          font-weight: 700;
          font-size: 18px;
          outline: none;
          background: #fff;
          color: #b85c00;
          box-shadow: 0 1px 4px rgba(255,140,0,0.06);
        }
        .donar-btn {
          width: 100%;
          background: linear-gradient(90deg, #ff7300 60%, #ffb347 100%);
          color: #fff;
          border: none;
          border-radius: 24px;
          padding: 22px 0;
          font-weight: 900;
          font-size: 1.5rem;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(255,140,0,0.13);
          letter-spacing: 1px;
          transition: background 0.2s, transform 0.1s;
          margin-top: 18px;
          margin-bottom: 0;
          display: block;
        }
        .donar-btn[disabled] {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .donacion-warning {
          color: #ff7300;
          font-weight: 700;
          text-align: center;
          margin-bottom: 12px;
          font-size: 1.1rem;
        }
        .ninios-anim {
          width: 100%;
          background: linear-gradient(120deg, #ffb347 60%, #ff7300 100%);
          border-radius: 24px;
          box-shadow: 0 4px 24px rgba(255,140,0,0.10);
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          animation: fadeInBounce 1.2s cubic-bezier(.68,-0.55,.27,1.55);
        }
        .ninios-anim span {
          font-size: 60px;
          font-weight: 900;
          color: #fff;
          text-shadow: 0 2px 12px rgba(255,140,0,0.18);
          transition: color 0.2s;
        }
        .ninios-anim label {
          color: #fff;
          font-size: 20px;
          font-weight: 600;
          margin-top: 8px;
          letter-spacing: 0.5px;
        }
        .ninios-svg-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          margin-top: 12px;
          min-height: 44px;
        }
        .ninios-svg-row svg {
          width: 32px;
          height: 32px;
        }
        .ninios-svg-extra {
          color: #fff;
          font-weight: 700;
          font-size: 22px;
          margin-left: 6px;
        }
        .platos-section {
          margin-top: 18px;
          background: #fff3e0;
          border-radius: 16px;
          padding: 18px 12px;
          color: #b85c00;
          font-size: 1.2rem;
          font-weight: 700;
          text-align: center;
          box-shadow: 0 2px 8px rgba(255,140,0,0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .platos-section .platos-num {
          color: #ff7300;
          font-size: 2.1rem;
          font-weight: 900;
          margin-bottom: 2px;
          transition: color 0.2s;
        }
        .platos-section .platos-label {
          color: #b85c00;
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .info-section {
          width: 100%;
          background: #e0f2f1;
          border-radius: 24px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.04);
          margin-bottom: 0;
          padding: 32px 24px 24px 24px;
        }
        .info-title {
          font-size: 2rem;
          font-weight: 900;
          color: #009688;
          text-align: center;
          margin-bottom: 12px;
          margin-top: 0;
        }
        .info-desc {
          color: #333;
          font-size: 1.15rem;
          text-align: center;
          font-weight: 500;
          margin-bottom: 18px;
        }
        .info-divider {
          width: 60%;
          margin: 24px auto;
          border-top: 2px solid #b2dfdb;
          opacity: 0.5;
        }
        .info-title2 {
          font-size: 1.3rem;
          font-weight: 900;
          color: #009688;
          text-align: center;
          margin-bottom: 12px;
        }
        .info-desc2 {
          color: #333;
          font-size: 1.05rem;
          text-align: center;
          font-weight: 500;
        }
        .info-block {
          margin: 0 auto;
          padding: 24px 0 0 0;
          background: none;
          border-radius: 0;
          box-shadow: none;
        }
        .info-block ul {
          margin: 18px 0 0 24px;
          padding: 0;
        }
        .info-block li {
          font-size: 1.1rem;
          margin-bottom: 6px;
          font-weight: 600;
        }
        .info-block strong {
          color: #009688;
        }
        @media (max-width: 1100px) {
          .main-flex { flex-direction: column; align-items: center; gap: 24px; padding-top: 0; }
          .main-left, .main-right { max-width: 99vw; min-width: 0; width: 100%; }
        }
        @media (max-width: 600px) {
          .header-bar img { height: 80px; width: 80px; }
          .welcome-title { font-size: 1.5rem; }
          .welcome-subtitle { font-size: 1.1rem; }
          .main-flex { gap: 12px; }
          .main-left, .main-right { padding: 0 2px; }
          .donacion-card { padding: 14px 2px; border-radius: 14px; }
          .ninios-anim { padding: 14px 2px; border-radius: 14px; }
          .ninios-anim span { font-size: 36px; }
          .ninios-anim label { font-size: 14px; }
          .ninios-svg-row svg { width: 22px; height: 22px; }
          .platos-section { font-size: 1rem; padding: 10px 2px; border-radius: 10px; }
          .platos-section .platos-num { font-size: 1.3rem; }
          .info-section { border-radius: 12px; padding: 12px 2px 10px 2px; }
          .info-title, .info-title2 { font-size: 1.1rem; }
          .info-block li { font-size: 0.95rem; }
        }
      `}</style>
      <div className="header-bar">
        <div className="header-bar-inner">
          <img src="/logo.webp" alt="Logo Banco de Alimentos" />
        </div>
      </div>
      {/* Bienvenida animada */}
      <div className="welcome-section">
        <div className="welcome-title">Bienvenido</div>
        <div className="welcome-subtitle">Aliado contra el hambre</div>
      </div>
      <div className="main-flex">
        <div className="main-left">
          {/* Tarjeta de donación */}
          <div className="donacion-card">
            <div className="donacion-desc">
              Tu aporte ayuda a transformar vidas. Elige el tipo y monto de tu donación:
            </div>
            <div className="donacion-btn-group">
              <button
                className={`donacion-btn${tipo === "unica" ? " selected" : ""}`}
                onClick={() => setTipo("unica")}
              >
                <svg fill="none" viewBox="0 0 24 24"><path fill="#ff7300" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                Única vez
              </button>
              <button
                className={`donacion-btn${tipo === "mensual" ? " selected" : ""}`}
                onClick={() => setTipo("mensual")}
              >
                <svg fill="none" viewBox="0 0 24 24"><path fill="#ff7300" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                Mensual
              </button>
            </div>
            <div className="donacion-monto-label">
              Selecciona el monto a donar:
            </div>
            <div className="donacion-montos">
              {[2, 10, 30, 50].map((valor) => (
                <button
                  key={valor}
                  className={`donacion-monto-btn${cantidad === valor && !otroActivo ? " selected" : ""}`}
                  onClick={() => handleCantidad(valor)}
                >
                  USD {valor}
                </button>
              ))}
              <button
                className={`donacion-monto-btn${otroActivo ? " selected" : ""}`}
                onClick={handleOtro}
              >
                Otro valor
              </button>
            </div>
            <div className="donacion-input-row">
              <div className="donacion-input-currency">USD</div>
              <input
                type="number"
                placeholder="Otro"
                value={otroActivo ? otro : ""}
                onFocus={handleOtro}
                onChange={e => {
                  setOtro(e.target.value);
                  setCantidad(Number(e.target.value));
                }}
                className="donacion-input"
                min={otroActivo ? 3 : undefined}
              />
            </div>
            {cantidad === 2 && !otroActivo && (
              <div className="donacion-warning">
                El monto mínimo permitido es USD 3.
              </div>
            )}
            <button className="donar-btn" disabled={cantidad === 2 && !otroActivo}>
              Donar ahora
            </button>
            {tipo === "mensual" && (
              <div className="impacto-anual">
                <div><strong>Impacto anual estimado:</strong> {animNinios * 12} beneficiarios/año</div>
                <ul style={{margin: '10px 0 0 18px', padding: 0}}>
                  {accionesFundacion.map((accion, i) => (
                    <li key={i}>{accion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="main-right">
          {/* Contador de niños beneficiados */}
          <div className="ninios-anim">
            <span>{animNinios}</span>
            <label>{animNinios === 1 ? "persona alimentada" : "personas alimentadas"}</label>
            <div className="ninios-svg-row">
              {ninosArray.map((_, i) => <NinoSVG key={i} />)}
              {ninosExtra > 0 && <span className="ninios-svg-extra">+{ninosExtra}</span>}
            </div>
            {/* Personas alimentadas */}
            <PersonasAlimentadas cantidad={cantidad} />
          </div>
          {/* Sección informativa */}
          <section className="info-section">
            <h2 className="info-title">¿Qué hacemos con tus donaciones?</h2>
            <div className="info-desc">
              Sus contribuciones son utilizadas para <strong>adquirir alimentos de alto valor nutricional</strong> y cubrir la logística que asegure una buena gestión y calidad de los alimentos.
            </div>
            <div className="info-divider"></div>
            <h3 className="info-title2">¿Cómo lo hacemos?</h3>
            <div className="info-desc2">
              Los alimentos gestionados por diferentes fuentes de supermercados, centrales y otros, son complementados con los adquiridos por donaciones y enviados a través de un sistema integral de organizaciones sociales que garantizan trazabilidad y reportería para nuestros benefactores.
            </div>
            <div className="info-block">
              <div style={{textAlign: 'center', marginBottom: 18, color: '#666', fontWeight: 500}}>
                Hace 20 años y con el apoyo de la EPN se fundó el primer Banco de Alimentos del Ecuador como "Banco de Alimentos Quito" y a través de
              </div>
              <ul>
                <li>Programa atención a <strong>Organizaciones Sociales</strong>.</li>
                <li>Programa de atención a <strong>&quot;Familias de Grupos Prioritarios&quot;</strong></li>
                <li>Programa de atención <strong>&quot;Setenta y Piquitos del Adulto Mayor&quot;</strong></li>
                <li>Programa de atención a <strong>&quot;Comedores Escolares Infantiles&quot;</strong></li>
              </ul>
              <div style={{marginTop: 18, color: '#666', fontWeight: 500}}>
                Trabajamos para asegurar que cada dólar invertido en estos programas logre oportunidades reales para el desarrollo de nuestros usuarios y el futuro de nuestro país.
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* Sección inferior con fondo e imágenes */}
      <div className="bottom-section">
        <div className="bottom-section-content">
          <h2>¡Gracias por tu solidaridad!</h2>
          <p>Con tu ayuda, juntos construimos un futuro sin hambre. Cada aporte cuenta y transforma vidas.</p>
        </div>
      </div>
    </div>
  );
}

// Componente animado de personas alimentadas
function PersonasAlimentadas({ cantidad }: { cantidad: number }) {
  const [personas, setPersonas] = React.useState(cantidad);
  React.useEffect(() => {
    const start = personas;
    const end = cantidad;
    if (start === end) return;
    const step = start < end ? 1 : -1;
    const interval = setInterval(() => {
      setPersonas((prev) => {
        if (prev === end) {
          clearInterval(interval);
          return prev;
        }
        return prev + step;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [cantidad]);
  return (
    <div className="platos-section">
      <div className="platos-num">{personas}</div>
      <div className="platos-label">{personas === 1 ? 'persona alimentada' : 'personas alimentadas'}</div>
      <div style={{ fontSize: '1rem', color: '#b85c00', marginTop: 2 }}>Con un solo $1 alimentas a una persona durante todo un día.</div>
    </div>
  );
} 