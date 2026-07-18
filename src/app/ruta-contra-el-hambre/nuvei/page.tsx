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

interface ParticipantForm {
  cedula: string;
  nombres: string;
  apellidos: string;
  genero: string;
  telefonoMovil: string;
  fechaNacimiento: string;
  correoElectronico: string;
  pais: string;
  ciudad: string;
  talla: string;
  distancia: string;
}

// ── Constantes ──────────────────────────────────────────────────────────────

const PRECIO_INDIVIDUAL = 35; // Precio base mostrado en la UI
const PRECIO_GRUPAL = 30; // Precio base mostrado en la UI
const MIN_GRUPO = 5;

const CATEGORIAS = [
  { label: "Jóvenes Activos [18 a 34 años]", minAge: 18, maxAge: 34 },
  { label: "Adultos en movimiento [35 a 45 años]", minAge: 35, maxAge: 45 },
  { label: "Adultos Mayores en acción [46 años en adelante]", minAge: 46, maxAge: 200 },
];

const TALLAS = ["S", "M", "L", "XL"];
const DISTANCIAS = ["5 Km", "10 Km"];
const GENEROS = ["Masculino", "Femenino", "Otro"];

const PUNTOS_RETIRO = [
  {
    nombre: "DISRUPTIVE - Centro de Innovación",
    fecha: "Jueves 13, viernes 14 de agosto 2026 — 10:00 a 17:00",
    direccion: "Edificio Torres de Almagro oficina 42 C planta baja",
    zona: "Norte",
    mapsUrl: "https://maps.app.goo.gl/mxz7o9xBqp2Nr15w5?g_st=ic",
  },
  {
    nombre: "KAO SPORT CAROLINA",
    fecha: "Jueves 13, viernes 14 de agosto 2026 — 10:00 a 17:00",
    direccion: "Av Eloy Alfaro y Av República. Edificio EPIQ",
    zona: "Norte",
    mapsUrl: "https://maps.app.goo.gl/cYraBXD99u6izzSx6?g_st=ic",
  },
  {
    nombre: "BANCO DE ALIMENTOS QUITO",
    fecha: "Jueves 13, viernes 14 de agosto 2026 — 10:00 a 18:00",
    direccion: "Pedro Vicente Maldonado y Balzar (Metalmecanica San Bartolo de la EPN)",
    zona: "Sur de Quito",
    mapsUrl: "https://maps.app.goo.gl/8XCQ74KXJfGBSzEy7?g_st=ic",
  },
  {
    nombre: "PARQUE METROPOLITANO GUANGÜILTAGUA",
    fecha: "Sábado 15 de agosto 2026 (Día del Evento) — 6:30 a 7:30 am",
    direccion: "En el punto de partida",
    zona: "Día del Evento",
    mapsUrl: "https://maps.app.goo.gl/zJztJef4yZSispcCA?g_st=ic",
  },
];

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

const emptyParticipant = (): ParticipantForm => ({
  cedula: "",
  nombres: "",
  apellidos: "",
  genero: "",
  telefonoMovil: "",
  fechaNacimiento: "",
  correoElectronico: "",
  pais: "Ecuador",
  ciudad: "",
  talla: "",
  distancia: "",
});

// ── Componente principal ────────────────────────────────────────────────────

function NuveiPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fases: 0=landing, 1=formulario, 2=politicas, 3=pago
  const [fase, setFase] = useState(0);
  // Modalidad: "individual" | "grupal"
  const [modalidad, setModalidad] = useState<"individual" | "grupal">("individual");

  // Formulario líder (individual o líder del grupo)
  const [form, setForm] = useState<ParticipantForm>({
    ...emptyParticipant(),
    correoElectronico: searchParams.get("email") || "",
  });

  // Índice para el carrusel grupal (0 = Líder, 1 = Int 2, etc.)
  const [grupoIndex, setGrupoIndex] = useState(0);

  // Método de pago: "tarjeta" | "transferencia"
  const [metodoPago, setMetodoPago] = useState<"tarjeta" | "transferencia">("tarjeta");
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);

  // Integrantes del grupo (sin incluir al líder)
  const [integrantes, setIntegrantes] = useState<ParticipantForm[]>(() => {
    return Array.from({ length: MIN_GRUPO - 1 }, () => emptyParticipant());
  });

  // Punto de retiro de kit
  const [puntoRetiro, setPuntoRetiro] = useState("");

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

  // Cálculos
  const totalPersonas = modalidad === "grupal" ? 1 + integrantes.length : 1;
  const precioUnitario = modalidad === "grupal" && totalPersonas >= MIN_GRUPO 
    ? (metodoPago === "transferencia" ? 30 : 31.63) 
    : (metodoPago === "transferencia" ? 35 : 36.63);
  const totalPagar = Number((totalPersonas * precioUnitario).toFixed(2));

  // Cargar políticas
  useEffect(() => {
    fetch("/carrera/politicas.md")
      .then((res) => res.text())
      .then((text) => setPoliticasTexto(text))
      .catch(() => setPoliticasTexto("No se pudieron cargar las políticas."));
  }, []);

  // Auto-calcular edad y categoría del líder
  useEffect(() => {
    if (form.fechaNacimiento) {
      const ed = calcularEdad(form.fechaNacimiento);
      setEdad(ed);
      setCategoria(obtenerCategoria(ed));
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
            setTxResult({ status: "error", title: "Error de Conexión", message: response.error.description || "No se pudo comunicar con el procesador de pagos." });
            return;
          }
          const tx = response.transaction;
          if (!tx) return;
          if (tx.status === "success" && tx.status_detail === 3) {
            setStatus("success");
            setTxResult({ status: "success", title: "¡Inscripción Exitosa!", message: "Tu pago fue aprobado exitosamente. ¡Gracias por inscribirte en la Ruta Contra El Hambre!", txId: tx.id });
          } else {
            setStatus("error");
            setTxResult({ status: "error", title: "Pago Rechazado", message: tx.message || `No se pudo procesar la tarjeta. Intenta con otra. (Código: ${tx.status_detail})`, txId: tx.id });
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

  // Scroll suave
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Validar un participante
  const validarParticipante = (p: ParticipantForm, prefix: string): Record<string, string> => {
    const err: Record<string, string> = {};
    if (!p.distancia) err[`${prefix}distancia`] = "Selecciona una distancia";
    if (!p.cedula.trim()) err[`${prefix}cedula`] = "La cédula es requerida";
    if (!p.nombres.trim()) err[`${prefix}nombres`] = "Los nombres son requeridos";
    if (!p.apellidos.trim()) err[`${prefix}apellidos`] = "Los apellidos son requeridos";
    if (!p.genero) err[`${prefix}genero`] = "Selecciona un género";
    if (!p.telefonoMovil.trim()) err[`${prefix}telefonoMovil`] = "El teléfono es requerido";
    if (!p.fechaNacimiento) err[`${prefix}fechaNacimiento`] = "La fecha de nacimiento es requerida";
    else {
      const ed = calcularEdad(p.fechaNacimiento);
      if (ed < 18) err[`${prefix}fechaNacimiento`] = "Debe ser mayor de 18 años";
      if (!obtenerCategoria(ed)) err[`${prefix}fechaNacimiento`] = "Edad fuera de categoría";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!p.correoElectronico.trim()) err[`${prefix}correoElectronico`] = "El correo es requerido";
    else if (!emailRegex.test(p.correoElectronico)) err[`${prefix}correoElectronico`] = "Correo inválido";
    if (!p.ciudad.trim()) err[`${prefix}ciudad`] = "La ciudad es requerida";
    if (!p.talla) err[`${prefix}talla`] = "Selecciona una talla";
    return err;
  };

  // Avanzar desde Fase 1 (Opciones) a Fase 2 (Datos)
  const handleContinuarOpciones = () => {
    setFase(2);
    setGrupoIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Validar paso actual (Datos - Fase 2)
  const validarPasoActual = (): boolean => {
    let currentErrors: Record<string, string> = {};
    const isLider = modalidad === "individual" || grupoIndex === 0;

    if (isLider) {
      currentErrors = { ...validarParticipante(form, "") };
    } else {
      currentErrors = { ...validarParticipante(integrantes[grupoIndex - 1], `int${grupoIndex - 1}_`) };
    }

    const newErrors = { ...errors };
    const prefix = isLider ? "" : `int${grupoIndex - 1}_`;

    // Clear old errors for the current step
    Object.keys(newErrors).forEach(k => {
      if (prefix === "") {
        if (!k.startsWith("int") && k !== "puntoRetiro" && k !== "comprobante") delete newErrors[k];
      } else {
        if (k.startsWith(prefix)) delete newErrors[k];
      }
    });

    const combined = { ...newErrors, ...currentErrors };
    setErrors(combined);
    return Object.keys(currentErrors).length === 0;
  };

  // Avanzar desde Fase 2 (Datos)
  const handleSiguienteDatos = (e: React.FormEvent) => {
    e.preventDefault();
    if (validarPasoActual()) {
      if (modalidad === "individual" || grupoIndex === integrantes.length) {
        setFase(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setGrupoIndex(grupoIndex + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Retroceder desde Fase 2 (Datos)
  const handleAnteriorDatos = () => {
    if (grupoIndex > 0) {
      setGrupoIndex(grupoIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setFase(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Avanzar desde Fase 3 (Kit) a Fase 4 (Políticas)
  const handleContinuarKit = () => {
    if (!puntoRetiro) {
      setErrors((prev) => ({ ...prev, puntoRetiro: "Selecciona un punto de retiro" }));
      return;
    }
    setFase(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manejar aceptación de políticas (Fase 4 a 5)
  const handlePoliticasSubmit = () => {
    setFase(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagar
  const handlePay = async () => {
    if (metodoPago === "tarjeta" && !checkoutInstance) {
      setStatus("error");
      setMessage("El procesador de pagos aún no está listo.");
      return;
    }
    if (metodoPago === "transferencia" && !comprobanteFile) {
      setStatus("error");
      setMessage("Por favor sube la foto de tu comprobante de transferencia.");
      return;
    }

    setStatus("loading");
    setMessage(metodoPago === "transferencia" ? "Subiendo comprobante y registrando..." : "Registrando datos y preparando el pago...");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      let devRef: string;

      // Convertir archivo a base64 si es transferencia
      let base64Comprobante = "";
      if (metodoPago === "transferencia" && comprobanteFile) {
        base64Comprobante = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(comprobanteFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      }

      if (modalidad === "grupal") {
        // GRUPAL: registrar todos los integrantes juntos
        const allParticipants = [form, ...integrantes].map((p) => ({
          cedula: p.cedula,
          nombres: p.nombres,
          apellidos: p.apellidos,
          genero: p.genero,
          telefonoMovil: p.telefonoMovil,
          fechaNacimiento: p.fechaNacimiento,
          edad: calcularEdad(p.fechaNacimiento),
          correoElectronico: p.correoElectronico,
          pais: p.pais || "Ecuador",
          ciudad: p.ciudad,
          categoria: obtenerCategoria(calcularEdad(p.fechaNacimiento)),
          talla: p.talla,
          distancia: p.distancia,
        }));

        const registerRes = await fetch(`${apiUrl}/nuvei/registrar-grupo-carrera`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            puntoRetiroKit: puntoRetiro,
            metodoPago,
            comprobanteBase64: base64Comprobante,
            integrantes: allParticipants,
          }),
        });

        if (!registerRes.ok) {
          const errorData = await registerRes.json().catch(() => ({}));
          throw new Error(errorData.error || "Error al registrar grupo");
        }

        const registerData = await registerRes.json();
        devRef = registerData.devReference;
      } else {
        // INDIVIDUAL
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
            puntoRetiroKit: puntoRetiro,
            metodoPago,
            comprobanteBase64: base64Comprobante,
          }),
        });

        if (!registerRes.ok) {
          const errorData = await registerRes.json().catch(() => ({}));
          throw new Error(errorData.error || "Error al registrar participante");
        }

        const registerData = await registerRes.json();
        devRef = registerData.devReference;
      }

      // Si es transferencia, terminamos aquí sin llamar a Nuvei
      if (metodoPago === "transferencia") {
        setTxResult({ 
          status: "success", 
          title: "¡Inscripción Recibida!", 
          message: "Hemos recibido los datos de tu inscripción y tu comprobante. Lo verificaremos y te notificaremos pronto.", 
          txId: devRef 
        });
        return;
      }

      // 2. Inicializar referencia de pago con Nuvei
      setStatus("processing");
      setMessage("Abriendo ventana de pago...");

      const initRes = await fetch(`${apiUrl}/nuvei/init-carrera`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: fallbackUserId,
          userEmail: form.correoElectronico,
          amount: totalPagar,
          devReference: devRef,
          description: modalidad === "grupal"
            ? `Ruta Contra El Hambre - Grupal (${totalPersonas} personas)`
            : "Ruta Contra El Hambre - 6ta Edicion",
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

  const updateIntegrante = (index: number, field: string, value: string) => {
    setIntegrantes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    const key = `int${index}_${field}`;
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const addIntegrante = () => {
    setIntegrantes((prev) => [...prev, emptyParticipant()]);
  };

  const removeIntegrante = (index: number) => {
    if (integrantes.length <= MIN_GRUPO - 1) return; // No permitir menos de 4 extras (5 total)
    setIntegrantes((prev) => prev.filter((_, i) => i !== index));
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

      <div className="w-full min-h-screen relative bg-[#1a0f30] overflow-x-hidden">

        {/* IMAGEN DE FONDO RESPONSIVE - Escala con el ancho de la pantalla sin recortarse */}
        <picture className="absolute top-0 left-0 w-full z-0 pointer-events-none">
          <source media="(min-width: 768px)" srcSet="/carrera/LANDING.png" />
          <img
            src="/carrera/LANDING-CARRERA.jpg.jpeg"
            alt="Ruta Contra El Hambre"
            className="w-full h-auto"
          />
        </picture>

        {/* CONTENIDO SUPERPUESTO */}
        <div className="relative z-10 flex flex-col items-center pt-4 md:pt-6 pb-12 w-full min-h-screen">

          {/* STEPPER GLOBAL (Visible desde Fase 1 en adelante) */}
          {fase >= 1 && (
            <div className="w-full max-w-3xl px-4 mx-auto relative z-20 animate-in fade-in duration-500 mb-4">
              <div className="flex items-center justify-center gap-1 md:gap-3 bg-white/90 backdrop-blur-md py-2 px-2 md:px-6 rounded-2xl shadow-sm border border-gray-100">
                {["Opciones", "Datos", "Kit", "Políticas", "Pago"].map((step, i) => (
                  <React.Fragment key={step}>
                    <div className={`flex flex-col items-center gap-1 ${fase > i + 1 ? "text-green-600" : fase === i + 1 ? "text-[#C800A1]" : "text-gray-400"}`}>
                      <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border-2 transition-all ${fase > i + 1 ? "border-green-600 bg-green-50 text-green-600" : fase === i + 1 ? "border-[#C800A1] bg-[#C800A1]/10 text-[#C800A1]" : "border-gray-300 text-gray-400"}`}>
                        {fase > i + 1 ? "✓" : i + 1}
                      </div>
                      <span className="text-[10px] md:text-xs font-semibold">{step}</span>
                    </div>
                    {i < 4 && <div className={`flex-1 h-0.5 min-w-[15px] md:min-w-[30px] max-w-[50px] -mt-5 ${fase > i + 1 ? "bg-green-600" : "bg-gray-300"}`} />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* FASE 0: LANDING HERO */}
          {fase === 0 && (
            <section className="w-full flex flex-col items-center justify-start pt-[50vw] md:pt-[30vw] lg:pt-[20vw] pb-20 relative z-10">
              <div className="bg-white/90 backdrop-blur-sm shadow-xl p-8 rounded-3xl text-center max-w-lg mx-auto border border-gray-100">
                <h1 className="text-3xl md:text-4xl font-bold text-[#2F3388] mb-4">
                  Ruta contra el Hambre 2026
                </h1>
                <p className="text-gray-600 mb-6 text-lg">
                  Dona a la carrera y corre por una buena causa.
                </p>

                <div className="flex justify-center gap-4 mb-6">
                  <div className="bg-gray-100 px-4 py-2 rounded-xl text-center shadow-sm relative group">
                    <div className="text-xs text-gray-500 uppercase font-semibold flex items-center justify-center gap-1 cursor-help">
                      Individual
                      <svg className="w-4 h-4 text-red-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div className="font-bold text-[#C800A1] text-xl">${PRECIO_INDIVIDUAL}</div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-gray-800 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl pointer-events-none">
                      <div className="font-bold mb-2 border-b border-gray-600 pb-1 text-center">Precios Finales</div>
                      <div className="flex justify-between mb-1"><span>Transferencia:</span> <span className="font-semibold text-green-400">$35.00</span></div>
                      <div className="flex justify-between"><span>Tarjeta Débito/Crédito:</span> <span>$36.63</span></div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                  <div className="bg-gray-100 px-4 py-2 rounded-xl text-center shadow-sm relative group">
                    <div className="text-xs text-gray-500 uppercase font-semibold flex items-center justify-center gap-1 cursor-help">
                      Grupal (5+)
                      <svg className="w-4 h-4 text-red-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div className="font-bold text-[#8CC541] text-xl">${PRECIO_GRUPAL}/c.u.</div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-gray-800 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl pointer-events-none">
                      <div className="font-bold mb-2 border-b border-gray-600 pb-1 text-center">Precios Finales (c.u.)</div>
                      <div className="flex justify-between mb-1"><span>Transferencia:</span> <span className="font-semibold text-green-400">$30.00</span></div>
                      <div className="flex justify-between"><span>Tarjeta Débito/Crédito:</span> <span>$31.63</span></div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                  <div className="bg-gray-100 px-4 py-2 rounded-xl text-center shadow-sm flex flex-col justify-center">
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

          {/* FASE 1: OPCIONES BÁSICAS */}
          {fase === 1 && (
            <section className="w-full px-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-xl">
                <h2 className="text-2xl font-bold text-[#2F3388] mb-6 text-center">Paso 1: Opciones de Inscripción</h2>
                
                {/* Selector Método de Pago */}
                <div className="mb-8 border-b border-gray-200 pb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Método de Pago</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button type="button" onClick={() => setMetodoPago("tarjeta")}
                      className={`py-4 px-4 rounded-xl border-2 font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${metodoPago === "tarjeta" ? "border-[#C800A1] bg-[#C800A1]/10 text-[#C800A1]" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"}`}>
                      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      <div className="text-lg">Tarjeta (Crédito/Débito)</div>
                    </button>
                    <button type="button" onClick={() => setMetodoPago("transferencia")}
                      className={`py-4 px-4 rounded-xl border-2 font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${metodoPago === "transferencia" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"}`}>
                      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                      <div className="text-lg">Transferencia Bancaria</div>
                    </button>
                  </div>
                  {metodoPago === "transferencia" && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5 text-sm text-green-900 animate-in fade-in slide-in-from-top-2 duration-300">
                      <h4 className="font-bold text-green-800 mb-3 uppercase tracking-wider text-xs">Datos para Depósito o Transferencia</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mb-4">
                        <p><span className="font-bold">Nombre:</span> Fundación de Ayuda Social Banco de Alimentos Quito</p>
                        <p><span className="font-bold">RUC:</span> 1791921429001</p>
                        <p><span className="font-bold">Número de cuenta:</span> 2100282580</p>
                        <p><span className="font-bold">Tipo de cuenta:</span> Cta. Corriente</p>
                        <p className="md:col-span-2"><span className="font-bold">Correo:</span> administracion@baq.ec</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selector Individual / Grupal */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Tipo de Inscripción</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => { setModalidad("individual"); setFase(1); setGrupoIndex(0); }}
                      className={`py-4 px-4 rounded-xl border-2 font-bold transition-all text-center ${modalidad === "individual" ? "border-[#C800A1] bg-[#C800A1]/10 text-[#C800A1]" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"}`}>
                      <div className="text-lg">Individual</div>
                      <div className="text-xs mt-1 font-normal opacity-90 flex items-center justify-center gap-1 group relative cursor-help">
                        <span>${PRECIO_INDIVIDUAL} USD por persona</span>
                        {metodoPago !== "transferencia" && (
                          <>
                            <svg className="w-4 h-4 text-red-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl pointer-events-none font-medium">
                              Con tarjeta de crédito/débito el precio es de $36.63 (incluye comisión).
                            </div>
                          </>
                        )}
                      </div>
                    </button>
                    <button type="button" onClick={() => { setModalidad("grupal"); setFase(1); setGrupoIndex(0); }}
                      className={`py-4 px-4 rounded-xl border-2 font-bold transition-all text-center ${modalidad === "grupal" ? "border-[#8CC541] bg-[#8CC541]/10 text-[#8CC541]" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"}`}>
                      <div className="text-lg">Grupal (5+)</div>
                      <div className="text-xs mt-1 font-normal opacity-90 flex items-center justify-center gap-1 group relative cursor-help">
                        <span>${PRECIO_GRUPAL} USD por persona</span>
                        {metodoPago !== "transferencia" && (
                          <>
                            <svg className="w-4 h-4 text-red-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl pointer-events-none font-medium">
                              Con tarjeta de crédito/débito el precio es de $31.63 (incluye comisión).
                            </div>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button type="button" onClick={handleContinuarOpciones}
                    className="w-full bg-[#C800A1] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#a00081] transition-all shadow-md active:scale-[0.98]">
                    Continuar a Datos
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* FASE 2: DATOS PERSONALES */}
          {fase === 2 && (
            <section ref={formSectionRef} className="w-full px-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-xl">
                <form onSubmit={handleSiguienteDatos} className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#2F3388]">
                      {modalidad === "individual" ? "Paso 2: Datos de Inscripción" : (grupoIndex === 0 ? "Paso 2: Datos del Líder" : `Integrante ${grupoIndex + 1}`)}
                    </h2>
                    {modalidad === "grupal" && (
                      <div className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Paso {grupoIndex + 1} de {totalPersonas}
                      </div>
                    )}
                  </div>
                  {grupoIndex === 0 && (
                    <p className="text-gray-500 text-sm mb-8 -mt-4">Completa todos los campos para registrarte en la carrera.</p>
                  )}

                  {/* Contenido del Formulario */}
                  {(modalidad === "individual" || grupoIndex === 0) ? (
                    <ParticipantFormFields
                      form={form}
                      updateField={updateField}
                      errors={errors}
                      prefix=""
                      edad={edad}
                      categoria={categoria}
                    />
                  ) : (
                    <div className="bg-gray-50/50 p-2 md:p-6 rounded-2xl border border-gray-100">
                      <ParticipantFormFields
                        form={integrantes[grupoIndex - 1]}
                        updateField={(field, value) => updateIntegrante(grupoIndex - 1, field, value)}
                        errors={errors}
                        prefix={`int${grupoIndex - 1}_`}
                      />
                    </div>
                  )}

                  {/* Resumen Total y Botón Agregar (solo Grupal) */}
                  {modalidad === "grupal" && (
                    <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
                      {grupoIndex > 0 && grupoIndex === integrantes.length && (
                        <div className="mb-4 space-y-2">
                          <button type="button" onClick={addIntegrante}
                            className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#8CC541] text-[#8CC541] font-bold hover:bg-[#8CC541]/10 transition-all shadow-sm">
                            + Agregar otro integrante al grupo
                          </button>
                          {integrantes.length > MIN_GRUPO - 1 && (
                            <button type="button" onClick={() => {
                              removeIntegrante(grupoIndex - 1);
                              setGrupoIndex(grupoIndex - 1);
                            }}
                              className="w-full py-2 rounded-xl text-red-500 font-bold hover:bg-red-50 transition-all text-sm">
                              Eliminar integrante actual
                            </button>
                          )}
                        </div>
                      )}
                      <div className="bg-[#8CC541]/10 border border-[#8CC541]/30 rounded-xl p-3 flex items-center justify-between mb-4 shadow-sm">
                        <div className="text-sm font-semibold text-gray-700">Total del Grupo:</div>
                        <div className="font-black text-xl text-[#8CC541]">{totalPersonas} personas = ${totalPagar} USD</div>
                      </div>
                    </div>
                  )}

                  {/* Botones de Navegación Fase 2 */}
                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={handleAnteriorDatos}
                      className="w-1/3 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all shadow-sm border border-gray-200">
                      Anterior
                    </button>
                    <button type="submit"
                      className="w-2/3 bg-[#C800A1] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#a00081] transition-all shadow-md active:scale-[0.98]">
                      {modalidad === "grupal" && grupoIndex < integrantes.length ? `Siguiente Integrante` : "Continuar a Kit"}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {/* FASE 3: PUNTO DE RETIRO DE KIT */}
          {fase === 3 && (
            <section className="w-full px-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-xl">
                <h2 className="text-2xl font-bold text-[#2F3388] mb-6">Paso 3: Punto de Retiro de Kit</h2>
                <p className="text-gray-500 text-sm mb-6">Selecciona dónde retirarás el kit de participación {modalidad === "grupal" && "para todo tu grupo"}.</p>
                
                <div className="space-y-3">
                  {PUNTOS_RETIRO.map((punto) => (
                    <div key={punto.nombre}
                      onClick={() => { setPuntoRetiro(punto.nombre); if (errors.puntoRetiro) setErrors((prev) => ({ ...prev, puntoRetiro: "" })); }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${puntoRetiro === punto.nombre ? "border-[#2F3388] bg-[#2F3388]/5" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className={`font-bold text-sm ${puntoRetiro === punto.nombre ? "text-[#2F3388]" : "text-gray-700"}`}>{punto.nombre}</div>
                          <div className="text-xs text-gray-500 mt-1">{punto.fecha}</div>
                          <div className="text-xs text-gray-500">{punto.direccion}</div>
                          <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${punto.zona === "Día del Evento" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>{punto.zona}</span>
                        </div>
                        <a href={punto.mapsUrl} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="ml-3 text-xs text-blue-600 hover:text-blue-800 underline font-semibold shrink-0 flex items-center gap-1">
                          Ver Mapa
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.puntoRetiro && <p className="text-red-500 text-xs mt-1 font-medium">{errors.puntoRetiro}</p>}

                <div className="flex gap-4 pt-4 mt-8 border-t border-gray-100">
                  <button type="button" onClick={() => { setFase(2); if(modalidad==="grupal") setGrupoIndex(integrantes.length); }}
                    className="w-1/3 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all shadow-sm border border-gray-200">
                    Anterior
                  </button>
                  <button type="button" onClick={handleContinuarKit}
                    className="w-2/3 bg-[#C800A1] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#a00081] transition-all shadow-md active:scale-[0.98]">
                    Continuar a Políticas
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* FASE 4: POLÍTICAS */}
          {fase === 4 && (
            <section ref={politicasSectionRef} className="w-full px-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-3xl mx-auto">
                <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-xl relative z-10">
                  <h2 className="text-2xl font-bold text-[#2F3388] mb-2">Paso 4: Deslinde de Responsabilidad</h2>
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
                      {modalidad === "grupal"
                        ? <>Acepto los <strong className="text-[#2F3388]">términos y condiciones</strong> del deslinde de responsabilidad para todos los integrantes del grupo en la Ruta Contra El Hambre — 6ta Edición 2026.</>
                        : <>Acepto los <strong className="text-[#2F3388]">términos y condiciones</strong> del deslinde de responsabilidad para participar en la Ruta Contra El Hambre — 6ta Edición 2026.</>
                      }
                    </span>
                  </label>

                  <div className="flex gap-4">
                    <button type="button" onClick={() => { setFase(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-1/3 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-all">Atrás</button>
                    <button type="button" onClick={handlePoliticasSubmit} disabled={!aceptoPoliticas}
                      className={`w-2/3 py-3 rounded-xl font-bold text-lg transition-all shadow-md ${aceptoPoliticas ? "bg-[#C800A1] text-white hover:bg-[#a00081] active:scale-[0.98]" : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"}`}>
                      Continuar al Pago
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* FASE 5: RESUMEN + PAGO */}
          {fase === 5 && (
            <section ref={pagoSectionRef} className="w-full px-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-5xl mx-auto">
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

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* COLUMNA IZQUIERDA: Resumen de Datos */}
                    <div>
                      {/* Resumen del líder */}
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4 space-y-3 text-sm">
                        <div className="text-xs font-bold text-[#2F3388] uppercase mb-2">{modalidad === "grupal" ? "Líder del Grupo" : "Participante"}</div>
                        <SummaryRow label="Nombre" value={`${form.nombres} ${form.apellidos}`} />
                        <SummaryRow label="Cédula" value={form.cedula} />
                        <SummaryRow label="Email" value={form.correoElectronico} />
                        <SummaryRow label="Categoría" value={categoria} highlight />
                        <SummaryRow label="Distancia" value={form.distancia} highlightOrange />
                        <SummaryRow label="Talla" value={form.talla} highlightGreen />
                      </div>

                      {/* Resumen integrantes (grupal) */}
                      {modalidad === "grupal" && integrantes.length > 0 && (
                        <div className="mb-4">
                          <div className="flex overflow-x-auto snap-x space-x-3 pb-3 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {integrantes.map((p, i) => (
                              <div key={i} className="min-w-[240px] shrink-0 snap-start bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2 text-sm">
                                <div className="text-xs font-bold text-[#2F3388] uppercase">Integrante {i + 2}</div>
                                <SummaryRow label="Nombre" value={p.nombres ? `${p.nombres} ${p.apellidos}` : "Pendiente"} />
                                <SummaryRow label="Cédula" value={p.cedula || "-"} />
                                <SummaryRow label="Distancia" value={p.distancia || "-"} highlightOrange />
                                <SummaryRow label="Talla" value={p.talla || "-"} highlightGreen />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Punto retiro */}
                      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-sm">
                        <SummaryRow label="Punto de Retiro" value={puntoRetiro} highlight />
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: Pago y Envío */}
                    <div className="flex flex-col h-full justify-center">
                      {/* Subida del Comprobante (Movido a Fase 5) */}
                      {metodoPago === "transferencia" && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
                          <label className="block font-bold text-green-900 mb-2">Comprobante de Transferencia / Depósito *</label>
                          <p className="text-xs text-green-700 mb-3">Sube la foto o captura de pantalla de tu comprobante. Formatos: JPG, PNG, PDF (máx. 5MB).</p>
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-green-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-green-50 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-3 pb-3">
                                <svg className="w-6 h-6 mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                <p className="mb-1 text-xs text-gray-500"><span className="font-semibold text-green-600">Haz clic para subir</span> o arrastra y suelta</p>
                                <p className="text-xs font-bold text-gray-700 max-w-[200px] truncate">{comprobanteFile ? comprobanteFile.name : "Ningún archivo seleccionado"}</p>
                              </div>
                              <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => {
                                setComprobanteFile(e.target.files?.[0] || null);
                                if (errors.comprobante) setErrors((prev) => ({ ...prev, comprobante: "" }));
                              }} />
                            </label>
                          </div>
                          {errors.comprobante && <p className="text-red-500 text-xs mt-2 font-medium text-center">{errors.comprobante}</p>}
                        </div>
                      )}

                      {/* Total */}
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold text-gray-700 uppercase text-sm">Total a Pagar</span>
                            {modalidad === "grupal" && <div className="text-xs text-gray-500">{totalPersonas} personas × ${precioUnitario}</div>}
                          </div>
                          <span className="font-black text-2xl text-[#C800A1]">${totalPagar} USD</span>
                        </div>
                      </div>

                      <button onClick={handlePay} disabled={status === "loading" || status === "processing" || (metodoPago === "tarjeta" && !sdkReady) || (metodoPago === "transferencia" && !comprobanteFile)}
                        className={`w-full py-4 rounded-xl font-bold text-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${status === "loading" || status === "processing" ? "bg-gray-400 text-white cursor-not-allowed" : ((metodoPago === "tarjeta" && !sdkReady) || (metodoPago === "transferencia" && !comprobanteFile)) ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-[#C800A1] text-white hover:bg-[#a00081]"}`}>
                        {metodoPago === "tarjeta" && !sdkReady ? "Cargando procesador..." : status === "loading" ? "Registrando datos..." : status === "processing" ? "Procesando..." : (
                          <>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={metodoPago === "transferencia" ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"} /></svg>
                            {metodoPago === "transferencia" ? "Finalizar Registro" : `Pagar $${totalPagar} USD`}
                          </>
                        )}
                      </button>

                      {message && !txResult && (
                        <div className={`mt-4 p-4 rounded-xl text-sm w-full text-center font-medium ${status === "processing" || status === "loading" ? "bg-blue-50 text-blue-700 border border-blue-200" : status === "error" ? "bg-red-50 text-red-700 border border-red-200" : ""}`}>
                          {message}
                        </div>
                      )}

                      <div className="mt-8 text-center">
                        <button type="button" onClick={() => { setFase(4); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-gray-500 hover:text-gray-700 transition text-sm font-semibold underline">← Revisar Políticas</button>
                      </div>
                    </div>
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
                  <button onClick={() => window.location.href = "/thank-you"} className="w-full py-4 px-6 bg-[#C800A1] hover:bg-[#a00081] text-white text-lg font-bold rounded-xl transition-all shadow-md active:scale-95">Finalizar</button>
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

function ParticipantFormFields({ form, updateField, errors, prefix, edad, categoria }: {
  form: ParticipantForm;
  updateField: (field: string, value: string) => void;
  errors: Record<string, string>;
  prefix: string;
  edad?: number | null;
  categoria?: string;
}) {
  // Auto-calcular edad/categoría para integrantes
  const intEdad = form.fechaNacimiento ? calcularEdad(form.fechaNacimiento) : null;
  const intCategoria = intEdad !== null ? obtenerCategoria(intEdad) : "";
  const displayEdad = edad !== undefined ? edad : intEdad;
  const displayCategoria = categoria !== undefined ? categoria : intCategoria;

  return (
    <div className="space-y-5">
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
        {errors[`${prefix}distancia`] && <p className="text-red-500 text-xs mt-1">{errors[`${prefix}distancia`]}</p>}
      </div>

      {/* Cédula + Teléfono */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InputField label="Cédula *" name="cedula" value={form.cedula} onChange={(v) => updateField("cedula", v)} error={errors[`${prefix}cedula`]} placeholder="1712345678" />
        <InputField label="Teléfono Móvil *" name="tel" autoComplete="tel" value={form.telefonoMovil} onChange={(v) => updateField("telefonoMovil", v)} error={errors[`${prefix}telefonoMovil`]} placeholder="0991234567" />
      </div>

      {/* Nombres y Apellidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InputField label="Nombres *" name="nombres" autoComplete="given-name" value={form.nombres} onChange={(v) => updateField("nombres", v)} error={errors[`${prefix}nombres`]} placeholder="Juan Carlos" />
        <InputField label="Apellidos *" name="apellidos" autoComplete="family-name" value={form.apellidos} onChange={(v) => updateField("apellidos", v)} error={errors[`${prefix}apellidos`]} placeholder="Pérez López" />
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
        {errors[`${prefix}genero`] && <p className="text-red-500 text-xs mt-1">{errors[`${prefix}genero`]}</p>}
      </div>

      {/* Fecha Nacimiento + Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InputField label="Fecha de Nacimiento *" name="bday" autoComplete="bday" type="date" value={form.fechaNacimiento} onChange={(v) => updateField("fechaNacimiento", v)} error={errors[`${prefix}fechaNacimiento`]} />
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Categoría (Auto)</label>
          <input type="text" readOnly
            value={displayCategoria ? `${displayCategoria} (${displayEdad} años)` : "Selecciona fecha de nacimiento"}
            className={`w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none transition font-semibold ${displayCategoria ? "text-[#C800A1]" : "text-gray-400"}`} />
        </div>
      </div>

      {/* Correo */}
      <InputField label="Correo Electrónico *" name="email" autoComplete="email" type="email" value={form.correoElectronico} onChange={(v) => updateField("correoElectronico", v)} error={errors[`${prefix}correoElectronico`]} placeholder="tu@correo.com" />

      {/* País + Ciudad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InputField label="País" name="country-name" autoComplete="country-name" value={form.pais} onChange={(v) => updateField("pais", v)} placeholder="Ecuador" />
        <InputField label="Ciudad *" name="address-level2" autoComplete="address-level2" value={form.ciudad} onChange={(v) => updateField("ciudad", v)} error={errors[`${prefix}ciudad`]} placeholder="Quito" />
      </div>

      {/* Talla */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Talla de Camiseta *</label>
        <div className="grid grid-cols-4 gap-2">
          {TALLAS.map((t) => (
            <button key={t} type="button" onClick={() => updateField("talla", t)}
              className={`py-2 rounded-xl border-2 text-sm font-bold transition-all ${form.talla === t ? "border-[#8CC541] bg-[#8CC541]/10 text-[#8CC541]" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"}`}>
              {t}
            </button>
          ))}
        </div>
        {errors[`${prefix}talla`] && <p className="text-red-500 text-xs mt-1">{errors[`${prefix}talla`]}</p>}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, error, placeholder, type = "text", name, autoComplete }: {
  label: string; value: string; onChange: (value: string) => void; error?: string; placeholder?: string; type?: string; name?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
      <input type={type} name={name} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-3 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C800A1] focus:border-transparent transition text-gray-800 placeholder-gray-400 ${error ? "border-red-500 bg-red-50" : "border-gray-300"}`} />
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
      <style dangerouslySetInnerHTML={{
        __html: `
        header, footer { display: none !important; }
      `}} />
      <NuveiPageContent />
    </Suspense>
  );
}
