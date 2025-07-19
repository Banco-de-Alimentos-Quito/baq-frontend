"use client";

import { Suspense } from "react";
import PaymentConfirmationContent from "./PaymentConfirmationContent";

export default function PaymentConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <PaymentConfirmationContent />
    </Suspense>
  );
}