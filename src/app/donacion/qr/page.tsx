// app/donacion/qr/page.tsx
'use client';
import React, { Suspense } from "react";
import { useSearchParams } from 'next/navigation';

// Componente interno que usa useSearchParams
function QRContent() {
  const params = useSearchParams();
  const cantidad = Number(params.get('monto')) || 0;
  
  return (
    <div style={{ paddingTop: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 4px 24px #0001',
        padding: '40px 32px',
        maxWidth: 400,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h1 style={{ color: '#2F3388', fontWeight: 900, fontSize: '1.5rem', marginBottom: 18, textAlign: 'center' }}>
          ¡Escanea el código QR para completar tu donación!
        </h1>
        <img src="/qr_example.png" alt="QR para donación" style={{ width: 220, height: 220, margin: '18px 0', borderRadius: 16, border: '2px solid #ff7300', background: '#fff' }} />
        <div style={{ fontSize: '1.2rem', color: '#ff7300', fontWeight: 700, margin: '18px 0 8px 0' }}>
          Total a pagar: <span style={{ color: '#2F3388' }}>${cantidad}</span>
        </div>
        <div style={{ color: '#555', fontSize: '1rem', textAlign: 'center', marginBottom: 8 }}>
          Una vez realizado el pago, tu donación será registrada automáticamente.<br />¡Gracias por tu solidaridad!
        </div>
        <img src="https://vectorseek.com/wp-content/uploads/2023/08/Deuna-Wordmark-Logo-Vector.svg-.png" alt="DeUna logo" style={{ height: 18, marginTop: 12, opacity: 0.7 }} />
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function DonacionQRPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Suspense fallback={<div style={{ paddingTop: 120, textAlign: 'center' }}>Cargando...</div>}>
        <QRContent />
      </Suspense>
      <style>{`
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
        @media (max-width: 600px) {
          .navbar-tomate { height: 80px; }
          .navbar-logo { width: 100px; }
        }
      `}</style>
    </div>
  );
}
