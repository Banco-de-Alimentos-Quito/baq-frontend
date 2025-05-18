import { Button } from '@/components/ui/button';
import ScrollLink from '@/components/ScrollLink';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section 
      id="hero" 
      className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-orange-100 via-rose-50 to-amber-100 dark:from-orange-900/30 dark:via-rose-900/30 dark:to-amber-900/30 pt-16 -mt-16"
    >
      <div className="absolute inset-0 opacity-20">
        <Image
          src="https://www.baq.ec/wp-content/uploads/2025/05/wb-baq-headher-v1.webp"
          alt="Personas recibiendo alimentos"
          layout="fill"
          objectFit="cover"
          data-ai-hint="community food"
          priority
        />
         <div className="absolute inset-0 bg-background/30 dark:bg-background/60"></div>
      </div>
      <div className="container mx-auto px-4 md:px-6 text-center relative z-10 animate-in fade-in-0 slide-in-from-bottom-10 duration-700">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-orange-600 dark:text-gray-100">
          <span className="block">Con tu ayuda,</span>
          <span className="block text-primary">llevamos alimento</span>
          <span className="block">a quienes más lo necesitan.</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300 md:text-xl">
          Cada donación, por pequeña que sea, marca una gran diferencia en la vida de familias y personas vulnerables en Quito.
        </p>
        <div className="mt-10">
          <Button asChild size="lg" className="px-10 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-transform duration-300">
            <ScrollLink href="#donate">Donar Ahora</ScrollLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
