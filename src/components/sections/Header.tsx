"use client";
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScrollLink from '@/components/ScrollLink';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// Type for Google Analytics gtag function
declare global {
  interface Window {
    gtag: (command: string, eventName: string, params?: Record<string, any>) => void;
  }
}

const NavLinks = ({ onClick }: { onClick?: () => void }) => (
  <>
    <ScrollLink href="/#what-we-do" className="text-sm font-medium hover:text-primary transition-colors" onClick={onClick}>
      ¿Qué Hacemos?
    </ScrollLink>
    <ScrollLink href="/#how-to-help" className="text-sm font-medium hover:text-primary transition-colors" onClick={onClick}>
      Cómo Ayudar
    </ScrollLink>
    <ScrollLink href="/#testimonials" className="text-sm font-medium hover:text-primary transition-colors" onClick={onClick}>
      Testimonios
    </ScrollLink>
    <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors" onClick={onClick}>
      Blog
    </Link>
    <Link
      href="/huevos-zen"
      className="text-sm font-medium hover:text-primary transition-colors relative group"
      onClick={onClick}
    >
      Otras formas de ayuda
      <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
    </Link>
  </>
);

export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const pathname = usePathname() || '';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);

      // Al estar en el tope, siempre visible
      if (currentScrollY <= 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Desplazamiento hacia abajo: ocultar de inmediato
        setIsVisible(false);
      } else if (lastScrollY.current - currentScrollY > 5) {
        // Desplazamiento hacia arriba: mostrar
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ocultar header en la ruta de la carrera
  if (pathname.startsWith('/carrera')) {
    return null;
  }

  const isDarkPage = pathname.startsWith('/huevos-zen');

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-200 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className={`w-full ${isScrolled || isDarkPage ? 'bg-white/95 shadow-md backdrop-blur-sm' : 'bg-transparent'}`}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo2.png"
              alt="Logo BAQ"
              width={120}
              height={120}
              className="w-auto h-12"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavLinks />
            <Button
              asChild
              size="sm"
              className="bg-primary text-[#ed6f1d] hover:bg-orange-400 text-primary-foreground"
              onClick={() => {
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'presiono_dono_landing', {
                    ubicacion: 'header',
                    tipo_boton: 'donar_ahora'
                  });
                }
              }}
            >
              <Link href="/donacion">Donar Ahora</Link>
            </Button>
          </nav>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col items-start gap-6 p-6">
                <Link href="/" className="flex items-center gap-2 mb-4" onClick={() => setIsSheetOpen(false)}>
                  <Image
                    src="/logo.webp"
                    alt="Logo BAQ"
                    width={120}
                    height={120}
                    className="w-auto h-12"
                  />
                </Link>
                <NavLinks onClick={() => setIsSheetOpen(false)} />
                <Button asChild size="sm" className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setIsSheetOpen(false)}>
                  <ScrollLink href="#donate">Donar Ahora</ScrollLink>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
