'use client';
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function DonacionMensualForm() {
  const params = useSearchParams();
  const router = useRouter();
  const monto = Number(params.get('monto')) || 0;
  const [form, setForm] = useState({
    cedula: '',
    nombres: '',
    numero: '',
    correo: '',
    direccion: '',
    cuenta: '',
    tipoCuenta: '',
    banco: '',
    otroBanco: '',
    pais: '',
    ciudad: '',
    acepta: false,
  });
  const [enviado, setEnviado] = useState(false);
  const [tocado, setTocado] = useState<{ [k: string]: boolean }>({});
  const [termsChecked, setTermsChecked] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const isFormValid = () => {
    const requiredFields = form.cedula && form.nombres && form.numero && form.correo &&
      form.direccion && form.cuenta && form.tipoCuenta && form.banco &&
      form.pais && form.ciudad && form.acepta && termsChecked;

    // Si seleccionó "Otra" en banco, también debe llenar otroBanco
    if (form.banco === 'Otra') {
      return requiredFields && form.otroBanco;
    }

    return requiredFields;
  };

  const validateEcuadorianId = (id: string): boolean => {
    // Remove any non-numeric characters
    const cleanId = id.replace(/\D/g, '');

    // Check length (10 for cedula, 13 for RUC)
    if (cleanId.length !== 10 && cleanId.length !== 13) {
      return false;
    }

    // For RUC (13 digits), validate the first 10 digits
    const cedula = cleanId.length === 13 ? cleanId.substring(0, 10) : cleanId;

    // Validate cedula algorithm
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      let digit = parseInt(cedula[i]) * coefficients[i];
      if (digit >= 10) {
        digit -= 9;
      }
      sum += digit;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    const lastDigit = parseInt(cedula[9]);

    return checkDigit === lastDigit;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    
    setTocado({
      cedula: true, nombres: true, numero: true, correo: true, direccion: true,
      cuenta: true, tipoCuenta: true, banco: true, otroBanco: true, pais: true, ciudad: true, acepta: true
    });

    if (!isFormValid()) {
      return;
    }

    // Validate Ecuadorian ID (cedula/RUC) format
    if (!validateEcuadorianId(form.cedula)) {
      toast.error('Cédula/RUC inválido', {
        description: 'El formato de la cédula o RUC ingresado no es válido. Verifica e intenta nuevamente.',
        duration: 5000,
      });
      return;
    }

    setEnviado(true);

    try {
      // Prepare the payload according to the API specification
      const payload = {
        cedula_ruc: form.cedula,
        nombres_completos: form.nombres,
        numero_telefono: form.numero,
        correo_electronico: form.correo,
        direccion: form.direccion,
        numero_cuenta: form.cuenta,
        tipo_cuenta: form.tipoCuenta,
        banco_cooperativa: form.banco === 'Otra' ? form.otroBanco : form.banco,
        monto_donar: monto,
        acepta_aporte_voluntario: form.acepta,
        acepta_tratamiento_datos: termsChecked,
        pais: form.pais,
        ciudad: form.ciudad
        // Note: estatus_kyc is handled by the backend, not sent from frontend
      };

      // Validate required fields before sending
      const requiredFields = [
        'cedula_ruc', 'nombres_completos', 'numero_telefono', 'correo_electronico',
        'direccion', 'numero_cuenta', 'tipo_cuenta', 'banco_cooperativa',
        'monto_donar', 'acepta_aporte_voluntario', 'acepta_tratamiento_datos',
        'pais', 'ciudad'
      ];

      const missingFields = requiredFields.filter(field => {
        const value = payload[field as keyof typeof payload];
        return value === undefined || value === null || value === '';
      });

      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate data types
      if (typeof payload.monto_donar !== 'number' || payload.monto_donar < 0.99) {
        throw new Error('Monto must be a number greater than or equal to 0.99 USD');
      }

      if (typeof payload.acepta_aporte_voluntario !== 'boolean') {
        throw new Error('acepta_aporte_voluntario must be boolean');
      }

      if (typeof payload.acepta_tratamiento_datos !== 'boolean') {
        throw new Error('acepta_tratamiento_datos must be boolean');
      }

      // Validate numero_cuenta format (should be number string, 8-20 chars)
      if (!/^\d{8,20}$/.test(payload.numero_cuenta)) {
        throw new Error('numero_cuenta must be 8-20 digits');
      }

      // Validate cedula_ruc format (10 or 13 digits)
      if (!/^\d{10,13}$/.test(payload.cedula_ruc)) {
        throw new Error('cedula_ruc must be 10-13 digits');
      }

      if (!validateEcuadorianId(payload.cedula_ruc)) {
        throw new Error('cedula_ruc must be a valid Ecuadorian ID or RUC');
      }

      // Validate numero_telefono format (9-15 characters, should be digits only)
      const cleanPhone = payload.numero_telefono.replace(/\D/g, '');
      if (cleanPhone.length < 9 || cleanPhone.length > 15) {
        throw new Error('numero_telefono must be 9-15 digits');
      }
      // Update payload with clean phone number
      payload.numero_telefono = cleanPhone;

      // Get API URL from environment variable
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }
      
      const endpoint = `${apiUrl}/donaciones-recurrentes/donador`;


      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorText;
        try {
          const errorJson = await response.json();
          errorText = JSON.stringify(errorJson);
          console.error('❌ Error response JSON:', errorJson);
        } catch {
          errorText = await response.text();
          console.error('❌ Error response text:', errorText);
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();

      // Show success modal instead of toast
      setEnviado(false);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('❌ Error submitting form:', error);

      let errorMessage = 'Error al enviar el formulario';
      let errorDescription = 'Hubo un problema al procesar tu solicitud. Por favor, intenta nuevamente.';

      if (error instanceof Error) {
        if (error.message.includes('Missing required fields')) {
          errorMessage = 'Campos requeridos faltantes';
          errorDescription = error.message;
        } else if (error.message.includes('must be')) {
          errorMessage = 'Error de validación';
          errorDescription = error.message;
        } else if (error.message.includes('HTTP error! status: 400')) {
          errorMessage = 'Error de validación del servidor';
          errorDescription = 'Los datos enviados no cumplen con los requisitos del servidor. Verifica la información.';
        } else if (error.message.includes('HTTP error! status: 404')) {
          errorMessage = 'Servicio no encontrado';
          errorDescription = 'El servicio de backend no está disponible. Contacta al administrador.';
        } else if (error.message.includes('HTTP error! status: 500')) {
          errorMessage = 'Error interno del servidor';
          errorDescription = 'Hay un problema en el servidor backend. Contacta al administrador técnico.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Error de conexión';
          errorDescription = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Error de configuración CORS';
          errorDescription = 'Problema de configuración del servidor. Contacta al administrador.';
        }
      }

      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000,
      });
      setEnviado(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // Reset form after successful submission
    setForm({
      cedula: '',
      nombres: '',
      numero: '',
      correo: '',
      direccion: '',
      cuenta: '',
      tipoCuenta: '',
      banco: '',
      otroBanco: '',
      pais: '',
      ciudad: '',
      acepta: false,
    });
    setTocado({});
    setTermsChecked(false);
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
            Cédula/RUC
            <input
              type="text"
              name="cedula"
              required
              value={form.cedula}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, color: '#222' }}
              placeholder="Ej: 1710034065"
            />
            {tocado.cedula && !form.cedula && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
          </label>

          <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
            Nombres Completos
            <input
              type="text"
              name="nombres"
              required
              value={form.nombres}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, color: '#222' }}
              placeholder="Ej: Juan Carlos Pérez González"
            />
            {tocado.nombres && !form.nombres && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
          </label>

          <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
            Número de teléfono
            <input
              type="tel"
              name="numero"
              required
              value={form.numero}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, color: '#222' }}
              placeholder="Ej: 0991234567"
            />
            {tocado.numero && !form.numero && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
          </label>

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
            Dirección
            <input
              type="text"
              name="direccion"
              required
              value={form.direccion}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, color: '#222' }}
              placeholder="Ej: Av. Principal 123 y Secundaria"
            />
            {tocado.direccion && !form.direccion && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
          </label>

          <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
            País
            <select
              name="pais"
              required
              value={form.pais}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, background: '#fff', color: form.pais ? '#222' : '#bbb' }}
            >
              <option value="" style={{ color: '#bbb' }}>Selecciona tu país</option>
              <option value="Ecuador">Ecuador</option>
              <option value="Colombia">Colombia</option>
              <option value="Perú">Perú</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Estados Unidos">Estados Unidos</option>
              <option value="España">España</option>
              <option value="Otro">Otro</option>
            </select>
            {tocado.pais && !form.pais && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
          </label>

          <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
            Ciudad
            <input
              type="text"
              name="ciudad"
              required
              value={form.ciudad}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, color: '#222' }}
              placeholder="Ej: Quito, Guayaquil, Cuenca"
            />
            {tocado.ciudad && !form.ciudad && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
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

          {form.banco === 'Otra' && (
            <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
              Especifica tu banco o cooperativa
              <input
                type="text"
                name="otroBanco"
                required
                value={form.otroBanco}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, color: '#222' }}
                placeholder="Nombre de tu banco o cooperativa"
              />
              {tocado.otroBanco && form.banco === 'Otra' && !form.otroBanco && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
            </label>
          )}

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
            disabled={!isFormValid() || enviado}
            onClick={(e) => {
            }}
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
              cursor: (!isFormValid() || enviado) ? 'not-allowed' : 'pointer',
              opacity: (!isFormValid() || enviado) ? 0.5 : 1,
              transition: 'background 0.2s',
            }}
          >
            {enviado ? 'Enviando...' : 'Generar contrato'}
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
                  Enviando solicitud...
                </div>
                <div style={{ fontSize: 16, color: '#555', marginBottom: 18 }}>
                  Por favor espera mientras procesamos tu información.
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
                  ¡Solicitud enviada exitosamente!
                </div>
                <div style={{ fontSize: 16, color: '#555', marginBottom: 18 }}>
                  Revisa tu correo electrónico para acceder al portal y completar tu donación mensual.
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
        </form>
      </div>
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