// app/donacion/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PaymentModal from '../components/PaymentModal';

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
  const [tipo, setTipo] = useState<'unica' | 'mensual'>('mensual');
  const [cantidad, setCantidad] = useState(0);
  const [otro, setOtro] = useState('');
  const [otroActivo, setOtroActivo] = useState(false);
  const [animNinios, setAnimNinios] = useState(calcularNinios(12));
  const animRef = useRef<number | null>(null);

  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showDeunaModal, setShowDeunaModal] = useState(false);

  const [deunaForm, setDeunaForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    documento: ''
  });
  const [consentChecked, setConsentChecked] = useState(false);
  const [comindadesChecked, setComindadesChecked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const canSubmitDeuna =
    consentChecked ||
    (!deunaForm.nombre &&
      !deunaForm.apellido &&
      !deunaForm.correo &&
      !deunaForm.telefono &&
      !deunaForm.documento);

  // Animación de conteo de niños
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
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [cantidad]);

  const handleCantidad = (valor: number) => {
    setCantidad(valor);
    setOtroActivo(false);
    setOtro('');
  };

  const handleOtroFocus = () => {
    setCantidad(0);
    setOtroActivo(true);
  };

  const handleDonarAhora = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cantidad < 2) return;
    if (tipo === 'mensual') {
      router.push(`/donacion/mensual?monto=${cantidad}`);
    } else {
      setShowPagoModal(true);
    }
  };

  const handleDeunaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1800);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Espacio para header fijo (si existe) */}
      <div className="w-screen flex flex-col items-center justify-center mb-8 pt-32 pb-2">
        {/* Puedes agregar logo o mensaje de bienvenida aquí */}
      </div>

      <div className="flex flex-col lg:flex-row justify-center items-start gap-12 px-4 lg:px-0">
        {/* Sección izquierda */}
        <div className="flex-1 max-w-md min-w-[320px] flex flex-col items-center">
          <div className="bg-white rounded-2xl p-[44px_36px_36px_36px] w-full max-w-md shadow-[0_8px_32px_rgba(255,140,0,0.13)] flex flex-col items-center">
            <h1 className="bg-gradient-to-r from-[#ff7300] to-[#FF6347] bg-clip-text text-transparent text-3xl font-extrabold text-center mb-4">
              A un <strong>clic</strong> para alimentar
            </h1>
            <p className="text-center text-lg font-medium text-orange-500 mb-2">
              Tu aporte ayuda a transformar vidas.
            </p>
            <p className="text-center text-lg font-medium text-orange-700 mb-5">
              Elige el <strong>tipo</strong> y <strong>monto</strong> de tu donación:
            </p>

            {/* Tipo de donación */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-lg transition-transform ${
                  tipo === 'unica'
                    ? 'bg-gradient-to-r from-[#2F3388] to-[#1D2394] text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 shadow-md hover:bg-[#2F3388] hover:text-white'
                }`}
                onClick={() => setTipo('unica')}
              >
                {/* Ícono corazón */}
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mr-2"
                >
                  <path
                    d="M17.5 8.5c-1.2-1.1-2.7-1.2-3.5-1.2-.8 0-2.3.1-3.5 1.2C8.1
                       9.7 7 11.5 7 13.7c0 2.2 1.2 4.3 3.1 5.1.7.3
                       1.4.4 2.1.4.7 0 1.4-.1 2.1-.4 1.9-.8
                       3.1-2.9 3.1-5.1 0-2.2-1.1-4-2.9-5.2z"
                    fill={tipo === 'unica' ? '#fff' : '#ff7300'}
                  />
                  <path
                    d="M12.5 6.5c.6-.7 1.2-1.7 1.2-2.7
                       0-.2-.2-.3-.3-.3-.7 0-1.6.5-2.1 1.1-.5.6-.9
                       1.4-.9 2.2 0 .2.2.3.3.3.7 0 1.5-.4 2-1.1z"
                    fill={tipo === 'unica' ? '#fff' : '#ff7300'}
                  />
                </svg>
                Única vez
              </button>

              <button
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-lg transition-transform ${
                  tipo === 'mensual'
                    ? 'bg-gradient-to-r from-[#2F3388] to-[#1D2394] text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 shadow-md hover:bg-[#2F3388] hover:text-white'
                }`}
                onClick={() => setTipo('mensual')}
              >
                {/* Ícono calendario */}
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mr-1"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="17"
                    rx="3"
                    fill={tipo === 'mensual' ? '#fff' : '#ff7300'}
                    fillOpacity="0.15"
                  />
                  <rect
                    x="3"
                    y="8"
                    width="18"
                    height="13"
                    rx="2"
                    fill={tipo === 'mensual' ? '#fff' : '#ff7300'}
                  />
                  <rect
                    x="7"
                    y="2"
                    width="2"
                    height="4"
                    rx="1"
                    fill={tipo === 'mensual' ? '#fff' : '#ff7300'}
                  />
                  <rect
                    x="15"
                    y="2"
                    width="2"
                    height="4"
                    rx="1"
                    fill={tipo === 'mensual' ? '#fff' : '#ff7300'}
                  />
                </svg>
                Mensual
              </button>
            </div>

            {/* Montos predefinidos */}
            <div className="grid grid-cols-2 gap-4 mb-6 w-full">
              {[2, 10, 30, 50].map(m => (
                <button
                  key={m}
                  className={`flex flex-col items-center rounded-lg px-7 py-4 font-bold text-lg shadow-md transition-transform ${
                    cantidad === m && !otroActivo
                      ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg scale-105 filter brightness-95 contrast-125'
                      : 'bg-white text-orange-600 opacity-95 hover:brightness-110'
                  }`}
                  onClick={() => handleCantidad(m)}
                >
                  <span className="text-sm">USD</span>
                  <span className="text-xl">{m}</span>
                </button>
              ))}
            </div>

            {/* Otro monto manual */}
            <div className="flex w-full mb-6">
              <button
                className={`rounded-l-lg px-6 py-4 font-bold text-lg shadow-md transition-transform ${
                  otroActivo
                    ? 'bg-gradient-to-r from-orange-500 to-orange-300 text-white shadow-lg scale-105'
                    : 'bg-gradient-to-r from-orange-500 to-orange-300 text-white shadow-md'
                }`}
                onClick={handleOtroFocus}
                type="button"
              >
                Otro
              </button>
              <input
                type="number"
                placeholder="Ingresa el monto"
                value={otroActivo ? otro : ''}
                onFocus={handleOtroFocus}
                onChange={e => {
                  // Validar que el valor sea un número positivo y sin decimales mayor a 2
                  const value = parseFloat(e.target.value);
                  if (value >= 2 && Number.isInteger(value)) {
                    setCantidad(value);
                    setOtro(value.toString());
                  } else {
                    setCantidad(0);
                    setOtro('');
                  }
                }}
                inputMode="numeric"
                pattern="[0-9]*"
                min={otroActivo ? 3 : undefined}
                className="flex-1 rounded-r-lg p-4 font-bold text-lg bg-white shadow-md focus:outline-none"
              />
            </div>

            {cantidad < 2 && (
              <p className="text-center text-lg font-bold text-orange-400 mb-3">
                El monto mínimo permitido es USD 2
              </p>
            )}

            <button
              className="w-full bg-[#ED6F1D] text-white rounded-full py-3 font-black text-xl shadow-lg transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={cantidad < 2}
              onClick={handleDonarAhora}
            >
              Donar ahora
            </button>
          </div>
        </div>

        {/* Sección derecha: puzzle y contador */}
        <div className="flex-1 max-w-md min-w-[320px] flex flex-col items-center">
          <div className="bg-gradient-to-r from-[#ffb347] to-[#ff7300] rounded-2xl p-8 w-full shadow-2xl flex flex-col items-center mb-8 animate-[fadeInBounce_1.2s_cubic-bezier(.68,-.55,.27,1.55)]">
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-4">
              Tu eres la <strong>pieza</strong> que falta para <strong>acabar</strong> con la desnutrición
            </h1>
            <div className="relative w-80 max-w-full">
              <img
                src="/puzzle/completo.png"
                alt="Puzzle completo"
                className="w-full h-auto opacity-20 rounded-lg"
              />
              {PUZZLE_PIECES.map(piece => {
                const show = getPuzzlePieces(cantidad).includes(piece.key);
                return (
                  <img
                    key={piece.key}
                    src={piece.src}
                    alt={piece.key}
                    className={`absolute w-full h-full object-contain transition-opacity duration-700 ${
                      show ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      top: piece.style.top ?? 'auto',
                      bottom: piece.style.bottom ?? 'auto',
                      left: piece.style.left ?? 'auto',
                      right: piece.style.right ?? 'auto',
                    }}
                  />
                );
              })}
            </div>
            <PersonasAlimentadas cantidad={cantidad} tipo={tipo} />
          </div>
        </div>
      </div>

      {/* Sección Informativa Horizontal */}
      <section
        className="relative w-full bg-cover bg-center mb-8 px-4 py-12"
        style={{ backgroundImage: "url('/beneficiarios.webp')" }}
      >
        {/* Overlay negro semitransparente que envuelve el texto */}
        <div className="bg-black/60 p-8 rounded-lg max-w-2xl mx-auto">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              ¿Qué hacemos con tus donaciones?
            </h2>
            <p className="text-lg font-medium mb-8">
              Sus contribuciones son utilizadas para{' '}
              <b>adquirir alimentos de alto valor nutricional</b> y cubrir la logística
              que asegure una buena gestión y calidad de los alimentos.
            </p>
            <hr className="border-t-2 border-white mx-auto w-3/5 mb-8" />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              ¿Cómo lo hacemos?
            </h2>
            <p className="text-lg font-medium">
              Los alimentos gestionados por diferentes fuentes de supermercados,
              centrales y otros, son complementados con los adquiridos por
              donaciones y enviados a través de un sistema integral de organizaciones
              sociales que garantizan trazabilidad y reportería para nuestros
              benefactores.
            </p>
          </div>
        </div>
      </section>


      {/* Sección de Impacto */}
      <section className="w-screen bg-gradient-to-r from-[#fff7ed] to-[#ffe0c3] flex flex-col items-center py-16">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-[#ff7300] to-[#FF6347] bg-clip-text text-transparent mb-8">
          Conoce el impacto que genera tu donación
        </h2>
        <div className="w-full flex justify-center">
          <img
            src="/que-hacemos.webp"
            alt="Impacto de tu donación"
            className="w-[99vw] max-w-[900px] rounded-2xl object-cover"
          />
        </div>
      </section>

      {/* Modal de métodos de pago */}
      <PaymentModal
        isOpen={showPagoModal}
        onClose={() => setShowPagoModal(false)}
        cantidad={cantidad}
        deunaForm={deunaForm}
        setDeunaForm={setDeunaForm}
        comindadesChecked={comindadesChecked}
        setComindadesChecked={setComindadesChecked}
        consentChecked={consentChecked}
        setConsentChecked={setConsentChecked}
        onSubmitDeuna={handleDeunaSubmit}
      />

      {/* Modal de formulario DeUna (opcional) */}
      {showDeunaModal && (
        <div
          className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center"
          onClick={() => setShowDeunaModal(false)}
        >
          <div
            className="bg-white rounded-xl p-8 w-full max-w-md shadow-xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-2xl text-[#ff7300]"
              onClick={() => setShowDeunaModal(false)}
            >
              &times;
            </button>
            <h2 className="text-center text-2xl font-extrabold text-[#2F3388] mb-6">
              Información de Donación
            </h2>
            <form
              onSubmit={handleDeunaSubmit}
              className="flex flex-col gap-4"
            >
              {/* Campos de correo, nombre, apellido, teléfono, documento */}
              {(['correo','nombre','apellido','telefono','documento'] as const).map(field => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">
                    {field === 'correo' ? 'Correo Electrónico' :
                     field === 'telefono' ? 'Número de Teléfono (opcional)' :
                     field === 'documento' ? 'Documento de Identidad' :
                     field === 'nombre' ? 'Nombre' : 'Apellido'}
                  </label>
                  <input
                    type={field==='correo'?'email':field==='telefono'?'tel':'text'}
                    placeholder={field === 'telefono'
                      ? 'Número de teléfono (opcional)'
                      : `Ingresa tu ${field}`}
                    value={deunaForm[field]}
                    onChange={e =>
                      setDeunaForm(prev => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none"
                  />
                </div>
              ))}

              <div className="flex items-start gap-2">
                <input
                  id="consent"
                  type="checkbox"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  className="mt-[3px]"
                />
                <label htmlFor="consent" className="text-sm text-[#2F3388] font-medium">
                  Al ingresar mis datos, podrán mantener mi racha y comunicar eventos.
                </label>
              </div>
              <div className="flex items-start gap-2">
                <input
                  id="comunidad"
                  type="checkbox"
                  checked={comindadesChecked}
                  onChange={e => setComindadesChecked(e.target.checked)}
                  className="mt-[3px]"
                />
                <label htmlFor="comunidad" className="text-sm text-[#2F3388] font-medium">
                  Deseo pertenecer a la comunidad DeUna.
                </label>
              </div>

              <button
                type="submit"
                disabled={!canSubmitDeuna}
                className="w-full bg-gradient-to-r from-[#ff7300] to-[#ffb347] text-white py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Pago
              </button>
            </form>

            {showConfetti && (
              <div className="pointer-events-none fixed inset-0 z-50 animate-[confetti-fall_1.5s_linear]">
                {Array.from({ length: 40 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 10}%`,
                      fontSize: `${Math.random() * 18 + 12}px`,
                      color: ['#ff7300', '#ffb347', '#2F3388', '#FFD580', '#FF6347'][i % 5],
                      animationDelay: `${Math.random()}s`,
                    }}
                  >
                    🎉
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar: PersonasAlimentadas
function PersonasAlimentadas({
  cantidad,
  tipo,
}: {
  cantidad: number;
  tipo: string;
}) {
  const [personas, setPersonas] = useState(cantidad);

  useEffect(() => {
    const end = cantidad;
    if (personas === end) return;
    const step = personas < end ? 1 : -1;
    const iv = setInterval(() => {
      setPersonas(prev => {
        if (prev === end) {
          clearInterval(iv);
          return prev;
        }
        return prev + step;
      });
    }, 30);
    return () => clearInterval(iv);
  }, [cantidad]);

  return (
    <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow-md">
      <div className="text-[#FF7E15] text-3xl font-extrabold mb-1">
        {personas}
      </div>
      <div className="text-[#b85c00] text-lg font-bold mb-2 text-center">
        {personas === 1 ? 'persona alimentada' : 'Personas alimentadas'}
      </div>
      <div className="text-gray-500 text-sm text-center">
        Con un solo $1 alimentas a una persona durante todo un día.
      </div>
      {tipo === 'mensual' && (
        <div className="text-transparent bg-gradient-to-r from-[#2F3388] to-[#ff7300] bg-clip-text font-extrabold text-lg mt-4 animate-[fadeInUpBounce_1s_cubic-bezier(.68,-.55,.27,1.55)]">
          Proyección anual: {personas * 12} personas alimentadas al año
        </div>
      )}
    </div>
  );
}
