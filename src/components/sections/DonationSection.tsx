'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import Link from 'next/link';

// Type for Google Analytics gtag function
declare global {
  interface Window {
    gtag: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

export default function DonationSection() {
  return (
    <section id="donate" className="bg-slate-50 dark:bg-slate-900 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16 animate-in fade-in-0 slide-in-from-bottom-10 duration-700">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-primary">Haz Tu Donación</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Tu generosidad transforma vidas. Cada contribución nos acerca más a un Quito sin hambre.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-xl animate-in fade-in-0 zoom-in-95 duration-700 delay-100">
            <CardHeader className="text-center">
              <Gift className="w-16 h-16 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl md:text-3xl">¡Haz tu donación ahora!</CardTitle>
              <CardDescription className="text-base md:text-lg">
                Tu ayuda es fundamental para seguir alimentando esperanzas.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                asChild
                size="lg"
                className="px-10 py-6 text-lg text-[#ed6f1d] hover:bg-orange-400 text-primary-foreground transition-transform hover:scale-105"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'presiono_dono_landing', {
                      ubicacion: 'donation_section',
                      tipo_boton: 'donar_ahora'
                    });
                  }
                }}
              >
                <Link href="/donacion">
                  Donar Ahora
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
