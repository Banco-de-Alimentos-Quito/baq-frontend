'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';

function calcularNinios(monto: number) {
  return Math.max(1, Math.floor(monto / 12));
}

const PUZZLE_PIECES = [
  { key: 'A1', src: '/puzzle/A1.png', style: { top: 0, left: 0 } },
  { key: 'A2', src: '/puzzle/A2.png', style: { bottom: 0, left: 0 } },
  { key: 'B1', src: '/puzzle/B1.png', style: { top: 0, right: 0 } },
  { key: 'B2', src: '/puzzle/B2.png', style: { bottom: 0, right: 0 } },
];

function getPuzzlePieces(monto: number) {
  if (monto >= 50) return ['A1', 'A2', 'B1', 'B2'];
  if (monto >= 30) return ['A1', 'A2', 'B1'];
  if (monto >= 10) return ['A1', 'A2'];
  if (monto >= 2) return ['A1'];
  return [];
}

export default function DonacionPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState("mensual");
  const [cantidad, setCantidad] = useState(0);
  const [otro, setOtro] = useState("");
  const [otroActivo, setOtroActivo] = useState(false);
  const [animNinios, setAnimNinios] = useState(calcularNinios(12));
  const animRef = useRef<number | null>(null);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showDeunaModal, setShowDeunaModal] = useState(false);
  const [deunaForm, setDeunaForm] = useState({ nombre: "", apellido: "", correo: "", telefono: "", documento: "" });
  const [consentChecked, setConsentChecked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [comindadesChecked, setComindadesChecked] = useState(false);
  const canSubmit = consentChecked || (
    !deunaForm.nombre && !deunaForm.apellido && !deunaForm.correo && !deunaForm.telefono && !deunaForm.documento
  );

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

  const handleCantidad = (valor: number) => {
    setCantidad(valor);
    setOtroActivo(false);
    setOtro("");
  };

  const handleOtro = () => {
    setCantidad(0);
    setOtroActivo(true);
  };

  // Opciones de pago
  const handleDonarAhora = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cantidad < 2) return;
    setShowPagoModal(true);
  };

  const handleDeunaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1800);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
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
          margin-bottom: 10px;
          font-weight: 500;
        }
           .donacion-paragraph {
          text-align: center;
          font-size: 1.1rem;
          color:rgb(157, 64, 17);
          margin-bottom: 10px;
          font-weight: 500;
          margin-bottom: 20px;
        }
        .donacion-btn-group {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
          gap: 18px;
          width: 100%;
        }
        .donacion-btn {
          background:rgb(241, 241, 241);
          color:rgb(82, 82, 82);
          border: none;
          border-radius: 24px;
          padding: 8px 20px;
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
          background: linear-gradient(90deg, #2F3388 60%,rgb(29, 35, 148) 100%);
          color: #fff;
          box-shadow: 0 4px 16px rgba(255,140,0,0.18);
          transform: scale(1.05);
        }
        .donacion-btn:hover {
          background: #2F3388;
          color:rgb(255, 255, 255);
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
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px 18px;
          margin-bottom: 20px;
          justify-content: center;
          width: 100%;
        }
        .donacion-monto-btn {
          border: none;
          border-radius: 18px;
          padding: 18px 28px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.1s;
          box-shadow: 0 2px 8px rgba(255,140,0,0.08);
          min-width: 110px;
          color: #FF6347;
          background: #fff;
        }
        .donacion-monto-btn.monto-2,
        .donacion-monto-btn.monto-10,
        .donacion-monto-btn.monto-30,
        .donacion-monto-btn.monto-50 {
          background: #fff;
          color: #FF6347;
        }
        .donacion-monto-btn.selected {
          box-shadow: 0 4px 16px rgba(255,99,71,0.18);
          transform: scale(1.05);
          filter: brightness(0.95) contrast(1.2);
          color: #fff !important;
          background: linear-gradient(90deg, #ff7300 60%, #FF6347 100%) !important;
        }
        .donacion-monto-btn:not(.selected) { opacity: 0.97; }
        .donacion-monto-btn:hover { filter: brightness(1.08); }
        .donacion-monto-btn.monto-50.selected { color: #fff; }
        .donacion-monto-btn.monto-50:not(.selected) {
          color: #FF6347;
          animation: pulse50 1.2s infinite;
        }
        @keyframes pulse50 {
          0% { box-shadow: 0 0 0 0 rgba(255,99,71,0.18); }
          70% { box-shadow: 0 0 0 12px rgba(255,99,71,0.08); }
          100% { box-shadow: 0 0 0 0 rgba(255,99,71,0.18); }
        }
        .donacion-monto-btn.otro-btn { grid-column: 1 / span 2; background: linear-gradient(90deg, #ff7300 60%, #ffb347 100%); color: #fff; margin-top: 8px; display: flex; align-items: center; justify-content: center; }
        .donacion-otro-row {
          display: flex;
          align-items: center;
          width: 100%;
          margin-bottom: 24px;
          gap: 0;
        }
        .donacion-otro-btn {
          background: linear-gradient(90deg, #ff7300 60%, #ffb347 100%);
          color: #fff;
          border: none;
          border-radius: 18px 0 0 18px;
          padding: 18px 24px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.1s;
          box-shadow: 0 2px 8px rgba(255,140,0,0.08);
          min-width: 120px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .donacion-otro-input {
          flex: 1;
          border: none;
          border-radius: 0 18px 18px 0;
          padding: 18px 16px;
          font-weight: 700;
          font-size: 1.1rem;
          outline: none;
          background: #fff;
          color:rgb(34, 34, 34);
          box-shadow: 0 2px 8px rgba(255,140,0,0.08);
          height: 56px;
        }
        .donacion-otro-input::placeholder { color:rgb(133, 122, 107); opacity: 1; }
        .donar-btn {
          width: 100%;
          background: #ED6F1D ;
          color: #fff;
          border: none;
          border-radius: 24px;
          padding: 10px 0;
          font-weight: 900;
          font-size: 1.2rem;
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
          background:rgb(255, 255, 255);
          border-radius: 16px;
          padding: 18px 12px;
          color: #b85c00;
          font-size: 1.2rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(255,140,0,0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .platos-section .platos-num {
          color:rgb(255, 126, 21);
          font-size: 2.1rem;
          margin-bottom: 2px;
          transition: color 0.2s;
        }
        .platos-section .platos-label {
          color: #b85c00;
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .info-horizontal-section {
          width: 100vw;
          background: linear-gradient(90deg, #f8fafc 60%, #fbeee6 100%);
          padding: 48px 0;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: stretch;
        }
        .info-horizontal-container {
          display: flex;
          flex-direction: row;
          gap: 32px;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 0 16px;
          justify-content: center;
        }
        .info-block-h {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.04);
          padding: 32px 24px;
          flex: 1 1 0;
          min-width: 260px;
          max-width: 370px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: transform 0.3s ease;
        }
        .info-block-h:hover {
          transform: translateY(-5px);
        }
        .info-block-image {
          width: 120px;
          height: 120px;
          margin-bottom: 24px;
          border-radius: 16px;
          object-fit: cover;
          box-shadow: 0 4px 16px rgba(255,115,0,0.1);
        }
        .info-block-title {
          font-size: 1.4rem;
          font-weight: 900;
          color: #ff7300;
          margin-bottom: 16px;
          margin-top: 0;
          letter-spacing: 0.5px;
        }
        .info-block-desc {
          color: #444;
          font-size: 1.05rem;
          font-weight: 500;
          margin-bottom: 16px;
          line-height: 1.6;
        }
        .info-block-list {
          margin: 16px 0;
          padding: 0;
          list-style: none;
          width: 100%;
        }
        .info-block-list li {
          font-size: 1rem;
          margin-bottom: 12px;
          font-weight: 600;
          color: #2F3388;
          padding: 8px 16px;
          background: rgba(255,115,0,0.05);
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        .info-block-list li:hover {
          background: rgba(255,115,0,0.1);
          transform: translateX(5px);
        }
        .info-block-desc-bottom {
          margin-top: 24px;
          color: #666;
          font-weight: 500;
          font-style: italic;
        }
        .bottom-section {
          background: linear-gradient(90deg, #ff7300 0%, #ffb347 100%);
          padding: 64px 24px;
          text-align: center;
          color: white;
        }
        .bottom-section-content {
          max-width: 800px;
          margin: 0 auto;
        }
        .bottom-section h2 {
          font-size: 2.2rem;
          font-weight: 900;
          margin-bottom: 16px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .bottom-section p {
          font-size: 1.2rem;
          line-height: 1.6;
          opacity: 0.9;
        }
        @media (max-width: 1100px) {
          .info-horizontal-container { 
            flex-direction: column; 
            gap: 24px; 
            align-items: center; 
          }
          .info-block-h { 
            max-width: 600px; 
            min-width: 0; 
            width: 100%; 
          }
        }
        @media (max-width: 600px) {
          .info-block-h { 
            padding: 24px 16px; 
          }
          .info-block-image {
            width: 100px;
            height: 100px;
          }
          .info-block-title {
            font-size: 1.2rem;
          }
          .info-block-desc {
            font-size: 1rem;
          }
          .bottom-section {
            padding: 48px 16px;
          }
          .bottom-section h2 {
            font-size: 1.8rem;
          }
          .bottom-section p {
            font-size: 1.1rem;
          }
        }
        .navbar-tomate {
          width: 100vw;
          background: #ED6F1D;
          display: flex;
          align-items: center;
          height: 110px;
          box-shadow: 0 2px 12px rgba(255,99,71,0.10);
          position: fixed;
          top: 0;
          left: 0;
          z-index: 20;
          padding: 0 0 0 0;
        }
        .navbar-logo {
          width: 140px;
          object-fit: contain;
          margin-left: 24px;
        }
        .welcome-section { padding-top: 130px; }
        .main-flex { padding-top: 0 !important; }
        .orange-header {
          width: 100vw;
          height: 1300px;
          background: #ff7300;
          border-bottom-left-radius: 48px;
          border-bottom-right-radius: 48px;
          margin-bottom: -40px;
          position: relative;
          z-index: 10;
        }
        .donacion-titulo-gradiente {
          text-align: center;
          font-size: 2.3rem;
          margin-bottom: 18px;
          margin-top: 0;
          background: linear-gradient(90deg, #ff7300 10%, #FF6347 90%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          letter-spacing: 1px;
          line-height: 1.1;
        }
        @media (max-width: 600px) {
          .donacion-titulo-gradiente { font-size: 1.3rem; }
        }
        .puzzle-analogy-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        }
        .puzzle-container {
          position: relative;
          width: 320px;
          max-width: 100%;
        }
        .puzzle-bg {
          width: 100%;
          height: 100%;
          object-fit: contain;
          opacity: 0.18;
          border-radius: 18px;
          display: block;
        }
        .puzzle-piece {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: contain;
          opacity: 0;
          transition: opacity 0.7s cubic-bezier(.68,-0.55,.27,1.55);
          pointer-events: none;
        }
        .puzzle-piece.show {
          opacity: 1;
        }
        .puzzle-piece[alt="A1"],
        .puzzle-piece[alt="A2"],
        .puzzle-piece[alt="B1"],
        .puzzle-piece[alt="B2"] {
          top: 0;
          left: 0;
        }
        .puzzle-title{
          font-size: 1.2rem;
          color:rgb(255, 255, 255);
          text-align: center;
          margin-top: 14px;
        }
        @media (max-width: 600px) {
          .puzzle-container { width: 90vw; min-width: 180px; }
        }
        .proyeccion-anual-animada {
          margin-top: 12px;
          font-size: 1.25rem;
          font-weight: 900;
          text-align: center;
          background: linear-gradient(90deg, #2F3388 0%, #ff7300 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          letter-spacing: 0.5px;
          animation: fadeInUpBounce 1s cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes fadeInUpBounce {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          60% { opacity: 1; transform: translateY(-8px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .info-hero-section {
          position: relative;
          width: 100vw;
          min-height: 380px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          margin-bottom: 0;
          animation: heroGradient 12s ease-in-out infinite alternate;
        }
        @keyframes heroGradient {
          0% {
            background: linear-gradient(120deg, #ff7300 0%, #ffb347 100%);
          }
          40% {
            background: linear-gradient(120deg, #ffb347 0%, #2F3388 100%);
          }
          70% {
            background: linear-gradient(120deg, #2F3388 0%, #ff7300 100%);
          }
          100% {
            background: linear-gradient(120deg, #ff7300 0%, #ffb347 100%);
          }
        }
        .info-hero-overlay {
          width: 100%;
          height: 100%;
          background: rgba(30,30,30,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .info-hero-content {
          color: #fff;
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
          padding: 64px 16px;
        }
        .info-hero-content h2 {
          font-size: 2.2rem;
          font-weight: 900;
          margin-bottom: 18px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.18);
        }
        .info-hero-content p {
          font-size: 1.2rem;
          font-weight: 500;
          text-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        @media (max-width: 600px) {
          .info-hero-content h2 { font-size: 1.1rem; }
          .info-hero-content p { font-size: 1rem; }
          .info-hero-content { padding: 32px 4px; }
          .impacto-title { font-size: 1.2rem; }
          .impacto-img { max-width: 98vw; border-radius: 12px; }
          .impacto-section { padding: 32px 0 24px 0; }
        }
        .impacto-section {
          width: 100vw;
          background: linear-gradient(90deg, #fff7ed 0%, #ffe0c3 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 0 48px 0;
        }
        .impacto-title {
          font-size: 2.1rem;
          font-weight: 900;
          color: #ff7300;
          margin-bottom: 32px;
          text-align: center;
          letter-spacing: 1px;
          background: linear-gradient(90deg, #ff7300 10%, #FF6347 90%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }
        .impacto-img-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .impacto-img {
          max-width: 900px;
          width: 99vw;
          border-radius: 24px;
          object-fit: cover;
        }
        @media (max-width: 600px) {
          .impacto-title { font-size: 1.2rem; }
          .impacto-img { max-width: 98vw; border-radius: 12px; }
          .impacto-section { padding: 32px 0 24px 0; }
        }
        .modal-pago-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(30,30,30,0.45);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-pago {
          background: #fff;
          border-radius: 24px;
          padding: 40px 28px 28px 28px;
          min-width: 320px;
          max-width: 98vw;
          box-shadow: 0 8px 32px rgba(0,0,0,0.13);
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .modal-pago-close {
          position: absolute;
          top: 2px;
          right: 2px;
          background: none;
          border: none;
          font-size: 2.2rem;
          color: #ff7300;
          cursor: pointer;
          padding: 8px;
        }
        .modal-pago-title {
          font-size: 1.5rem;
          font-weight: 900;
          color: #2F3388;
          margin-bottom: 24px;
          text-align: center;
        }
        .modal-pago-options {
          display: flex;
          flex-direction: column;
          gap: 18px;
          width: 100%;
          align-items: center;
        }
        .modal-pago-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          border: none;
          border-radius: 18px;
          padding: 14px 28px;
          cursor: pointer;
          background: #f7f7f7;
          color: #2F3388;
          box-shadow: 0 2px 8px rgba(255,140,0,0.08);
          transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.1s;
          min-width: 220px;
          justify-content: center;
        }
        .modal-pago-btn.paypal {
          background: #fff;
          border: 2px solid #0070ba;
          color: #0070ba;
        }
        .modal-pago-btn.paypal:hover {
          background: #0070ba;
          color: #fff;
        }
        .modal-pago-btn.local {
          background: linear-gradient(90deg, #ff7300 60%, #ffb347 100%);
          color: #fff;
        }
        .modal-pago-btn.local:hover {
          background: #2F3388;
          color: #fff;
        }
        .modal-pago-btn.deuna {
          background: #fff;
          border: 2px solid #00b86b;
          color: #00b86b;
        }
        .modal-pago-btn.deuna:hover {
          background: #00b86b;
          color: #fff;
        }
        .modal-pago-logo {
          height: 28px;
          width: auto;
          object-fit: contain;
        }
        .modal-pago-info {
          margin-top: 18px;
          font-size: 0.95rem;
          color: #888;
          text-align: center;
        }
        @media (max-width: 600px) {
          .modal-pago { padding: 18px 4px 18px 4px; min-width: 0; }
          .modal-pago-title { font-size: 1.1rem; }
          .modal-pago-btn { font-size: 1rem; padding: 10px 8px; min-width: 0; }
        }
        @media (max-width: 900px) {
          .main-flex {
            flex-direction: column;
            gap: 0;
            align-items: stretch;
            padding: 0;
          }
          .main-left, .main-right {
            max-width: 100vw;
            min-width: 0;
            width: 100vw;
            padding: 0 2vw;
          }
          .donacion-card, .ninios-anim {
            max-width: 99vw;
            min-width: 0;
            width: 100%;
            border-radius: 18px;
            padding: 18px 4vw;
          }
        }
        @media (max-width: 600px) {
          .main-flex { flex-direction: column-reverse; }
          .main-right { order: -1; }
          .main-left { order: 2; }
          .main-left, .main-right { padding: 0 2vw; max-width: 100vw; min-width: 0; width: 100vw; }
          .main-right { order: -1; }
          .main-left { order: 2; }
          .donacion-card, .ninios-anim { padding: 14px 2vw; border-radius: 14px; max-width: 99vw; }
          .donacion-montos { grid-template-columns: 1fr; gap: 14px; }
          .donacion-monto-btn {
            min-width: 90px;
            font-size: 1.1rem;
            padding: 10px 0 6px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #fff;
            color: #FF6347;
            border: 2px solid #ffb347;
            box-shadow: none;
          }
          .donacion-monto-btn.selected {
            background: linear-gradient(90deg, #ff7300 60%, #FF6347 100%) !important;
            color: #fff !important;
            border: 2px solid #ff7300;
          }
          .donacion-monto-btn .usd-label {
            font-size: 0.95rem;
            font-weight: 700;
            color: #FF6347;
            margin-bottom: 2px;
            letter-spacing: 0.5px;
          }
          .donacion-monto-btn.selected .usd-label {
            color: #fff;
          }
          .donacion-monto-btn .usd-value {
            font-size: 1.5rem;
            font-weight: 900;
            color: #FF6347;
            line-height: 1.1;
          }
          .donacion-monto-btn.selected .usd-value {
            color: #fff;
          }
        }
        .modal-pago-content-flex {
          display: flex;
          flex-direction: row;
          gap: 48px;
          align-items: flex-start;
          justify-content: center;
        }
        @media (max-width: 900px) {
          .modal-pago-content-flex {
            flex-direction: column;
            gap: 0;
            align-items: stretch;
          }
        }
        .modal-pago-form-side {
          flex: 1 1 0;
          min-width: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .modal-pago-qr-side {
          flex: 0 0 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 2px 16px #0002;
          padding: 32px 24px 18px 24px;
          min-width: 260px;
        }
        .form-group {
          width: 100%;
          max-width: 320px;
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
        }
        .form-label {
          font-size: 0.98rem;
          color: #555;
          margin-bottom: 4px;
          font-weight: 600;
          margin-left: 6px;
        }
        .input-wrapper {
          display: flex;
          align-items: center;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px #0001;
          border: 1px solid #e0e0e0;
          padding: 0 10px;
        }
        .input-icon {
          font-size: 1.2rem;
          color: #ff7300;
          margin-right: 8px;
        }
        .modal-pago input[type="text"],
        .modal-pago input[type="email"],
        .modal-pago input[type="tel"] {
          border: none;
          background: transparent;
          padding: 12px 0;
          font-size: 1rem;
          color: #222;
          flex: 1;
          outline: none;
        }
        .modal-pago input::placeholder {
          color: #bbb;
        }
        .consent-group {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 12px 0 0 0;
          max-width: 320px;
        }
        .consent-checkbox {
          margin-top: 3px;
        }
        .consent-label {
          font-size: 0.97rem;
          color: #2F3388;
          font-weight: 500;
        }
        .modal-pago button[type="submit"] {
          width: 100%;
          margin-top: 18px;
          font-size: 1.1rem;
          padding: 12px;
          border-radius: 8px;
          background: linear-gradient(90deg, #ff7300, #ffb347);
          color: #fff;
          font-weight: bold;
          border: none;
          box-shadow: 0 2px 8px #ff730033;
          cursor: pointer;
          transition: background 0.2s;
          max-width: 320px;
        }
        .modal-pago button[type="submit"]:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .modal-pago-qr-side .qr-container {
          margin-bottom: 18px;
          background: #fff;
          border: 2px solid #ff7300;
          border-radius: 12px;
          padding: 18px 12px;
          box-shadow: 0 2px 12px #ff730033;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .modal-pago-qr-side .qr-total {
          font-size: 1.3rem;
          color: #2F3388;
          font-weight: 900;
          margin-bottom: 12px;
          margin-top: 8px;
        }
        .modal-pago-qr-side .qr-logo {
          margin-top: 10px;
          height: 18px;
          opacity: 0.7;
        }
        .modal-pago-qr-side .loader {
          text-align: center;
          margin-top: 20px;
          font-size: 1.2rem;
          color: #ff7300;
        }
        .confetti {
          pointer-events: none;
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          z-index: 9999;
          animation: confetti-fall 1.5s linear;
        }
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translateY(-100px); }
          100% { opacity: 0; transform: translateY(100vh); }
        }
        .donation-message {
          text-align: center;
          font-size: 1.1rem;
          color: #2F3388;
          margin-bottom: 18px;
          animation: fadeIn 1s ease-in-out;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: none;
        }
        .streak-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 6px;
          color: #2F3388;
        }
        .opcional-msg {
          color: #333;
          font-size: 1rem;
          margin-top: 8px;
          margin-bottom: 8px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
      {/* Bienvenida animada */}
      <div className="welcome-section">
      </div>
      <div className="main-flex">
        <div className="main-left">
          {/* Tarjeta de donación */}
          <div className="donacion-card">
          <h1 className="donacion-titulo-gradiente">A un <strong>clic</strong> para alimentar</h1>
            <div className="donacion-desc">
              Tu aporte ayuda a transformar vidas.
            </div>
            <div className="donacion-paragraph">
           Elige el <strong>tipo</strong> y <strong>monto</strong> de tu donación:
            </div>
            <div className="donacion-btn-group">
              <button
                className={`donacion-btn${tipo === "unica" ? " selected" : ""}`}
                onClick={() => setTipo("unica")}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{marginRight: 10, verticalAlign: 'middle'}}>
                  <path d="M17.5 8.5c-1.2-1.1-2.7-1.2-3.5-1.2-.8 0-2.3.1-3.5 1.2C8.1 9.7 7 11.5 7 13.7c0 2.2 1.2 4.3 3.1 5.1.7.3 1.4.4 2.1.4.7 0 1.4-.1 2.1-.4 1.9-.8 3.1-2.9 3.1-5.1 0-2.2-1.1-4-2.9-5.2z" fill={tipo === 'unica' ? '#fff' : '#ff7300'}/>
                  <path d="M12.5 6.5c.6-.7 1.2-1.7 1.2-2.7 0-.2-.2-.3-.3-.3-.7 0-1.6.5-2.1 1.1-.5.6-.9 1.4-.9 2.2 0 .2.2.3.3.3.7 0 1.5-.4 2-1.1z" fill={tipo === 'unica' ? '#fff' : '#ff7300'}/>
                </svg>
                Única vez
              </button>
              <button
                className={`donacion-btn${tipo === "mensual" ? " selected" : ""}`}
                onClick={() => setTipo("mensual")}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{marginRight: 6}}>
                  <rect x="3" y="4" width="18" height="17" rx="3" fill={tipo === 'mensual' ? '#fff' : '#ff7300'} fillOpacity="0.15"/>
                  <rect x="3" y="8" width="18" height="13" rx="2" fill={tipo === 'mensual' ? '#fff' : '#ff7300'}/>
                  <rect x="7" y="2" width="2" height="4" rx="1" fill={tipo === 'mensual' ? '#fff' : '#ff7300'}/>
                  <rect x="15" y="2" width="2" height="4" rx="1" fill={tipo === 'mensual' ? '#fff' : '#ff7300'}/>
                </svg>
                Mensual
              </button>
            </div>
            <div className="donacion-montos">
              <button
                className={`donacion-monto-btn monto-2${cantidad === 2 && !otroActivo ? " selected" : ""}`}
                onClick={() => handleCantidad(2)}
              >
                <span className="usd-label">USD</span>
                <span className="usd-value">2</span>
              </button>
              <button
                className={`donacion-monto-btn monto-10${cantidad === 10 && !otroActivo ? " selected" : ""}`}
                onClick={() => handleCantidad(10)}
              >
                <span className="usd-label">USD</span>
                <span className="usd-value">10</span>
              </button>
              <button
                className={`donacion-monto-btn monto-30${cantidad === 30 && !otroActivo ? " selected" : ""}`}
                onClick={() => handleCantidad(30)}
              >
                <span className="usd-label">USD</span>
                <span className="usd-value">30</span>
              </button>
              <button
                className={`donacion-monto-btn monto-50${cantidad === 50 && !otroActivo ? " selected" : ""}`}
                onClick={() => handleCantidad(50)}
              >
                <span className="usd-label">USD</span>
                <span className="usd-value">50</span>
              </button>
            </div>
            <div className="donacion-otro-row">
              <button
                className={`donacion-otro-btn${otroActivo ? " selected" : ""}`}
                onClick={handleOtro}
                type="button"
              >
                Otro 
              </button>
              <input
                type="number"
                placeholder="Ingresa el monto"
                value={otroActivo ? otro : ""}
                onFocus={handleOtro}
                onChange={e => {
                  setOtro(e.target.value);
                  setCantidad(Number(e.target.value));
                }}
                className="donacion-otro-input"
                min={otroActivo ? 3 : undefined}
              />
            </div>
            {cantidad < 2 && (
              <div className="donacion-warning">
                El monto mínimo permitido es USD 2
              </div>
            )}
            <button className="donar-btn" disabled={cantidad < 2} onClick={handleDonarAhora}>
              Donar ahora
            </button>
     
          </div>
        </div>
        <div className="main-right">
          {/* Contador de niños beneficiados */}
          <div className="ninios-anim">
            <div>
              <h1 className="puzzle-title">Tu eres la <strong>pieza</strong> que falta para <strong>acabar</strong> con la desnutrición</h1>
            </div>
            {/* Personas alimentadas */}
            <div className="puzzle-analogy-section">
              <div className="puzzle-container">
                <img src="/puzzle/completo.png" alt="Puzzle completo" className="puzzle-bg" />
                {PUZZLE_PIECES.map(piece => {
                  const show = getPuzzlePieces(cantidad).includes(piece.key);
                  return (
                    <img
                      key={piece.key}
                      src={piece.src}
                      alt={piece.key}
                      className={`puzzle-piece${show ? ' show' : ''}`}
                      style={piece.style}
                    />
                  );
                })}
              </div>
              <PersonasAlimentadas cantidad={cantidad} tipo={tipo} />
            </div>
          </div>
 
          
        </div>
      </div>
      {/* Hero horizontal info section */}
      <div className="info-hero-section" style={{backgroundImage: "url('https://images.unsplash.com/photo-1593113598332-3b6a3b2a4b1b?auto=format&fit=crop&w=1200&q=80')"}}>
        <div className="info-hero-overlay">
          <div className="info-hero-content">
            <h2>¿Qué hacemos con tus donaciones?</h2>
            <p>
              Sus contribuciones son utilizadas para <b>adquirir alimentos de alto valor nutricional</b> y cubrir la logística que asegure una buena gestión y calidad de los alimentos.
            </p>
            <hr style={{margin: "32px auto", border: "none", borderTop: "2px solid #fff", width: "60%"}} />
            <h2>¿Cómo lo hacemos?</h2>
            <p>
              Los alimentos gestionados por diferentes fuentes de supermercados, centrales y otros, son complementados con los adquiridos por donaciones y enviados a través de un sistema integral de organizaciones sociales que garantizan trazabilidad y reportería para nuestros benefactores.
            </p>
          </div>
        </div>
      </div>
      {/* Sección de impacto con imagen centrada */}
      <section className="impacto-section">
        <h2 className="impacto-title">Conoce el impacto que genera tu donación</h2>
        <div className="impacto-img-wrapper">
          <img src="/que-hacemos.webp" alt="Impacto de tu donación" className="impacto-img" />
        </div>
      </section>
      {/* Modal de opciones de pago */}
      {showPagoModal && (
        <div className="modal-pago-overlay" onClick={() => setShowPagoModal(false)}>
          <div className="modal-pago" onClick={e => e.stopPropagation()}>
            <button className="modal-pago-close" onClick={() => setShowPagoModal(false)}>&times;</button>
            <h2 className="modal-pago-title">Selecciona tu método de pago</h2>
            <div className="modal-pago-options">
              <a
                href="https://www.paypal.com/donate"
                target="_blank"
                rel="noopener noreferrer"
                className="modal-pago-btn paypal"
              >
                <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="modal-pago-logo" />
                Pagar con PayPal
              </a>
              <button className="modal-pago-btn local">
                <span style={{fontSize: '1.5rem', marginRight: 8}}>💳</span>
                Pagar con tarjeta
              </button>
              <button
                className="modal-pago-btn deuna"
                onClick={() => {
                  setShowPagoModal(false);
                  const params = new URLSearchParams({
                    monto: cantidad.toString(),
                    nombre: deunaForm.nombre || '',
                    apellido: deunaForm.apellido || '',
                    correo: deunaForm.correo || '',
                    telefono: deunaForm.telefono || '',
                    documento: deunaForm.documento || '',
                    comunidad: comindadesChecked ? '1' : '0',
                  });
                  router.push(`/donacion/qr?${params.toString()}`);
                }}
              >
                <img src="https://vectorseek.com/wp-content/uploads/2023/08/Deuna-Wordmark-Logo-Vector.svg-.png" alt="DeUna" className="modal-pago-logo" style={{height:24}} />
                Pagar con DeUna (QR)
              </button>
            </div>
            <div className="modal-pago-info">*DeUna: pagos con QR solo para Ecuador</div>
          </div>
        </div>
      )}
      {/* Modal de DeUna */}
      {showDeunaModal && (
        <div className="modal-pago-overlay" onClick={() => setShowDeunaModal(false)}>
          <div className="modal-pago" onClick={e => e.stopPropagation()}>
            <button className="modal-pago-close" onClick={() => setShowDeunaModal(false)}>&times;</button>
            <h2 className="modal-pago-title">Información de Donación</h2>
            <div className="modal-pago-content-flex">
              <div className="modal-pago-form-side">
                <div style={{fontWeight:'bold', color:'#2F3388', fontSize:'1.2rem', marginBottom:12}}>Total a donar: <span style={{color:'#ff7300'}}>${cantidad}</span></div>
                <div className="donation-message">
                  <span>📝 Completa tus datos para llevar un registro de tus donaciones y mantener tu <b>racha</b>.</span>
                  <span className="streak-row">
                    <span className="fire-anim">🔥</span>
                    <span>¡Mientras más racha, más impacto y reconocimientos!</span>
                  </span>
                  <span className="opcional-msg">
                    <span className="opcional-bold">Opcional:</span> Si prefieres donar de forma anónima, puedes dejar los campos vacíos.
                  </span>
                </div>
                <form onSubmit={handleDeunaSubmit} style={{width:'100%', maxWidth: 340}}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="correo">Correo Electrónico</label>
                    <div className="input-wrapper">
                      <span className="input-icon">✉️</span>
                      <input id="correo" type="email" placeholder="Correo Electrónico" value={deunaForm.correo} autoFocus onChange={e => setDeunaForm({...deunaForm, correo: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="nombre">Nombre</label>
                    <div className="input-wrapper">
                      <span className="input-icon">👤</span>
                      <input id="nombre" name="nombre" type="text" placeholder="Nombre" value={deunaForm.nombre} onChange={e => setDeunaForm({...deunaForm, nombre: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="apellido">Apellido</label>
                    <div className="input-wrapper">
                      <span className="input-icon">👤</span>
                      <input id="apellido" name="apellido" type="text" placeholder="Apellido" value={deunaForm.apellido} onChange={e => setDeunaForm({...deunaForm, apellido: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="telefono">Número de Teléfono <span style={{color:'#888', fontWeight:400}}>(opcional)</span></label>
                    <div className="input-wrapper">
                      <span className="input-icon">📱</span>
                      <input id="telefono" type="tel" placeholder="Número de Teléfono (opcional)" value={deunaForm.telefono} onChange={e => setDeunaForm({...deunaForm, telefono: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="documento">Documento de Identidad</label>
                    <div className="input-wrapper">
                      <span className="input-icon">📄</span>
                      <input id="documento" name="documento" type="text" placeholder="Documento de Identidad" value={deunaForm.documento} onChange={e => setDeunaForm({...deunaForm, documento: e.target.value})} />
                    </div>
                  </div>
                  <div className="consent-group">
                    <input id="consent" type="checkbox" className="consent-checkbox" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)} />
                    <label htmlFor="consent" className="consent-label">Si ingresas tus datos, podremos comunicarte eventos, mantener tu racha y más.</label>
                  </div>
                  <div className="consent-group">
                    <input id="comindades" type="checkbox" className="consent-checkbox" checked={comindadesChecked} onChange={e => setComindadesChecked(e.target.checked)} />
                    <label htmlFor="comindades" className="consent-label">Deseo pertenecer a la comunidad de comindades</label>
                  </div>
                  <button type="submit" disabled={!canSubmit}>Confirmar Pago</button>
                </form>
              </div>
              <div className="modal-pago-qr-side">
                <>
                  <div className="qr-container">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DeUna" alt="QR Ficticio" />
                  </div>
                  <div className="qr-total">Total a pagar: <span style={{color:'#ff7300'}}>${cantidad}</span></div>
                  <img src="https://vectorseek.com/wp-content/uploads/2023/08/Deuna-Wordmark-Logo-Vector.svg-.png" alt="DeUna logo" className="qr-logo" />
                </>
              </div>
            </div>
            {showConfetti && (
              <div className="confetti">
                {/* Simple confetti animation with CSS */}
                {Array.from({length: 40}).map((_,i) => (
                  <span key={i} style={{
                    position:'absolute',
                    left: `${Math.random()*100}%`,
                    top: `${Math.random()*10}%`,
                    fontSize: `${Math.random()*18+12}px`,
                    color: ['#ff7300','#ffb347','#2F3388','#FFD580','#FF6347'][i%5],
                    animation: `confetti-fall 1.5s linear forwards`,
                    animationDelay: `${Math.random()}s`,
                  }}>🎉</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente animado de personas alimentadas
function PersonasAlimentadas({ cantidad, tipo }: { cantidad: number, tipo: string }) {
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
      <div className="platos-label">{personas === 1 ? 'persona alimentada' : 'Personas alimentadas'}</div>
      <div style={{ fontSize: '0.8rem', color: 'gray', marginTop: 2 }}>Con un solo $1 alimentas  a una persona durante <br /> todo un día.</div>
      {tipo === 'mensual' && (
        <div className="proyeccion-anual-animada">
          Proyección anual: {personas * 12} personas alimentadas al año
        </div>
      )}
    </div>
  );
} 