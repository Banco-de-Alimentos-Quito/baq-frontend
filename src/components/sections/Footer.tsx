import Link from 'next/link';
import { Facebook, Instagram, Phone, MapPin, HeartHandshake } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className='flex flex-col items-center'>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.webp"
                alt="Logo BAQ"
                width={200}
                height={200}
                className="w-auto h-25"
              />
            </Link>
            <p className="text-sm">
              Comprometidos con la lucha contra el hambre en Quito. Tu apoyo es fundamental.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <h5 className="text-primary font-semibold">Para Donantes</h5>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> 099 5450 969
              </li>
              <h5 className="text-primary font-semibold">Para Recibir Alimentos</h5>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" /> 097 8655 501
              </li>
              <h5 className="text-primary font-semibold">Visítanos</h5>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Av. Maldonado y Saraguro, Quito
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-3">Síguenos</h4>
            <div className="flex space-x-4">
              <Link href="https://www.tiktok.com/@baqalimentos?_t=8gdx9t0zONR&_r=1" aria-label="TikTok" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="w-6 h-6" />
              </Link>
              <Link href="https://www.instagram.com/bancoalimentosquito?utm_source=qr" aria-label="Instagram" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-sm">
          <p>&copy; {currentYear} Banco de Alimentos Quito. Todos los derechos reservados.</p>
          <p className="mt-1">Diseñado con <HeartHandshake className="inline h-4 w-4 text-primary" /> para luchar contra el hambre.</p>
        </div>
      </div>
    </footer>
  );
}
