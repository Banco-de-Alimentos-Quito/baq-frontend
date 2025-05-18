'use client';
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function DonacionMensualPage() {
  const params = useSearchParams();
  const router = useRouter();
  const monto = Number(params.get('monto')) || 0;
  const [form, setForm] = useState({
    correo: '',
    cuenta: '',
    tipoCuenta: '',
    banco: '',
    acepta: false,
  });
  const [enviado, setEnviado] = useState(false);
  const [tocado, setTocado] = useState<{[k: string]: boolean}>({});
  const [termsChecked, setTermsChecked] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value, type } = target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    }));
    setTocado(t => ({ ...t, [name]: true }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTocado(t => ({ ...t, [e.target.name]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTocado({ correo: true, cuenta: true, tipoCuenta: true, banco: true, acepta: true });
    if (!(form.correo && form.cuenta && form.tipoCuenta && form.banco && form.acepta && termsChecked)) return;
    setEnviado(true);
    toast.success('¡Contrato generado!', {
      description: 'Te hemos enviado el contrato generado a tu correo electrónico.',
      duration: 2200,
      action: {
        label: '',
        onClick: () => {},
      },
    });
    setTimeout(() => {
      setEnviado(false);
      router.push('/thank-you');
    }, 2200);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Espacio reservado para navbar (sin mostrarlo) */}
      <div style={{ paddingTop: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 4px 24px #0001',
            padding: '40px 32px',
            maxWidth: 420,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <h1 style={{ color: '#2F3388', fontWeight: 900, fontSize: '1.5rem', marginBottom: 18, textAlign: 'center' }}>
            Donación mensual
          </h1>
          <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
            Correo electrónico
            <input
              type="email"
              name="correo"
              required
              value={form.correo}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, color: '#222' }}
              placeholder="tucorreo@email.com"
            />
            {tocado.correo && !form.correo && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
          </label>
          <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
            Número de cuenta del donador
            <input
              type="text"
              name="cuenta"
              required
              value={form.cuenta}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, color: '#222' }}
              placeholder="Ej: 1234567890"
            />
            {tocado.cuenta && !form.cuenta && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
          </label>
          <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
            Tipo de cuenta
            <select
              name="tipoCuenta"
              required
              value={form.tipoCuenta}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, background: '#fff', color: form.tipoCuenta ? '#222' : '#bbb' }}
            >
              <option value="" style={{ color: '#bbb' }}>Selecciona el tipo de cuenta</option>
              <option value="Ahorros">Ahorros</option>
              <option value="Corriente">Corriente</option>
            </select>
            {tocado.tipoCuenta && !form.tipoCuenta && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
          </label>
          <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
            Banco o cooperativa
            <select
              name="banco"
              required
              value={form.banco}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, background: '#fff', color: form.banco ? '#222' : '#bbb' }}
            >
              <option value="" style={{ color: '#bbb' }}>Selecciona tu banco o cooperativa</option>
              <option value="Banco Pichincha">Banco Pichincha</option>
              <option value="Banco Guayaquil">Banco Guayaquil</option>
              <option value="Banco del Pacífico">Banco del Pacífico</option>
              <option value="Banco Produbanco">Produbanco</option>
              <option value="Banco Internacional">Banco Internacional</option>
              <option value="Banco Bolivariano">Banco Bolivariano</option>
              <option value="Banco de Loja">Banco de Loja</option>
              <option value="Banco General Rumiñahui">Banco General Rumiñahui</option>
              <option value="Banco Amazonas">Banco Amazonas</option>
              <option value="Banco Solidario">Banco Solidario</option>
              <option value="Banco Machala">Banco Machala</option>
              <option value="Banco ProCredit">Banco ProCredit</option>
              <option value="Cooperativa JEP">Cooperativa JEP</option>
              <option value="Cooperativa Policía Nacional">Cooperativa Policía Nacional</option>
              <option value="Cooperativa 29 de Octubre">Cooperativa 29 de Octubre</option>
              <option value="Cooperativa Alianza del Valle">Cooperativa Alianza del Valle</option>
              <option value="Cooperativa Andalucía">Cooperativa Andalucía</option>
              <option value="Cooperativa Oscus">Cooperativa Oscus</option>
              <option value="Cooperativa Cooprogreso">Cooperativa Cooprogreso</option>
              <option value="Otra">Otra</option>
            </select>
            {tocado.banco && !form.banco && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
          </label>
          <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
            Monto a donar
            <input
              type="number"
              name="monto"
              value={monto}
              readOnly
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, background: '#f3f3f3', color: '#2F3388', fontWeight: 700 }}
            />
          </label>
          <div style={{ width: '100%', margin: '12px 0', background: '#f8fafc', borderRadius: 8, padding: 12, border: '1px solid #eee', color: '#2F3388', fontSize: 15 }}>
            <input
              type="checkbox"
              name="acepta"
              checked={form.acepta}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              style={{ marginRight: 8 }}
            />
            <span>
              Acepto que se me debite mensualmente este monto a favor de la Fundación Banco de Alimentos Quito.
            </span>
            {tocado.acepta && !form.acepta && <span style={{ color: '#e53e3e', fontSize: 13, display: 'block', marginTop: 4 }}>Debes aceptar la cláusula</span>}
          </div>
          <div style={{ width: '100%', margin: '12px 0', background: '#f8fafc', borderRadius: 8, padding: 12, border: '1px solid #eee', color: '#2F3388', fontSize: 15 }}>
            <input
              type="checkbox"
              name="terms"
              checked={termsChecked}
              onChange={e => setTermsChecked(e.target.checked)}
              required
              style={{ marginRight: 8 }}
            />
            <span>
              Acepto que he leído previamente los{' '}
              <Link 
                href="/politicas" 
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Términos y Condiciones, y Política de Tratamiento de Datos Personales
              </Link>
              .
            </span>
          </div>
          <button
            type="submit"
            disabled={!(form.correo && form.cuenta && form.tipoCuenta && form.banco && form.acepta && termsChecked)}
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #ff7300, #ffb347)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              border: 'none',
              borderRadius: 8,
              padding: 14,
              marginTop: 8,
              boxShadow: '0 2px 8px #ff730033',
              cursor: !(form.correo && form.cuenta && form.tipoCuenta && form.banco && form.acepta && termsChecked) ? 'not-allowed' : 'pointer',
              opacity: !(form.correo && form.cuenta && form.tipoCuenta && form.banco && form.acepta && termsChecked) ? 0.5 : 1,
              transition: 'background 0.2s',
            }}
          >
            Generar contrato
          </button>
          {enviado && (
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
                  Revisa tu correo y gracias por tu donación
                </div>
                <div style={{ fontSize: 16, color: '#555', marginBottom: 18 }}>
                  Te hemos enviado el contrato generado a tu correo electrónico.
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
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
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translateY(-100px); }
          100% { opacity: 0; transform: translateY(100vh); }
        }
        @media (max-width: 600px) {
          .navbar-tomate { height: 80px; }
          .navbar-logo { width: 100px; }
        }
      `}</style>
    </div>
  );
} 