import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const ambassadors = [
  {
    name: "Emily Montalvo ",
    image: "/ambassadors/18136134581.jpg",
    quote: "Cada día es una oportunidad de cambiar vidas a través de la alimentación.",
  },
  {
    name: "Luis  Guerrero ", 
    image: "/ambassadors/19371728451.jpg",
    quote: "La verdadera riqueza está en poder compartir lo que tenemos con quienes más lo necesitan.",
  },
  {
    name: "Alejandro Llanganate ",
    image: "/ambassadors/1753395799462.jpg", 
    quote: "Un plato de comida puede ser la diferencia entre la esperanza y la desesperanza.",
  },
];

export default function AmbassadorsSection() {
  return (
    <section id="ambassadors" className="bg-gradient-to-br from-orange-50 to-red-50 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16 animate-in fade-in-0 slide-in-from-bottom-10 duration-700">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-orange-600">
            Nuestros <span className="text-gray-900">Embajadores</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Conoce a los héroes que día a día luchan contra el hambre en nuestra comunidad
          </p>
        </div>
        
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {ambassadors.map((ambassador, index) => (
            <Card 
              key={ambassador.name} 
              className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-in fade-in-0 slide-in-from-bottom-10 bg-white"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="relative w-24 h-24 mb-4">
                  <Image
                    src={ambassador.image}
                    alt={ambassador.name}
                    fill
                    className="rounded-full object-cover border-4 border-orange-200"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{ambassador.name}</h3>
                <blockquote className="text-gray-600 italic text-center">
                  <span className="text-orange-600 text-xl">&ldquo;</span>
                  {ambassador.quote}
                  <span className="text-orange-600 text-xl">&rdquo;</span>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center animate-in fade-in-0 slide-in-from-bottom-10 duration-700" style={{ animationDelay: '450ms' }}>
          <Link 
            href="/ambassadors"
            className="inline-flex items-center px-8 py-4 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors duration-200 group text-lg"
          >
            Ver todos los Embajadores
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
