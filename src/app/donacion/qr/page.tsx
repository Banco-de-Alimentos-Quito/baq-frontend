// app/donacion/qr/page.tsx
'use client';
import React, { Suspense, useState } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast, Toaster } from 'sonner';

// Componente interno que usa useSearchParams
function QRContent() {
  const params = useSearchParams();
  const cantidad = Number(params.get('monto')) || 0;
  const router = useRouter();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [streakEnabled, setStreakEnabled] = useState(false);
  const [correo, setCorreo] = useState('');

  const handleConfirmPayment = () => {
    setShowConfirmationModal(true);
  };

  const handleSubmitDonation = async () => {
    setShowConfirmationModal(false);
    setShowLoadingModal(true);

    try {
      const payload = {
        correo_electronico: correo || 'anonimo@baq.ec', // Email opcional, usar valor por defecto si no se proporciona
        monto_donar: cantidad
      };

      const response = await fetch('https://api.baq.ec/api/baq/donaciones/donador-simple', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setShowLoadingModal(false);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error submitting donation:', error);
      toast.error('Error al registrar la donación', {
        description: 'Hubo un problema al procesar tu donación. Por favor, intenta nuevamente.',
        duration: 4000,
      });
      setShowLoadingModal(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.push('/thank-you');
  };

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
        <h1 className="text-[#2F3388] font-black text-2xl mb-5 text-center">
          ¡Escanea el código QR para completar tu donación!
        </h1>
        <Image
          src="/qr_example.png"
          alt="QR para donación"
          width={220}
          height={220}
          className="my-[18px] rounded-2xl border-2 border-[#ff7300] bg-white"
        />
        <div style={{ fontSize: '1.2rem', color: '#ff7300', fontWeight: 700, margin: '18px 0 8px 0' }}>
          Total a pagar: <span style={{ color: '#2F3388' }}>${cantidad}</span>
        </div>
        <div style={{ color: '#555', fontSize: '1rem', textAlign: 'center', marginBottom: 8 }}>
          Una vez realizado el pago, tu donación será registrada automáticamente.<br />¡Gracias por tu solidaridad!
        </div>

        <img src="https://vectorseek.com/wp-content/uploads/2023/08/Deuna-Wordmark-Logo-Vector.svg-.png" alt="DeUna logo" style={{ height: 18, marginTop: 12, opacity: 0.7 }} />
        <button
          onClick={handleConfirmPayment}
          style={{
            marginTop: 24,
            width: '100%',
            background: 'linear-gradient(90deg, #ff7300, #ffb347)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 18,
            border: 'none',
            borderRadius: 8,
            padding: 14,
            boxShadow: '0 2px 8px #ff730033',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          Confirmar pago
        </button>
      </div>

      {/* Modal de confirmación */}
      {showConfirmationModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 4px 24px #0002',
            padding: '32px',
            minWidth: 320,
            maxWidth: 400,
            textAlign: 'center',
            position: 'relative',
          }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#2F3388', marginBottom: 16 }}>
              ¿Deseas recibir notificaciones del BAQ?
            </div>
            <div style={{ fontSize: 16, color: '#555', marginBottom: 20 }}>
              Mantén una racha de donaciones y recibe actualizaciones sobre nuestro trabajo.
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, color: '#2F3388', fontWeight: 600, fontSize: 14 }}>
                Correo electrónico (opcional)
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tucorreo@email.com"
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 6,
                  border: '1px solid #ddd',
                  fontSize: 14,
                  color: '#222',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Para recibir notificaciones y mantener tu racha de donaciones
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                <span>Recibir notificaciones del BAQ</span>
              </label>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <input
                  type="checkbox"
                  checked={streakEnabled}
                  onChange={(e) => setStreakEnabled(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                <span>Mantener racha de donaciones</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowConfirmationModal(false)}
                style={{
                  flex: 1,
                  background: '#f3f3f3',
                  color: '#555',
                  fontWeight: 'bold',
                  fontSize: 16,
                  border: 'none',
                  borderRadius: 8,
                  padding: 12,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitDonation}
                style={{
                  flex: 1,
                  background: 'linear-gradient(90deg, #ff7300, #ffb347)',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 16,
                  border: 'none',
                  borderRadius: 8,
                  padding: 12,
                  cursor: 'pointer',
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de carga */}
      {showLoadingModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 4px 24px #0002',
            padding: '48px 32px',
            minWidth: 320,
            maxWidth: 380,
            textAlign: 'center',
            position: 'relative',
          }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#2F3388', marginBottom: 18 }}>
              Registrando donación...
            </div>
            <div style={{ fontSize: 16, color: '#555', marginBottom: 18 }}>
              Por favor espera mientras procesamos tu donación.
            </div>
            <div style={{
              width: 40,
              height: 40,
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #ff7300',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 4px 24px #0002',
            padding: '48px 32px',
            minWidth: 320,
            maxWidth: 380,
            textAlign: 'center',
            position: 'relative',
          }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#2F3388', marginBottom: 18 }}>
              ¡Donación registrada exitosamente!
            </div>
            <div style={{ fontSize: 16, color: '#555', marginBottom: 18 }}>
              Gracias por tu solidaridad. Tu donación ha sido procesada correctamente.
            </div>
            <button
              onClick={handleCloseSuccessModal}
              style={{
                background: 'linear-gradient(90deg, #ff7300, #ffb347)',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 18,
                border: 'none',
                borderRadius: 8,
                padding: 14,
                marginTop: 8,
                boxShadow: '0 2px 8px #ff730033',
                cursor: 'pointer',
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
        @media (max-width: 600px) {
          .navbar-tomate { height: 80px; }
          .navbar-logo { width: 100px; }
        }
      `}</style>
      <Toaster />
    </div>
  );
}
