import Link from "next/link";
import {
  Facebook,
  Instagram,
  Phone,
  MapPin,
  HeartHandshake,
  Linkedin,
} from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-800 text-gray-300 py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo y descripción */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.webp"
                alt="Logo BAQ"
                width={200}
                height={200}
                className="w-auto h-20"
              />
            </Link>
            <p className="text-sm max-w-xs">
              Comprometidos con la lucha contra el hambre en Quito. Tu apoyo es
              fundamental.
            </p>
          </div>

          {/* Contacto */}
          <div className="text-center sm:text-left">
            <h4 className="text-lg font-semibold text-gray-100 mb-3">
              Contacto
            </h4>
            <ul className="space-y-2 text-sm">
              <h5 className="text-primary font-semibold mt-4">Para Donantes</h5>
              <li className="flex items-center gap-2 justify-center sm:justify-start">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="break-all">099 5450 969</span>
              </li>
              <h5 className="text-primary font-semibold mt-4">
                Para Recibir Alimentos
              </h5>
              <li className="flex items-center gap-2 justify-center sm:justify-start">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="break-all">097 8655 501</span>
              </li>
              <li className="flex items-center gap-2 mt-4 justify-center sm:justify-start">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="break-all">Av. Maldonado y Saraguro, Quito</span>
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div className="text-center sm:text-left">
            <h4 className="text-lg font-semibold text-gray-100 mb-3">
              Nuestras redes sociales
            </h4>
            <div className="flex flex-col space-y-3">
              <Link
                href="https://www.facebook.com/baqalimentosquito/?locale=es_LA"
                aria-label="Facebook"
                className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2 justify-center sm:justify-start"
              >
                <Facebook className="w-5 h-5 flex-shrink-0" />
                <span>baqalimentosquito</span>
              </Link>
              <Link
                href="https://www.instagram.com/bancoalimentosquito?utm_source=qr"
                aria-label="Instagram"
                className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2 justify-center sm:justify-start"
              >
                <Instagram className="w-5 h-5 flex-shrink-0" />
                <span>bancoalimentosquito</span>
              </Link>
              <Link
                href="https://www.linkedin.com/company/baqalimentosoficial"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2 justify-center sm:justify-start"
              >
                <Linkedin className="w-5 h-5 flex-shrink-0" />
                <span>baqalimentosoficial</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-6 text-center text-sm">
          <p className="break-words px-4">
            &copy; {currentYear} Banco de Alimentos Quito. Todos los derechos
            reservados.
          </p>
          <p className="mt-2 flex items-center justify-center gap-1">
            Diseñado con
            <HeartHandshake className="inline-block h-4 w-4 text-primary" />
            para luchar contra el hambre.
          </p>
        </div>
      </div>
    </footer>
  );
}
