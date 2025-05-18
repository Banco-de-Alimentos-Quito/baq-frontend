import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, Truck } from 'lucide-react';

export default function WhatWeDoSection() {
  return (
    <section id="what-we-do" className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16 animate-in fade-in-0 slide-in-from-bottom-10 duration-700">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-primary">¿Qué Hacemos?</h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            El Banco de Alimentos Quito lucha contra el hambre y la desnutrición, rescatamos alimento y lo distribuimos en donación a personas vulnerables mediante un sistema de gestión certificado que garantiza trazabilidad y nos permite ser un aliado estratégico en materia de responsabilidad social empresarial.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex justify-center animate-in fade-in-0 slide-in-from-left-10 duration-700 delay-100">
            <Image
              src="https://www.baq.ec/wp-content/uploads/2025/05/wb-que-hace-baq-v2-1.webp"
              alt="Voluntarios organizando alimentos"
              width={600}
              height={400}
              className="rounded-lg shadow-xl object-cover max-h-[35rem] w-auto"
              data-ai-hint="volunteers foodbank"
            />
          </div>
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-10 duration-700 delay-200">
            <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <Package className="w-10 h-10 text-primary" />
                <CardTitle className="text-xl font-semibold">Recolección y Clasificación</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Rescatamos alimentos aptos para el consumo de supermercados, agricultores y empresas, clasificándolos cuidadosamente en nuestras bodegas.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <Truck className="w-10 h-10 text-primary" />
                <CardTitle className="text-xl font-semibold">Distribución Eficiente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Distribuimos los alimentos a una red de organizaciones benéficas, comedores sociales y comunidades vulnerables en toda la ciudad.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <Users className="w-10 h-10 text-primary" />
                <CardTitle className="text-xl font-semibold">Apoyo Comunitario</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Trabajamos de la mano con voluntarios y aliados para asegurar que la ayuda llegue a quienes más lo necesitan, fomentando la solidaridad.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
