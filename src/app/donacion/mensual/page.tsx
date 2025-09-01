'use client';
import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

function DonacionMensualForm() {
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
    ciudad: '',
    acepta: false,
  });
  const [enviado, setEnviado] = useState(false);
  const [tocado, setTocado] = useState<{ [k: string]: boolean }>({});
  const [termsChecked, setTermsChecked] = useState(false);
  const [errores, setErrores] = useState<{ [k: string]: string }>({});
  const [cedulaValida, setCedulaValida] = useState<boolean | null>(null);
  const [correoValido, setCorreoValido] = useState<boolean | null>(null);
  const [telefonoValido, setTelefonoValido] = useState<boolean | null>(null);
  const [cuentaValida, setCuentaValida] = useState<boolean | null>(null);
  const [nombresValido, setNombresValido] = useState<boolean | null>(null);
  const [direccionValida, setDireccionValida] = useState<boolean | null>(null);
  const [ciudadValida, setCiudadValida] = useState<boolean | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value, type } = target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    }));
    setTocado(t => ({ ...t, [name]: true }));

    // Limpiar errores cuando el usuario empiece a escribir
    if (errores[name]) {
      setErrores(err => ({ ...err, [name]: '' }));
    }

    // Validación en tiempo real para cédula
    if (name === 'cedula') {
      if (value && validateEcuadorianId(value)) {
        setCedulaValida(true);
        setErrores(err => ({ ...err, cedula: '' }));
      } else if (value) {
        setCedulaValida(false);
        setErrores(err => ({ ...err, cedula: 'Cédula/RUC inválido. Verifica el formato.' }));
      } else {
        setCedulaValida(null);
        setErrores(err => ({ ...err, cedula: '' }));
      }
    }

    // Validación en tiempo real para correo
    if (name === 'correo') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && emailRegex.test(value)) {
        setCorreoValido(true);
        setErrores(err => ({ ...err, correo: '' }));
      } else if (value) {
        setCorreoValido(false);
        setErrores(err => ({ ...err, correo: 'Formato de correo electrónico inválido.' }));
      } else {
        setCorreoValido(null);
        setErrores(err => ({ ...err, correo: '' }));
      }
    }

    // Validación en tiempo real para teléfono
    if (name === 'numero') {
      const cleanPhone = value.replace(/\D/g, '');
      if (value && cleanPhone.length >= 9 && cleanPhone.length <= 15) {
        setTelefonoValido(true);
        setErrores(err => ({ ...err, numero: '' }));
      } else if (value) {
        setTelefonoValido(false);
        setErrores(err => ({ ...err, numero: 'Debe tener entre 9 y 15 dígitos.' }));
      } else {
        setTelefonoValido(null);
        setErrores(err => ({ ...err, numero: '' }));
      }
    }

    // Validación en tiempo real para número de cuenta
    if (name === 'cuenta') {
      const cleanAccount = value.replace(/\D/g, '');
      if (value && cleanAccount.length >= 8 && cleanAccount.length <= 20) {
        setCuentaValida(true);
        setErrores(err => ({ ...err, cuenta: '' }));
      } else if (value) {
        setCuentaValida(false);
        setErrores(err => ({ ...err, cuenta: 'Debe tener entre 8 y 20 dígitos.' }));
      } else {
        setCuentaValida(null);
        setErrores(err => ({ ...err, cuenta: '' }));
      }
    }

    // Validación en tiempo real para nombres
    if (name === 'nombres') {
      if (value && value.trim().length >= 3) {
        setNombresValido(true);
        setErrores(err => ({ ...err, nombres: '' }));
      } else if (value) {
        setNombresValido(false);
        setErrores(err => ({ ...err, nombres: 'Debe tener al menos 3 caracteres.' }));
      } else {
        setNombresValido(null);
        setErrores(err => ({ ...err, nombres: '' }));
      }
    }

    // Validación en tiempo real para dirección
    if (name === 'direccion') {
      if (value && value.trim().length >= 5) {
        setDireccionValida(true);
        setErrores(err => ({ ...err, direccion: '' }));
      } else if (value) {
        setDireccionValida(false);
        setErrores(err => ({ ...err, direccion: 'Debe tener al menos 5 caracteres.' }));
      } else {
        setDireccionValida(null);
        setErrores(err => ({ ...err, direccion: '' }));
      }
    }

    // Validación en tiempo real para ciudad
    if (name === 'ciudad') {
      if (value && value.trim().length >= 2) {
        setCiudadValida(true);
        setErrores(err => ({ ...err, ciudad: '' }));
      } else if (value) {
        setCiudadValida(false);
        setErrores(err => ({ ...err, ciudad: 'Debe tener al menos 2 caracteres.' }));
      } else {
        setCiudadValida(null);
        setErrores(err => ({ ...err, ciudad: '' }));
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTocado(t => ({ ...t, [name]: true }));
  
    // Validación específica para cédula
    if (name === 'cedula' && value) {
      if (validateEcuadorianId(value)) {
        setCedulaValida(true);
        setErrores(err => ({ ...err, cedula: '' }));
        
        // Evento GA4 - Campo completado exitosamente
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'campo_cedula', {
            campo_nombre: 'cedula',
            campo_tipo: 'identificacion',
            form_step: 1
          });
        }
      } else {
        setCedulaValida(false);
        setErrores(err => ({ ...err, cedula: 'Cédula/RUC inválido. Verifica el formato.' }));
      }
    } else if (name === 'cedula' && !value) {
      setCedulaValida(null);
    }
  
    // Validación específica para correo
    if (name === 'correo' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) {
        setCorreoValido(true);
        setErrores(err => ({ ...err, correo: '' }));
        
        // Evento GA4 - Campo completado exitosamente
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'campo_correo', {
            campo_nombre: 'correo',
            campo_tipo: 'contacto',
            form_step: 2
          });
        }
      } else {
        setCorreoValido(false);
        setErrores(err => ({ ...err, correo: 'Formato de correo electrónico inválido.' }));
      }
    } else if (name === 'correo' && !value) {
      setCorreoValido(null);
    }
  
    // Validación específica para teléfono
    if (name === 'numero' && value) {
      const cleanPhone = value.replace(/\D/g, '');
      if (cleanPhone.length >= 9 && cleanPhone.length <= 15) {
        setTelefonoValido(true);
        setErrores(err => ({ ...err, numero: '' }));
        
        // Evento GA4 - Campo completado exitosamente
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'campo_telefono', {
            campo_nombre: 'numero',
            campo_tipo: 'contacto',
            form_step: 3
          });
        }
      } else {
        setTelefonoValido(false);
        setErrores(err => ({ ...err, numero: 'Debe tener entre 9 y 15 dígitos.' }));
      }
    } else if (name === 'numero' && !value) {
      setTelefonoValido(null);
    }
  
    // Validación específica para cuenta
    if (name === 'cuenta' && value) {
      const cleanAccount = value.replace(/\D/g, '');
      if (cleanAccount.length >= 8 && cleanAccount.length <= 20) {
        setCuentaValida(true);
        setErrores(err => ({ ...err, cuenta: '' }));
        
        // Evento GA4 - Campo completado exitosamente
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'campo_cuenta', {
            campo_nombre: 'cuenta',
            campo_tipo: 'bancario',
            form_step: 4
          });
        }
      } else {
        setCuentaValida(false);
        setErrores(err => ({ ...err, cuenta: 'Debe tener entre 8 y 20 dígitos.' }));
      }
    } else if (name === 'cuenta' && !value) {
      setCuentaValida(null);
    }
  
    // Validación específica para nombres
    if (name === 'nombres' && value) {
      if (value.trim().length >= 3) {
        setNombresValido(true);
        setErrores(err => ({ ...err, nombres: '' }));
        
        // Evento GA4 - Campo completado exitosamente
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'campo_nombres', {
            campo_nombre: 'nombres',
            campo_tipo: 'identificacion',
            form_step: 5
          });
        }
      } else {
        setNombresValido(false);
        setErrores(err => ({ ...err, nombres: 'Debe tener al menos 3 caracteres.' }));
      }
    } else if (name === 'nombres' && !value) {
      setNombresValido(null);
    }
  
    // Validación específica para dirección
    if (name === 'direccion' && value) {
      if (value.trim().length >= 5) {
        setDireccionValida(true);
        setErrores(err => ({ ...err, direccion: '' }));
        
        // Evento GA4 - Campo completado exitosamente
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'campo_direccion', {
            campo_nombre: 'direccion',
            campo_tipo: 'contacto',
            form_step: 6
          });
        }
      } else {
        setDireccionValida(false);
        setErrores(err => ({ ...err, direccion: 'Debe tener al menos 5 caracteres.' }));
      }
    } else if (name === 'direccion' && !value) {
      setDireccionValida(null);
    }
  
    // Validación específica para ciudad
    if (name === 'ciudad' && value) {
      if (value.trim().length >= 2) {
        setCiudadValida(true);
        setErrores(err => ({ ...err, ciudad: '' }));
        
        // Evento GA4 - Campo completado exitosamente
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'campo_ciudad', {
            campo_nombre: 'ciudad',
            campo_tipo: 'contacto',
            form_step: 7
          });
        }
      } else {
        setCiudadValida(false);
        setErrores(err => ({ ...err, ciudad: 'Debe tener al menos 2 caracteres.' }));
      }
    } else if (name === 'ciudad' && !value) {
      setCiudadValida(null);
    }
  
    // Validación para campos select (tipoCuenta, banco)
    if (name === 'tipoCuenta' && value) {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'campo_tipoCuenta', {
          campo_nombre: 'tipoCuenta',
          campo_tipo: 'bancario',
          form_step: 8,
          valor_seleccionado: value
        });
      }
    }
  
    if (name === 'banco' && value) {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'campo_banco', {
          campo_nombre: 'banco',
          campo_tipo: 'bancario',
          form_step: 9,
          valor_seleccionado: value
        });
      }
    }
  
    if (name === 'otroBanco' && value && value.trim().length >= 2) {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'campo_otroBanco', {
          campo_nombre: 'otroBanco',
          campo_tipo: 'bancario',
          form_step: 10
        });
      }
    }
  };

  const isFormValid = () => {
    const requiredFields = form.cedula && form.nombres && form.numero && form.correo &&
      form.direccion && form.cuenta && form.tipoCuenta && form.banco &&
      form.ciudad && form.acepta && termsChecked;

    // Si seleccionó "Otra" en banco, también debe llenar otroBanco
    if (form.banco === 'Otra') {
      return requiredFields && form.otroBanco;
    }

    return requiredFields;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started');
    console.log('📝 Current form data:', form);
    console.log('✅ Terms checked:', termsChecked);
    console.log('💰 Monto:', monto);
    
    setTocado({
      cedula: true, nombres: true, numero: true, correo: true, direccion: true,
      cuenta: true, tipoCuenta: true, banco: true, otroBanco: true, ciudad: true, acepta: true
    });

    if (!isFormValid()) {
      console.log('❌ Form validation failed');
      return;
    }

    // Validate Ecuadorian ID (cedula/RUC) format
    if (!validateEcuadorianId(form.cedula)) {
      console.log('❌ Ecuadorian ID validation failed');
      toast.error('Cédula/RUC inválido', {
        description: 'El formato de la cédula o RUC ingresado no es válido. Verifica e intenta nuevamente.',
        duration: 5000,
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.correo)) {
      console.log('❌ Email validation failed');
      toast.error('Correo electrónico inválido', {
        description: 'El formato del correo electrónico no es válido. Verifica e intenta nuevamente.',
        duration: 5000,
      });
      return;
    }

    console.log('✅ All validations passed, starting API call');
    setEnviado(true);

    try {
      // Validaciones adicionales según el DTO del backend
      
      // Validar longitud de cédula/RUC (10-13 caracteres)
      if (form.cedula.length < 10 || form.cedula.length > 13) {
        toast.error('Cédula/RUC inválido', {
          description: 'La cédula debe tener 10 dígitos o el RUC 13 dígitos.',
          duration: 5000,
        });
        setEnviado(false);
        return;
      }

      // Validar longitud de número telefónico (9-15 caracteres)
      const cleanPhone = form.numero.replace(/\D/g, '');
      if (cleanPhone.length < 9 || cleanPhone.length > 15) {
        toast.error('Número de teléfono inválido', {
          description: 'El número de teléfono debe tener entre 9 y 15 dígitos.',
          duration: 5000,
        });
        setEnviado(false);
        return;
      }

      // Validar número de cuenta (8-20 dígitos)
      const cleanAccount = form.cuenta.replace(/\D/g, '');
      if (cleanAccount.length < 8 || cleanAccount.length > 20) {
        toast.error('Número de cuenta inválido', {
          description: 'El número de cuenta debe tener entre 8 y 20 dígitos.',
          duration: 5000,
        });
        setEnviado(false);
        return;
      }

      // Validar monto mínimo (mayor a 0.99 USD)
      if (monto < 0.99) {
        toast.error('Monto inválido', {
          description: 'El monto debe ser mayor a 1 USD.',
          duration: 5000,
        });
        setEnviado(false);
        return;
      }

      // Validar tipo de cuenta
      if (!['Ahorros', 'Corriente'].includes(form.tipoCuenta)) {
        toast.error('Tipo de cuenta inválido', {
          description: 'Selecciona un tipo de cuenta válido.',
          duration: 5000,
        });
        setEnviado(false);
        return;
      }

      // Prepare the payload according to the API specification
      const payload = {
        cedula_ruc: form.cedula,
        nombres_completos: form.nombres,
        numero_telefono: cleanPhone, // Usar número limpio
        correo_electronico: form.correo,
        direccion: form.direccion,
        numero_cuenta: cleanAccount, // Usar cuenta limpia
        tipo_cuenta: form.tipoCuenta as 'Ahorros' | 'Corriente',
        banco_cooperativa: form.banco === 'Otra' ? form.otroBanco : form.banco,
        monto_donar: monto,
        acepta_aporte_voluntario: form.acepta,
        acepta_tratamiento_datos: termsChecked,
        ciudad: form.ciudad
      };

      // Validate required fields before sending
      const requiredFields = [
        'cedula_ruc', 'nombres_completos', 'numero_telefono', 'correo_electronico',
        'direccion', 'numero_cuenta', 'tipo_cuenta', 'banco_cooperativa',
        'monto_donar', 'acepta_aporte_voluntario', 'acepta_tratamiento_datos',
        'ciudad'
      ];

      // Validación final de campos requeridos
      const missingFields = requiredFields.filter(field => {
        const value = payload[field as keyof typeof payload];
        return value === undefined || value === null || value === '';
      });

      if (missingFields.length > 0) {
        console.error('❌ Missing required fields:', missingFields);
        toast.error('Campos faltantes', {
          description: `Faltan campos requeridos: ${missingFields.join(', ')}`,
          duration: 5000,
        });
        setEnviado(false);
        return;
      }

      console.log('📤 Enviando donación mensual:', payload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/donaciones-recurrentes/donador`, {
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

      if (response.ok) {
        console.log('✅ Donación mensual procesada exitosamente:', result);
        toast.success('¡Donación mensual registrada!', {
          description: 'Tus datos han sido enviados exitosamente a nuestro sistema.',
          duration: 2200,
          action: {
            label: '',
            onClick: () => { },
          },
        });

        setTimeout(() => {
          setEnviado(false);
          setErrores({});
          setCedulaValida(null);
          setCorreoValido(null);
          setTelefonoValido(null);
          setCuentaValida(null);
          setNombresValido(null);
          setDireccionValida(null);
          setCiudadValida(null);
          //router.push('/thank-you');
        }, 2200);
      } else {
        console.error('❌ Error al procesar donación mensual:', result);
        toast.error('Error al procesar donación', {
          description: 'Hubo un problema al procesar tu donación mensual. Inténtalo de nuevo.',
          duration: 3000,
        });
        setEnviado(false);
        setErrores({});
        setCedulaValida(null);
        setCorreoValido(null);
        setTelefonoValido(null);
        setCuentaValida(null);
        setNombresValido(null);
        setDireccionValida(null);
        setCiudadValida(null);
      }
    } catch (error) {
      console.error('❌ Error enviando donación mensual:', error);
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor. Verifica tu conexión.',
        duration: 3000,
      });
      setEnviado(false);
      setErrores({});
      setCedulaValida(null);
      setCorreoValido(null);
      setTelefonoValido(null);
      setCuentaValida(null);
      setNombresValido(null);
      setDireccionValida(null);
      setCiudadValida(null);
    }
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
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                name="cedula"
                required
                value={form.cedula}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, color: '#222', paddingRight: cedulaValida !== null ? 50 : 12 }}
                placeholder="Ej: 1710034065"
              />
              {cedulaValida === true && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}
              {cedulaValida === false && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  ✕
                </div>
              )}
            </div>
            {tocado.cedula && !form.cedula && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
            {errores.cedula && <span style={{ color: '#e53e3e', fontSize: 13 }}>{errores.cedula}</span>}
          </label>

          <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
            Nombres Completos
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                name="nombres"
                required
                value={form.nombres}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, color: '#222', paddingRight: nombresValido !== null ? 50 : 12 }}
                placeholder="Ej: Juan Carlos Pérez González"
              />
              {nombresValido === true && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}
              {nombresValido === false && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  ✕
                </div>
              )}
            </div>
            {tocado.nombres && !form.nombres && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
            {errores.nombres && <span style={{ color: '#e53e3e', fontSize: 13 }}>{errores.nombres}</span>}
          </label>

          <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
            Número de teléfono
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="tel"
                name="numero"
                required
                value={form.numero}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, color: '#222', paddingRight: telefonoValido !== null ? 50 : 12 }}
                placeholder="Ej: 0991234567"
              />
              {telefonoValido === true && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}
              {telefonoValido === false && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  ✕
                </div>
              )}
            </div>
            {tocado.numero && !form.numero && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
            {errores.numero && <span style={{ color: '#e53e3e', fontSize: 13 }}>{errores.numero}</span>}
          </label>

          <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
            Correo electrónico
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="email"
                name="correo"
                required
                value={form.correo}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, color: '#222', paddingRight: correoValido !== null ? 50 : 12 }}
                placeholder="tucorreo@email.com"
              />
              {correoValido === true && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}
              {correoValido === false && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  ✕
                </div>
              )}
            </div>
            {tocado.correo && !form.correo && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
            {errores.correo && <span style={{ color: '#e53e3e', fontSize: 13 }}>{errores.correo}</span>}
          </label>

          <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
            Dirección
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                name="direccion"
                required
                value={form.direccion}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, color: '#222', paddingRight: direccionValida !== null ? 50 : 12 }}
                placeholder="Ej: Av. Principal 123 y Secundaria"
              />
              {direccionValida === true && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}
              {direccionValida === false && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  ✕
                </div>
              )}
            </div>
            {tocado.direccion && !form.direccion && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
            {errores.direccion && <span style={{ color: '#e53e3e', fontSize: 13 }}>{errores.direccion}</span>}
          </label>

          <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
            Ciudad
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                name="ciudad"
                required
                value={form.ciudad}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, color: '#222', paddingRight: ciudadValida !== null ? 50 : 12 }}
                placeholder="Ej: Quito, Guayaquil, Cuenca"
              />
              {ciudadValida === true && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}
              {ciudadValida === false && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  ✕
                </div>
              )}
            </div>
            {tocado.ciudad && !form.ciudad && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
            {errores.ciudad && <span style={{ color: '#e53e3e', fontSize: 13 }}>{errores.ciudad}</span>}
          </label>

          <label className="form-label" style={{ width: '100%', marginBottom: 8 }}>
            Número de cuenta del donador
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                name="cuenta"
                required
                value={form.cuenta}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginTop: 4, fontSize: 16, color: '#222', paddingRight: cuentaValida !== null ? 50 : 12 }}
                placeholder="Ej: 1234567890"
              />
              {cuentaValida === true && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}
              {cuentaValida === false && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}>
                  ✕
                </div>
              )}
            </div>
            {tocado.cuenta && !form.cuenta && <span style={{ color: '#e53e3e', fontSize: 13 }}>Falta completar este campo</span>}
            {errores.cuenta && <span style={{ color: '#e53e3e', fontSize: 13 }}>{errores.cuenta}</span>}
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
              onChange={(e) => {
                handleChange(e);
                // Evento GA4 para aceptar débito
                if (e.target.checked && typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'aceptar_debito', {
                    campo_nombre: 'acepta_debito',
                    campo_tipo: 'consentimiento',
                    form_step: 11,
                    valor: 'aceptado'
                  });
                }
              }}
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
              onChange={(e) => {
                setTermsChecked(e.target.checked);
                // Evento GA4 para aceptar términos y condiciones
                if (e.target.checked && typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'aceptar_terminos', {
                    campo_nombre: 'acepta_terminos',
                    campo_tipo: 'consentimiento',
                    form_step: 12,
                    valor: 'aceptado'
                  });
                }
              }}
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
            disabled={!isFormValid()}
            onClick={(e) => {
              try {
                const eventPayload = {
                  value: monto || 0,
                  currency: 'USD',
                  donation_type: 'mensual',
                };
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'generar_contrato', eventPayload);
                } else if (typeof window !== 'undefined' && (window as any).dataLayer) {
                  (window as any).dataLayer.push({ event: 'generar_contrato', ...eventPayload });
                }
              } catch (err) {
                // no bloquear el envío en caso de error con analytics
              }
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
              cursor: !isFormValid() ? 'not-allowed' : 'pointer',
              opacity: !isFormValid() ? 0.5 : 1,
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

function LoadingForm() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div>Cargando formulario...</div>
    </div>
  );
}

export default function DonacionMensualPage() {
  return (
    <Suspense fallback={<LoadingForm />}>
      <DonacionMensualForm />
    </Suspense>
  );
}