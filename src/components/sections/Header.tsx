"use client";
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScrollLink from '@/components/ScrollLink';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import Image from 'next/image';

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
  </>
);

export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className={`w-full ${isScrolled ? 'bg-white/95 shadow-md backdrop-blur-sm' : 'bg-transparent'}`}>
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
