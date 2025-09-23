"use client";
import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useFormValidation, FormData } from "./hooks/useFormValidation";
import { ValidatedInput, ValidatedSelect } from "./components/FormFields";
import { CitySelector } from "./components/CitySelector";
import { BankSelector } from "./components/BankSelector";
import { AccountTypeSelector } from "./components/AccountTypeSelector";
import { BANK_OPTIONS, ACCOUNT_TYPE_OPTIONS } from "./constants/formOptions";
import { DonationService } from "./services/donationService";

// Componente del Carnet de Donador
const DonorCard = ({ form, monto, step }: { form: FormData; monto: number; step: number }) => {
  const isStep1Complete = form.cedula && form.nombres && form.numero && form.correo && form.direccion && form.ciudad;
  const isStep2Complete = form.cuenta && form.tipoCuenta && form.banco;

  // Función para generar siglas del banco
  const getBankInitials = (bankName: string) => {
    if (!bankName) return '';

    const words = bankName.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return words.map(word => word.charAt(0)).join('').toUpperCase();
  };

  return (
    <div className="relative rounded-3xl p-4 sm:p-6 shadow-2xl max-w-6xl mx-auto overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat opacity-30"
        style={{
          backgroundImage: 'url(/avatars/ninios.png)',
          backgroundPosition: 'center 20%'
        }}
      ></div>

      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/70 via-orange-500/70 to-orange-600/70"></div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full"></div>
      <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-white/8 rounded-full"></div>

      {/* Logo del Banco de Alimentos */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-8 z-20">
        <img
          src="/logo.webp"
          alt="Banco de Alimentos de Quito"
          className="w-12 h-12 sm:w-20 sm:md:w-24 sm:lg:w-28 h-12 sm:h-20 sm:md:h-24 sm:lg:h-28 object-contain drop-shadow-lg"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header del carnet mejorado */}
        <div className="text-left mb-4 sm:mb-6 pl-2 sm:pl-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white sm:w-4 sm:h-4">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white drop-shadow-lg tracking-wide">Carnet Súper Donador</h2>
          </div>
          <p className="text-sm sm:text-base font-medium text-white/80 drop-shadow-lg ml-8 sm:ml-11">
            C.C. <span className="font-bold">{form.cedula || 'Pendiente'}</span>
          </p>
        </div>

        {/* Contenido principal - Layout tipo carnet */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mb-4 sm:mb-6">
          {/* Lado izquierdo - Avatar y redes sociales */}
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            {/* Avatar más grande */}
            <div className="w-24 h-24 sm:w-40 sm:h-40 bg-transparent rounded-full flex items-center justify-center shadow-2xl border-2 sm:border-4 border-orange-400 overflow-hidden relative">
              {/* Fondo de ciudad */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
                style={{ backgroundImage: 'url(/background.png)' }}
              ></div>
              {/* Manzana */}
              <img
                src="/avatars/manzanita.png"
                alt="Manzanita Súper Donador"
                className="w-40 h-40 sm:w-64 sm:h-64 object-contain relative z-10"
              />
            </div>

            {/* Redes sociales */}
            <div className="flex gap-2 sm:gap-3">
              <a href="https://www.facebook.com/baqalimentosquito/?locale=es_LA" target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600 sm:w-5 sm:h-5">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/bancoalimentosquito/?hl=en" target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-pink-600 sm:w-5 sm:h-5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@baqalimentos" target="_blank" rel="noopener noreferrer" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-black sm:w-5 sm:h-5">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Lado derecho - Información del donador */}
          <div className="flex-1 p-2 sm:p-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* 1. Donador/a - Fila completa */}
              <div className="flex items-center gap-2 sm:gap-3 col-span-1 sm:col-span-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white sm:w-3 sm:h-3">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white/90 mb-0.5">Donador/a</p>
                  <p className={`text-xs sm:text-sm truncate ${form.nombres ? 'text-white font-medium' : 'text-white/70'}`}>
                    {form.nombres || 'Pendiente'}
                  </p>
                </div>
              </div>

              {/* 2. Celular */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white sm:w-3 sm:h-3">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white/90 mb-0.5">Celular</p>
                  <p className={`text-xs sm:text-sm truncate ${form.numero ? 'text-white font-bold' : 'text-white/70'}`}>
                    {form.numero || 'Pendiente'}
                  </p>
                </div>
              </div>

              {/* 3. Ciudad */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white sm:w-3 sm:h-3">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white/90 mb-0.5">Ciudad</p>
                  <p className={`text-xs sm:text-sm truncate ${form.ciudad ? 'text-white/90 font-medium' : 'text-white/70'}`}>
                    {form.ciudad || 'Pendiente'}
                  </p>
                </div>
              </div>

              {/* 4. Cta Bancaria - Fila completa */}
              <div className="flex items-center gap-2 sm:gap-3 col-span-1 sm:col-span-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white sm:w-3 sm:h-3">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white/90 mb-0.5">Cta Bancaria</p>
                  <p className={`text-xs sm:text-sm ${form.cuenta ? 'text-white/90 font-bold' : 'text-white/70'}`}>
                    {form.cuenta ? `****${form.cuenta.slice(-4)} - ${form.tipoCuenta || 'Ahorros'} - ${getBankInitials(form.banco || '')}` : 'Pendiente'}
                  </p>
                </div>
              </div>

              {/* 5. Correo - Siempre al final */}
              <div className="flex items-center gap-2 sm:gap-3 col-span-1 sm:col-span-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white sm:w-3 sm:h-3">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white/90 mb-0.5">Correo</p>
                  <p className={`text-xs sm:text-sm truncate ${form.correo ? 'text-white/90 font-bold' : 'text-white/70'}`}>
                    {form.correo || 'Pendiente'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impacto horizontal sin fondo */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white sm:w-4 sm:h-4">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"></path>
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white/80 mb-0.5">Impacto</p>
              <p className="text-sm sm:text-lg font-bold text-white">${monto}/mes</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white sm:w-4 sm:h-4">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white/80 mb-0.5">Personas alimentadas</p>
              <p className="text-sm sm:text-lg font-bold text-white">{monto * 12} personas/año</p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default function DonacionMensualForm() {
  const params = useSearchParams();
  const router = useRouter();
  const monto = Number(params.get("monto")) || 0;

  // Estados del wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [quiereFactura, setQuiereFactura] = useState<boolean | null>(null);

  const [form, setForm] = useState<FormData>({
    cedula: "",
    nombres: "",
    numero: "",
    correo: "",
    direccion: "",
    cuenta: "",
    tipoCuenta: "Ahorros", // Ahorros como tipo de cuenta por defecto
    banco: "Banco Pichincha", // Banco Pichincha como banco por defecto
    otroBanco: "",
    ciudad: "Quito", // Quito como ciudad por defecto
    acepta: false,
  });

  const [enviado, setEnviado] = useState(false);
  const [tocado, setTocado] = useState<{ [k: string]: boolean }>({});
  const [termsChecked, setTermsChecked] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const {
    errors,
    validationState,
    documentType,
    validateField,
    clearValidation,
    validateEcuadorianId,
  } = useFormValidation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;

    const newValue =
      type === "checkbox" ? (target as HTMLInputElement).checked : value;

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setTocado((prev) => ({ ...prev, [name]: true }));

    // Validar campo en tiempo real si tiene valor
    if (value && name in form) {
      validateField(name as keyof FormData, value);
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTocado((prev) => ({ ...prev, [name]: true }));

    if (value && name in form) {
      validateField(name as keyof FormData, value);
    }
  };

  // Validación para el paso 1
  const isStep1Valid = () => {
    return form.cedula && form.nombres && form.numero && form.correo && form.direccion && form.ciudad;
  };

  // Validación para el paso 2
  const isStep2Valid = () => {
    const baseValid = form.cuenta && form.tipoCuenta && form.banco && form.acepta && termsChecked && quiereFactura !== null;
    if (form.banco === "Otra") {
      return baseValid && form.otroBanco;
    }
    return baseValid;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // El envío real se maneja desde el modal de confirmación
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleConfirmAndSubmit = async () => {
    if (!isStep2Valid()) {
      return;
    }

    if (!validateEcuadorianId(form.cedula)) {
      toast.error("Cédula/RUC inválido", {
        description: "El formato de la cédula o RUC ingresado no es válido. Verifica e intenta nuevamente.",
        duration: 5000,
      });
      return;
    }

    setEnviado(true);
    setShowConfirmationModal(false);

    try {
      const facturaValue = quiereFactura === true ? true : false;

      await DonationService.submitDonation(
        form,
        monto,
        termsChecked,
        facturaValue
      );
      setEnviado(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("❌ Error submitting form:", error);

      let errorMessage = "Error al enviar el formulario";
      let errorDescription = "Hubo un problema al procesar tu solicitud. Por favor, intenta nuevamente.";

      if (error instanceof Error) {
        if (error.message.includes("Missing required fields")) {
          errorMessage = "Campos requeridos faltantes";
          errorDescription = error.message;
        } else if (error.message.includes("must be")) {
          errorMessage = "Error de validación";
          errorDescription = error.message;
        } else if (error.message.includes("HTTP error! status: 400")) {
          errorMessage = "Error de validación del servidor";
          errorDescription = "Los datos enviados no cumplen con los requisitos del servidor.";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Error de conexión";
          errorDescription = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
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
    setForm({
      cedula: "",
      nombres: "",
      numero: "",
      correo: "",
      direccion: "",
      cuenta: "",
      tipoCuenta: "Ahorros", // Reset to Ahorros
      banco: "Banco Pichincha", // Reset to Banco Pichincha
      otroBanco: "",
      ciudad: "Quito", // Reset to Quito
      acepta: false,
    });
    setTocado({});
    setTermsChecked(false);
    setQuiereFactura(null);
    setCurrentStep(1);
    clearValidation();
    
    // Redirigir a la página de inicio
    router.push("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Espacio reservado para navbar */}
      <div style={{ paddingTop: 120 }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formulario Wizard */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Header del wizard */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-[#2F3388] mb-2">
                    ¡No pares ahora!
                  </h1>
                  <p className="text-gray-600">Completa tus datos y convierte tu intención en acción.</p>



                  {/* Indicador de pasos */}
                  <div className="flex justify-center mt-6">
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${currentStep >= 1
                          ? 'bg-orange-500 text-white hover:bg-orange-600 cursor-pointer'
                          : 'bg-gray-200 text-white/70 cursor-pointer hover:bg-gray-300'
                          }`}
                      >
                        <span className="font-bold">1</span>
                      </button>
                      <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                      <button
                        type="button"
                        onClick={() => {
                          if (isStep1Valid()) {
                            setCurrentStep(2);
                          }
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${currentStep >= 2
                          ? 'bg-orange-500 text-white hover:bg-orange-600 cursor-pointer'
                          : isStep1Valid()
                            ? 'bg-gray-200 text-white/70 cursor-pointer hover:bg-gray-300'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        disabled={!isStep1Valid() && currentStep < 2}
                      >
                        <span className="font-bold">2</span>
                      </button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Paso 1: Información General */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-white/90 mb-2">
                          Información General
                        </h2>
                        <p className="text-gray-600">Completa tus datos personales</p>
                      </div>

                      <ValidatedInput
                        label="Nombres completos"
                        name="nombres"
                        value={form.nombres}
                        placeholder="Ej: Juan Carlos Pérez González"
                        required
                        validation={validationState.nombres}
                        error={errors.nombres}
                        touched={tocado.nombres}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />

                      <ValidatedInput
                        label="Cédula/RUC/Pasaporte"
                        name="cedula"
                        value={form.cedula}
                        placeholder="Ej: 1710034065, 1710034065001, A1234567"
                        required
                        validation={validationState.cedula}
                        error={errors.cedula}
                        touched={tocado.cedula}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {documentType && form.cedula && (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-600 font-medium">
                            ✓ {documentType} detectado
                          </p>
                        </div>
                      )}

                      {/* Fila para teléfono y ciudad en web */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ValidatedInput
                          label="Número de teléfono"
                          name="numero"
                          type="tel"
                          value={form.numero}
                          placeholder="Ej: 0991234567"
                          required
                          validation={validationState.numero}
                          error={errors.numero}
                          touched={tocado.numero}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />

                        <CitySelector
                          label="Ciudad"
                          name="ciudad"
                          value={form.ciudad}
                          required
                          error={errors.ciudad}
                          touched={tocado.ciudad}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </div>

                      <ValidatedInput
                        label="Correo electrónico"
                        name="correo"
                        type="email"
                        value={form.correo}
                        placeholder="tucorreo@email.com"
                        required
                        validation={validationState.correo}
                        error={errors.correo}
                        touched={tocado.correo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />

                      <ValidatedInput
                        label="Dirección"
                        name="direccion"
                        value={form.direccion}
                        placeholder="Ej: Av. Principal 123 y Secundaria"
                        required
                        validation={validationState.direccion}
                        error={errors.direccion}
                        touched={tocado.direccion}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />

                      <button
                        type="button"
                        onClick={handleNextStep}
                        disabled={!isStep1Valid()}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3"
                      >
                        <span>Continuar al Paso 2</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"></path>
                          <path d="M12 5l7 7-7 7"></path>
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Paso 2: Información Financiera */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-white/90 mb-2">
                          Información Financiera
                        </h2>
                        <p className="text-gray-600">Completa los datos de tu cuenta</p>
                      </div>

                      <ValidatedInput
                        label="Número de cuenta del donador"
                        name="cuenta"
                        value={form.cuenta}
                        placeholder="Ej: 1234567890"
                        required
                        validation={validationState.cuenta}
                        error={errors.cuenta}
                        touched={tocado.cuenta}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />

                      {/* Fila para tipo de cuenta y banco en web */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AccountTypeSelector
                          label="Tipo de cuenta"
                          name="tipoCuenta"
                          value={form.tipoCuenta}
                          required
                          error={errors.tipoCuenta}
                          touched={tocado.tipoCuenta}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />

                        <BankSelector
                          label="Banco o cooperativa"
                          name="banco"
                          value={form.banco}
                          required
                          error={errors.banco}
                          touched={tocado.banco}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </div>

                      {form.banco === "Otra" && (
                        <ValidatedInput
                          label="Especifica tu banco o cooperativa"
                          name="otroBanco"
                          value={form.otroBanco}
                          placeholder="Nombre de tu banco o cooperativa"
                          required
                          touched={tocado.otroBanco}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      )}

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monto a donar
                        </label>
                        <div className="text-2xl font-bold text-orange-600">
                          ${monto}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          ¿Deseas recibir factura?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setQuiereFactura(true)}
                            className={`p-4 border-2 rounded-lg transition-all ${quiereFactura === true
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                              }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 12l2 2 4-4"></path>
                              </svg>
                              Sí, quiero factura
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuiereFactura(false)}
                            className={`p-4 border-2 rounded-lg transition-all ${quiereFactura === false
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                              }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6 18"></path>
                                <path d="M6 6l12 12"></path>
                              </svg>
                              No, gracias
                            </div>
                          </button>
                        </div>
                        {quiereFactura === null && (
                          <p className="text-red-500 text-sm mt-2">
                            Por favor selecciona una opción
                          </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              name="acepta"
                              checked={form.acepta}
                              onChange={handleChange}
                              className="mt-1"
                            />
                            <span className="text-sm text-gray-700">
                              Acepto que se me debite mensualmente este monto a favor de la Fundación Banco de Alimentos Quito.
                            </span>
                          </label>
                          {tocado.acepta && !form.acepta && (
                            <p className="text-red-500 text-sm mt-2">
                              Debes aceptar la cláusula
                            </p>
                          )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <label className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={termsChecked}
                              onChange={(e) => setTermsChecked(e.target.checked)}
                              className="mt-1"
                            />
                            <span className="text-sm text-gray-700">
                              Acepto que he leído previamente los{" "}
                              <Link
                                href="/politicas"
                                className="text-orange-600 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Términos y Condiciones, y Política de Tratamiento de Datos Personales
                              </Link>
                              .
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5"></path>
                            <path d="M12 19l-7-7 7-7"></path>
                          </svg>
                          Anterior
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowConfirmationModal(true)}
                          disabled={!isStep2Valid() || enviado}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3"
                        >
                          {enviado ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Enviando...
                            </>
                          ) : (
                            <>
                              <span>Generar contrato</span>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14"></path>
                                <path d="M12 5l7 7-7 7"></path>
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Carnet de Donador */}
              <div className="lg:sticky lg:top-32">
                <DonorCard form={form} monto={monto} step={currentStep} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales de éxito y carga */}
      {enviado && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-2xl text-center">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-white/90 mb-2">
              Enviando solicitud...
            </h3>
            <p className="text-gray-600">
              Por favor espera mientras procesamos tu información.
            </p>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#2F3388] mb-2">
              ¡Contrato enviado a tu correo!
            </h3>
            <p className="text-gray-700 mb-4">
              Hemos enviado el enlace para firmar tu contrato a
              {" "}
              <span className="font-semibold text-gray-900">{form.correo || 'tu correo'}</span>.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Revisa tu bandeja de entrada y la carpeta de spam. Sigue las instrucciones del correo para completar el proceso.
            </p>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleCloseSuccessModal}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header del Modal */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                    <path d="M9 12l2 2 4-4"></path>
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Estás seguro de tus datos?</h2>
                <p className="text-gray-600">
                  Revisa tu información antes de generar el contrato. Una vez confirmado, se procesará tu donación mensual.
                </p>
              </div>

              {/* Carnet de Confirmación */}
              <div className="mb-6">
                <DonorCard form={form} monto={monto} step={2} />
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </svg>
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAndSubmit}
                  disabled={enviado}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3"
                >
                  {enviado ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generando contrato...
                    </>
                  ) : (
                    <>
                      <span>Continuar</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}