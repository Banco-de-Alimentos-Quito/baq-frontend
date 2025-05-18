import React from 'react';

const TransferSection: React.FC = () => {
  return (
    <section id="transferencia" className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Transferencia Bancaria y Pago con DeUna</h2>
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-12">
          {/* Detalles de Transferencia Bancaria */}
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Datos para Transferencia</h3>
            <p className="mb-2">
              <span className="font-medium">Banco:</span> [Nombre del Banco]
            </p>
            <p className="mb-2">
              <span className="font-medium">Tipo de Cuenta:</span> [Tipo de Cuenta]
            </p>
            <p className="mb-2">
              <span className="font-medium">Número de Cuenta:</span> [Número de Cuenta]
            </p>
            <p className="mb-2">
              <span className="font-medium">RUC/Identificación:</span> [RUC/Identificación]
            </p>
            <p className="mb-2">
              <span className="font-medium">Nombre del Titular:</span> Banco de Alimentos de Quito
            </p>
            <p className="text-sm text-gray-600 mt-4">
              Por favor, asegúrate de verificar los datos antes de realizar la transferencia.
            </p>
          </div>

          {/* Código QR para DeUna */}
          <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4">Pago con DeUna</h3>
            {/* Placeholder for QR Code Image */}
            <div className="w-48 h-48 bg-gray-300 flex items-center justify-center text-gray-600 text-center">
              Código QR
              {/* Replace this div with your actual QR code image: */}
              {/* <img src="/path/to/your/deuna-qr.png" alt="Código QR DeUna" className="w-full h-full object-contain" /> */}
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Escanea el código QR con la aplicación DeUna para realizar tu donación.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransferSection;