'use client';
import React, { Suspense } from 'react';
import DonacionMensualForm from './DonacionMensualForm';

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
