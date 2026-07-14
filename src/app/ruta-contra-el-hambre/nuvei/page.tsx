"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";

// ── Tipos ───────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    PaymentCheckout: {
      modal: new (config: {
        client_app_code?: string;
        client_app_key?: string;
        locale?: string;
        env_mode: string;
        conf?: {
          style_version?: string;
          theme?: {
            logo?: string;
            primary_color?: string;
          };
        };
        onOpen?: () => void;
        onClose?: () => void;
        onResponse?: (response: NuveiResponse) => void;
      }) => {
        open: (params: { reference: string }) => void;
        close: () => void;
      };
    };
  }
}

interface NuveiTransaction {
  id: string;
  status: string;
  status_detail: number;
  authorization_code?: string;
  message?: string;
}

interface NuveiResponse {
  error?: { description: string };
  transaction?: NuveiTransaction;
}

interface NuveiCheckoutInstance {
  open: (params: { reference: string }) => void;
  close: () => void;
}

// ── Constantes ──────────────────────────────────────────────────────────────

const MONTO = 1;

const CATEGORIAS = [
  { label: "Jóvenes Activos [18 a 34 años]", minAge: 18, maxAge: 34 },
  { label: "Adultos en movimiento [35 a 45 años]", minAge: 35, maxAge: 45 },
  { label: "Adultos Mayores en acción [46 años en adelante]", minAge: 46, maxAge: 200 },
];

const TALLAS = ["S", "M", "L", "XL"];
const DISTANCIAS = ["5 Km", "10 Km"];
const GENEROS = ["Masculino", "Femenino", "Otro"];

// ── Helpers ─────────────────────────────────────────────────────────────────

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

function obtenerCategoria(edad: number): string {
  for (const cat of CATEGORIAS) {
    if (edad >= cat.minAge && edad <= cat.maxAge) return cat.label;
  }
  return "";
}

// ── Componente principal ────────────────────────────────────────────────────

function NuveiPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fases: 0=landing, 1=formulario, 2=politicas, 3=pago
  const [fase, setFase] = useState(0);

  // Formulario
  const [form, setForm] = useState({
    cedula: "",
    nombres: "",
    apellidos: "",
    genero: "",
    telefonoMovil: "",
    fechaNacimiento: "",
    correoElectronico: searchParams.get("email") || "",
    pais: "Ecuador",
    ciudad: "",
    talla: "",
    distancia: "",
  });

  const [edad, setEdad] = useState<number | null>(null);
  const [categoria, setCategoria] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aceptoPoliticas, setAceptoPoliticas] = useState(false);
  const [politicasTexto, setPoliticasTexto] = useState("");

  // Nuvei
  const [sdkReady, setSdkReady] = useState(false);
  const [checkoutInstance, setCheckoutInstance] = useState<NuveiCheckoutInstance | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [devReference, setDevReference] = useState("");
  const [txResult, setTxResult] = useState<{
    status: "success" | "error";
    title: string;
    message: string;
    txId?: string;
  } | null>(null);

  const modalInitialized = useRef(false);
  const formSectionRef = useRef<HTMLDivElement>(null);
  const politicasSectionRef = useRef<HTMLDivElement>(null);
  const pagoSectionRef = useRef<HTMLDivElement>(null);
  const fallbackUserId = React.useMemo(
    () => "user_" + String(Math.floor(Date.now() / 1000)),
    [],
  );

  // Cargar políticas
  useEffect(() => {
    fetch("/carrera/politicas.md")
      .then((res) => res.text())
      .then((text) => setPoliticasTexto(text))
      .catch(() => setPoliticasTexto("No se pudieron cargar las políticas."));
  }, []);

  // Auto-calcular edad y categoría
  useEffect(() => {
    if (form.fechaNacimiento) {
      const ed = calcularEdad(form.fechaNacimiento);
      setEdad(ed);
      const cat = obtenerCategoria(ed);
      setCategoria(cat);
      if (errors.fechaNacimiento) setErrors((prev) => ({ ...prev, fechaNacimiento: "" }));
    } else {
      setEdad(null);
      setCategoria("");
    }
  }, [form.fechaNacimiento]);

  // Inicializar Nuvei modal
  useEffect(() => {
    if (!sdkReady || !window.PaymentCheckout || modalInitialized.current) return;
    modalInitialized.current = true;

    const nuveiEnv = process.env.NEXT_PUBLIC_NUVEI_ENV;

    try {
      const instance = new window.PaymentCheckout.modal({
        locale: "es",
        env_mode: nuveiEnv,
        conf: {
          style_version: "2",
          theme: {
            logo: "https://donar.baq.ec/logo2.png",
            primary_color: "#C800A1",
          },
        },
        onOpen: () => console.log("[nuvei] Modal abierto"),
        onClose: () => {
          console.log("[nuvei] Modal cerrado");
          if (status !== "success") {
            setStatus("idle");
            setMessage("");
          }
        },
        onResponse: (response: NuveiResponse) => {
          console.log("[nuvei] onResponse:", JSON.stringify(response));
          if (response.error) {
            setStatus("error");
            setTxResult({
              status: "error",
              title: "Error de Conexión",
              message: response.error.description || "No se pudo comunicar con el procesador de pagos.",
            });
            return;
          }
          const tx = response.transaction;
          if (!tx) return;
          if (tx.status === "success" && tx.status_detail === 3) {
            setStatus("success");
            setTxResult({
              status: "success",
              title: "¡Inscripción Exitosa!",
              message: "Tu pago fue aprobado exitosamente. ¡Gracias por inscribirte en la Ruta Contra El Hambre!",
              txId: tx.id,
            });
          } else {
            setStatus("error");
            setTxResult({
              status: "error",
              title: "Pago Rechazado",
              message: tx.message || `No se pudo procesar la tarjeta. Intenta con otra. (Código: ${tx.status_detail})`,
              txId: tx.id,
            });
          }
        },
      });
      setCheckoutInstance(instance);
      const handlePopstate = () => instance.close();
      window.addEventListener("popstate", handlePopstate);
      return () => window.removeEventListener("popstate", handlePopstate);
    } catch (err) {
      console.error("[nuvei] Error al crear modal:", err);
      setStatus("error");
      setMessage("Error al inicializar el procesador de pagos.");
    }
  }, [sdkReady]);

  // Scroll suave a sección
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.distancia) newErrors.distancia = "Selecciona una distancia";
    if (!form.cedula.trim()) newErrors.cedula = "La cédula es requerida";
    if (!form.nombres.trim()) newErrors.nombres = "Los nombres son requeridos";
    if (!form.apellidos.trim()) newErrors.apellidos = "Los apellidos son requeridos";
    if (!form.genero) newErrors.genero = "Selecciona un género";
    if (!form.telefonoMovil.trim()) newErrors.telefonoMovil = "El teléfono es requerido";
    if (!form.fechaNacimiento) newErrors.fechaNacimiento = "La fecha de nacimiento es requerida";
    if (edad !== null && edad < 18) newErrors.fechaNacimiento = "Debes ser mayor de 18 años";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.correoElectronico.trim()) newErrors.correoElectronico = "El correo es requerido";
    else if (!emailRegex.test(form.correoElectronico)) newErrors.correoElectronico = "Correo inválido";
    if (!form.ciudad.trim()) newErrors.ciudad = "La ciudad es requerida";
    if (!form.talla) newErrors.talla = "Selecciona una talla";
    if (!categoria) newErrors.fechaNacimiento = "No se pudo determinar la categoría válida para tu edad";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validarFormulario()) {
      setFase(2);
      scrollToSection(politicasSectionRef);
    }
  };

  // Manejar aceptación de políticas
  const handlePoliticasSubmit = () => {
    setFase(3);
    scrollToSection(pagoSectionRef);
  };

  // Pagar
  const handlePay = async () => {
    if (!checkoutInstance) {
      setStatus("error");
      setMessage("El procesador de pagos aún no está listo.");
      return;
    }

    setStatus("loading");
    setMessage("Registrando datos y preparando el pago...");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // 1. Registrar participante en el backend
      const registerRes = await fetch(`${apiUrl}/nuvei/registrar-participante-carrera`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: form.cedula,
          nombres: form.nombres,
          apellidos: form.apellidos,
          genero: form.genero,
          telefonoMovil: form.telefonoMovil,
          fechaNacimiento: form.fechaNacimiento,
          edad: edad,
          correoElectronico: form.correoElectronico,
          pais: form.pais || "Ecuador",
          ciudad: form.ciudad,
          categoria: categoria,
          talla: form.talla,
          distancia: form.distancia,
        }),
      });

      if (!registerRes.ok) {
        const errorData = await registerRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al registrar participante");
      }

      const registerData = await registerRes.json();
      const ref = registerData.devReference;
      setDevReference(ref);

      // 2. Inicializar referencia de pago con Nuvei
      setStatus("processing");
      setMessage("Abriendo ventana de pago...");

      const initRes = await fetch(`${apiUrl}/nuvei/init-carrera`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: fallbackUserId,
          userEmail: form.correoElectronico,
          amount: MONTO,
          devReference: ref,
          description: "Ruta Contra El Hambre - 6ta Edicion",
          isRecurring: false,
        }),
      });

      if (!initRes.ok) {
        const errorData = await initRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Fallo al inicializar la transacción");
      }

      const data = await initRes.json();
      if (!data.reference) throw new Error("El servidor no devolvió una referencia válida");

      // 3. Abrir modal de pago
      checkoutInstance.open({ reference: data.reference });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      console.error("[handlePay] Error:", msg);
      setStatus("error");
      setMessage(`No se pudo iniciar el pago: ${msg}`);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      {/* SDK de Nuvei */}
      <Script
        src="https://cdn.paymentez.com/ccapi/sdk/payment_checkout_3.0.0.min.js"
        strategy="afterInteractive"
        onLoad={() => { console.log("[nuvei] SDK cargado"); setSdkReady(true); }}
        onError={() => { setStatus("error"); setMessage("No se pudo cargar el procesador de pagos."); }}
      />

      <div className="w-full relative grid">
        
        {/* IMAGEN DE FONDO COMPLETA - Define el alto del contenedor */}
        <img 
          src="/carrera/landing-carrera.png" 
          alt="Ruta Contra El Hambre" 
          className="w-full h-auto col-start-1 row-start-1 z-0 pointer-events-none"
        />

        {/* CONTENIDO SUPERPUESTO */}
        <div className="col-start-1 row-start-1 w-full relative z-10 flex flex-col items-center pb-20">
          
          {/* FASE 0: LANDING HERO */}
        {fase === 0 && (
          <section className="w-full flex flex-col items-center justify-start pt-[50vw] md:pt-[30vw] lg:pt-[20vw] pb-20 relative z-10">
            {/* The button floats over the background image */}
            <div className="bg-white/90 backdrop-blur-sm shadow-xl p-8 rounded-3xl text-center max-w-lg mx-auto border border-gray-100">
              <h1 className="text-3xl md:text-4xl font-bold text-[#2F3388] mb-4">
                Inscripción Abierta
              </h1>
              <p className="text-gray-600 mb-6 text-lg">
                Súmate a la Ruta Contra El Hambre y corre por una buena causa.
              </p>
              
              <div className="flex justify-center gap-4 mb-8">
                <div className="bg-gray-100 px-4 py-2 rounded-xl text-center shadow-sm">
                  <div className="text-xs text-gray-500 uppercase font-semibold">Valor</div>
                  <div className="font-bold text-[#C800A1] text-xl">${MONTO}</div>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-xl text-center shadow-sm">
                  <div className="text-xs text-gray-500 uppercase font-semibold">Distancias</div>
                  <div className="font-bold text-[#ED6F1D] text-xl">5K / 10K</div>
                </div>
              </div>

              <button 
                onClick={() => { setFase(1); scrollToSection(formSectionRef); }}
                className="bg-[#C800A1] text-white text-lg font-bold py-4 px-12 rounded-xl shadow-lg hover:bg-[#a00081] transition-all w-full"
              >
                Inscríbete Ahora
              </button>
            </div>
          </section>
        )}

        {/* FASE 1: FORMULARIO */}
        {fase >= 1 && (
          <section ref={formSectionRef} className="w-full px-4 pt-10 relative z-10">
            <div className="max-w-3xl mx-auto">
              
              {/* Stepper */}
              <div className="flex items-center justify-center gap-3 mb-8 bg-white/80 backdrop-blur-md py-4 px-6 rounded-full shadow-sm max-w-md mx-auto">
                {["Datos", "Políticas", "Pago"].map((step, i) => (
                  <React.Fragment key={step}>
                    <div className={`flex items-center gap-2 ${fase > i + 1 ? "text-green-600" : fase === i + 1 ? "text-[#C800A1]" : "text-gray-400"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${fase > i + 1 ? "border-green-600 bg-green-50 text-green-600" : fase === i + 1 ? "border-[#C800A1] bg-[#C800A1]/10 text-[#C800A1]" : "border-gray-300 text-gray-400"}`}>
                        {fase > i + 1 ? "✓" : i + 1}
                      </div>
                      <span className="text-sm font-semibold hidden sm:inline">{step}</span>
                    </div>
                    {i < 2 && <div className={`w-10 h-0.5 ${fase > i + 1 ? "bg-green-600" : "bg-gray-300"}`} />}
                  </React.Fragment>
                ))}
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-xl relative z-10">
                <h2 className="text-2xl font-bold text-[#2F3388] mb-2">Datos de Inscripción</h2>
                <p className="text-gray-500 text-sm mb-8">Completa todos los campos para registrarte en la carrera.</p>
                
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Distancia */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Distancia *</label>
                    <div className="grid grid-cols-2 gap-4">
                      {DISTANCIAS.map((d) => (
                        <button key={d} type="button" onClick={() => updateField("distancia", d)}
                          className={`py-3 px-4 rounded-xl border-2 font-bold transition-all ${form.distancia === d ? "border-[#ED6F1D] bg-[#ED6F1D]/10 text-[#ED6F1D]" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                    {errors.distancia && <p className="text-red-500 text-xs mt-1">{errors.distancia}</p>}
                  </div>
                  
                  {/* Cédula + Teléfono */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField label="Cédula *" value={form.cedula} onChange={(v) => updateField("cedula", v)} error={errors.cedula} placeholder="1712345678" />
                    <InputField label="Teléfono Móvil *" value={form.telefonoMovil} onChange={(v) => updateField("telefonoMovil", v)} error={errors.telefonoMovil} placeholder="0991234567" />
                  </div>
                  
                  {/* Nombres + Apellidos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField label="Nombres *" value={form.nombres} onChange={(v) => updateField("nombres", v)} error={errors.nombres} placeholder="Juan Carlos" />
                    <InputField label="Apellidos *" value={form.apellidos} onChange={(v) => updateField("apellidos", v)} error={errors.apellidos} placeholder="Pérez López" />
                  </div>
                  
                  {/* Género */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Género *</label>
                    <div className="grid grid-cols-3 gap-3">
                      {GENEROS.map((g) => (
                        <button key={g} type="button" onClick={() => updateField("genero", g)}
                          className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${form.genero === g ? "border-[#2F3388] bg-[#2F3388]/10 text-[#2F3388]" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                    {errors.genero && <p className="text-red-500 text-xs mt-1">{errors.genero}</p>}
                  </div>
                  
                  {/* Fecha Nacimiento + Categoría */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField label="Fecha de Nacimiento *" type="date" value={form.fechaNacimiento} onChange={(v) => updateField("fechaNacimiento", v)} error={errors.fechaNacimiento} />
                    
                    {/* Categoría (Readonly) */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Categoría (Auto)</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={categoria ? `${categoria} (${edad} años)` : "Selecciona fecha de nacimiento"} 
                        className={`w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none transition font-semibold ${categoria ? "text-[#C800A1]" : "text-gray-400"}`}
                      />
                    </div>
                  </div>
                  
                  {/* Correo */}
                  <InputField label="Correo Electrónico *" type="email" value={form.correoElectronico} onChange={(v) => updateField("correoElectronico", v)} error={errors.correoElectronico} placeholder="tu@correo.com" />
                  
                  {/* País + Ciudad */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField label="País" value={form.pais} onChange={(v) => updateField("pais", v)} placeholder="Ecuador" />
                    <InputField label="Ciudad *" value={form.ciudad} onChange={(v) => updateField("ciudad", v)} error={errors.ciudad} placeholder="Quito" />
                  </div>
                  
                  {/* Talla */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Talla de Camiseta *</label>
                    <div className="grid grid-cols-4 gap-3">
                      {TALLAS.map((t) => (
                        <button key={t} type="button" onClick={() => updateField("talla", t)}
                          className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${form.talla === t ? "border-[#8CC541] bg-[#8CC541]/10 text-[#8CC541]" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                    {errors.talla && <p className="text-red-500 text-xs mt-1">{errors.talla}</p>}
                  </div>
                  
                  <div className="pt-4">
                    <button type="submit" className="w-full bg-[#C800A1] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#a00081] transition-all shadow-md active:scale-[0.98]">
                      Continuar a Políticas
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* FASE 2: POLÍTICAS */}
        {fase >= 2 && (
          <section ref={politicasSectionRef} className="w-full px-4 pt-12 relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-xl relative z-10">
                <h2 className="text-2xl font-bold text-[#2F3388] mb-2">Deslinde de Responsabilidad</h2>
                <p className="text-gray-500 text-sm mb-6">Lee cuidadosamente y acepta los términos para continuar.</p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 max-h-[300px] overflow-y-auto text-gray-700 text-sm leading-relaxed whitespace-pre-line mb-6 shadow-inner">
                  {politicasTexto || "Cargando políticas..."}
                </div>
                
                <label className="flex items-start gap-4 cursor-pointer group mb-8 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                  <div className="relative mt-1">
                    <input type="checkbox" checked={aceptoPoliticas} onChange={(e) => setAceptoPoliticas(e.target.checked)} className="sr-only" />
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${aceptoPoliticas ? "bg-[#8CC541] border-[#8CC541]" : "border-gray-300 bg-white group-hover:border-gray-400"}`}>
                      {aceptoPoliticas && (<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>)}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 font-medium leading-relaxed">
                    Acepto los <strong className="text-[#2F3388]">términos y condiciones</strong> del deslinde de responsabilidad para participar en la Ruta Contra El Hambre — 6ta Edición 2026.
                  </span>
                </label>
                
                <div className="flex gap-4">
                  <button type="button" onClick={() => { setFase(1); scrollToSection(formSectionRef); }} className="w-1/3 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-all">Atrás</button>
                  <button type="button" onClick={handlePoliticasSubmit} disabled={!aceptoPoliticas}
                    className={`w-2/3 py-3 rounded-xl font-bold text-lg transition-all shadow-md ${aceptoPoliticas ? "bg-[#C800A1] text-white hover:bg-[#a00081] active:scale-[0.98]" : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"}`}>
                    Continuar al Pago
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FASE 3: RESUMEN + PAGO */}
        {fase >= 3 && (
          <section ref={pagoSectionRef} className="w-full px-4 pt-12 relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-xl relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#2F3388]/10 p-3 rounded-xl">
                    <svg className="w-6 h-6 text-[#2F3388]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#2F3388]">Resumen y Pago</h2>
                    <p className="text-gray-500 text-sm">Verifica tus datos antes de proceder.</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 space-y-3 text-sm">
                  <SummaryRow label="Nombre" value={`${form.nombres} ${form.apellidos}`} />
                  <SummaryRow label="Cédula" value={form.cedula} />
                  <SummaryRow label="Email" value={form.correoElectronico} />
                  <SummaryRow label="Teléfono" value={form.telefonoMovil} />
                  <SummaryRow label="Categoría" value={categoria} highlight />
                  <SummaryRow label="Distancia" value={form.distancia} highlightOrange />
                  <SummaryRow label="Talla" value={form.talla} highlightGreen />
                  <div className="border-t border-blue-200 pt-3 mt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-700 uppercase">Total a Pagar</span>
                    <span className="font-black text-2xl text-[#C800A1]">${MONTO} USD</span>
                  </div>
                </div>

                <button onClick={handlePay} disabled={status === "loading" || status === "processing" || !sdkReady}
                  className={`w-full py-4 rounded-xl font-bold text-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${status === "loading" || status === "processing" ? "bg-gray-400 text-white cursor-not-allowed" : !sdkReady ? "bg-gray-300 text-gray-600 cursor-wait" : "bg-[#C800A1] text-white hover:bg-[#a00081]"}`}>
                  {!sdkReady ? "Cargando procesador..." : status === "loading" ? "Registrando datos..." : status === "processing" ? "Abriendo pago..." : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      Pagar ${MONTO} USD
                    </>
                  )}
                </button>
                
                {message && !txResult && (
                  <div className={`mt-4 p-4 rounded-xl text-sm w-full text-center font-medium ${status === "processing" || status === "loading" ? "bg-blue-50 text-blue-700 border border-blue-200" : status === "error" ? "bg-red-50 text-red-700 border border-red-200" : ""}`}>
                    {message}
                  </div>
                )}
                
                <div className="mt-8 text-center">
                  <button type="button" onClick={() => { setFase(2); scrollToSection(politicasSectionRef); }} className="text-gray-500 hover:text-gray-700 transition text-sm font-semibold underline">← Revisar Políticas</button>
                </div>
              </div>
            </div>
          </section>
        )}
        </div>
      </div>

      {/* MODAL DE RESULTADO */}
      {txResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-300">
            <div className={`h-3 w-full ${txResult.status === "success" ? "bg-[#8CC541]" : "bg-red-500"}`} />
            <div className="p-8 text-center flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${txResult.status === "success" ? "bg-green-50 text-[#8CC541]" : "bg-red-50 text-red-500"}`}>
                {txResult.status === "success" ? (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${txResult.status === "success" ? "text-[#2F3388]" : "text-red-600"}`}>{txResult.title}</h3>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">{txResult.message}</p>
              <div className="w-full">
                {txResult.status === "success" ? (
                  <button onClick={() => router.push("/thank-you")} className="w-full py-4 px-6 bg-[#C800A1] hover:bg-[#a00081] text-white text-lg font-bold rounded-xl transition-all shadow-md active:scale-95">Finalizar</button>
                ) : (
                  <button onClick={() => setTxResult(null)} className="w-full py-4 px-6 bg-gray-800 hover:bg-gray-900 text-white text-lg font-bold rounded-xl transition-all active:scale-95">Intentar con otra tarjeta</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Componentes auxiliares ────────────────────────────────────────────────

function InputField({ label, value, onChange, error, placeholder, type = "text" }: {
  label: string; value: string; onChange: (value: string) => void; error?: string; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C800A1] focus:border-transparent transition text-gray-800 placeholder-gray-400 ${error ? "border-red-500 bg-red-50" : "border-gray-300"}`} />
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value, highlight, highlightOrange, highlightGreen }: { label: string; value: string; highlight?: boolean; highlightOrange?: boolean; highlightGreen?: boolean }) {
  let valClass = "text-gray-800 font-bold";
  if (highlight) valClass = "text-[#C800A1] font-bold";
  if (highlightOrange) valClass = "text-[#ED6F1D] font-bold";
  if (highlightGreen) valClass = "text-[#8CC541] font-bold";

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className={valClass}>{value}</span>
    </div>
  );
}

// ── Export ──────────────────────────────────────────────────────────────────

export default function NuveiPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#C800A1] border-opacity-50 mx-auto mb-4" />
          <p className="text-[#C800A1] font-bold">Cargando...</p>
        </div>
      </div>
    }>
      {/* Ocultar Header y Footer globalmente para esta página */}
      <style dangerouslySetInnerHTML={{ __html: `
        header, footer { display: none !important; }
      `}} />
      <NuveiPageContent />
    </Suspense>
  );
}
