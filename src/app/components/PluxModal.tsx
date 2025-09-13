"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface PluxModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
}

export default function PluxModal({ isOpen, onClose, amount }: PluxModalProps) {
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cvv, setCvv] = useState("");
  const [cedula, setCedula] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!numeroTarjeta.trim() || !vencimiento.trim() || !cvv.trim() || !cedula.trim() || !direccion.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    
    // Simular procesamiento
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      router.push("/thank-you");
    }, 2000);
  };

  const handleNumeroTarjetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 16) {
      // Formatear con espacios cada 4 dígitos
      const formatted = value.replace(/(.{4})/g, '$1 ').trim();
      setNumeroTarjeta(formatted);
    }
  };

  const handleVencimientoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      // Formatear MM/YY
      const formatted = value.length >= 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
      setVencimiento(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Solo números
    if (value.length <= 10) {
      setCedula(value);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-8 w-full max-w-md shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600 transition"
          onClick={onClose}
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="https://www.plux.ec/wp-content/uploads/2023/03/logo-footer-12.svg" alt="PagoPlux" className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Negocio de Registro
          </h2>
          <p className="text-blue-600 font-semibold text-lg">
            Tarjeta de Crédito/Débito
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Número de tarjeta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de la tarjeta
            </label>
            <div className="relative">
              <input
                type="text"
                value={numeroTarjeta}
                onChange={handleNumeroTarjetaChange}
                placeholder="Ej 4545XXXX0000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.11,4 20,4Z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Vencimiento y CVV */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vencimiento
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={vencimiento}
                  onChange={handleVencimientoChange}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código CVV
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cvv}
                  onChange={handleCvvChange}
                  placeholder="CVV"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.11,4 20,4Z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Campo de Cédula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Cédula
            </label>
            <input
              type="text"
              value={cedula}
              onChange={handleCedulaChange}
              placeholder="Ingresa tu número de cédula"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingresa tu cédula ecuatoriana (10 dígitos)
            </p>
          </div>

          {/* Botón de guardar datos */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17,12C17,10.89 16.1,10 15,10C13.89,10 13,10.89 13,12A2,2 0 0,0 15,14C16.1,14 17,13.1 17,12M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M8.5,6A3.5,3.5 0 0,1 12,2.5A3.5,3.5 0 0,1 15.5,6V8H8.5V6Z"/>
                </svg>
                Guardar Datos
              </>
            )}
          </button>
        </form>

        {/* Footer con logos de pagos */}
        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-6" />
          <div className="w-8 h-6 bg-green-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">SSL</span>
          </div>
          <img src="pagos-plux.png" alt="PagoPlux" className="h-6" />
        </div>

        <p className="text-center text-xs text-gray-500 mt-2">
          Monto: <span className="font-semibold">${amount} USD</span>
        </p>
      </div>
    </div>
  );
}