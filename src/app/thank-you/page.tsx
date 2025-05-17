import Link from 'next/link';

export default function ThankYou() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h1>
        <p className="mb-6 text-lg">
          Tu pago ha sido procesado correctamente.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-center font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}