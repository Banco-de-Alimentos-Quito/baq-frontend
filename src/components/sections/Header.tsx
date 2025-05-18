"use client";
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScrollLink from '@/components/ScrollLink';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import Image from 'next/image';

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
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-background/95 shadow-md backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/icono-logo-naranja.webp"
            alt="Logo BAQ"
            width={50}
            height={50}
            className="w-auto h-15"
          />
          <span className="font-bold text-xl text-primary">Banco de Alimentos Quito</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <NavLinks />
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <ScrollLink href="#donate">Donar Ahora</ScrollLink>
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
                
                <span className="font-bold text-xl text-primary">Banco de Alimentos Quito</span>
              </Link>
              <NavLinks onClick={() => setIsSheetOpen(false)} />
              <Button asChild size="sm" className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setIsSheetOpen(false)}>
                 <ScrollLink href="#donate">Donar Ahora</ScrollLink>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
