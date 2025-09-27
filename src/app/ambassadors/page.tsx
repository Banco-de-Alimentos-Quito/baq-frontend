"use client"
import { motion } from 'framer-motion';
import Image from 'next/image';

// Datos hardcodeados de los héroes
const heroes = [
  {
    id: 1,
    name: "Emily",
    fullname: "Emily Montalvo",
    title: "Ingeniera de Software",
    image: "/ambassadors/1679526502702.jpg",
    quote: "Cada día es una oportunidad de cambiar vidas a través de la alimentación.",
    instagram: "https://www.instagram.com/emily.montalvo"
  },
  {
    id: 2,
    name: "Luis",
    fullname: "Luis Martínez",
    title: "Desarrollador de Software",
    image: "/ambassadors/1750481236230.jpg",
    quote: "La verdadera riqueza está en poder compartir lo que tenemos con quienes más lo necesitan.",
    instagram: "https://www.instagram.com/laghie993"
  },
  {
    id: 3,
    name: "Alejandro",
    fullname: "Alejandro Llangante",
    title: "Ingeniero de Software",
    image: "/ambassadors/1753395799462.jpg",
    quote: "Un plato de comida puede ser la diferencia entre la esperanza y la desesperanza.",
    instagram: "https://www.instagram.com/alejandro_llanganate_"
  }
];

export default function HeroesContraElHambrePage() {
  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span style={{ color: '#EB711B' }}>Embajadores </span> contra el hambre
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conoce a las personas extraordinarias que dedican su tiempo y esfuerzo a combatir el hambre en nuestra comunidad
          </p>
        </div>

        {/* Heroes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {heroes.map((hero, index) => (
            <motion.div
              key={hero.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden 
                        hover:shadow-xl transition-all duration-500 transform hover:scale-105 
                        hover:bg-white"
            >
              {/* Hero Image with Overlay */}
              <div className="relative h-48 overflow-hidden group">
                <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/0 transition-all duration-500"></div>
                <Image
                  src={hero.image}
                  alt={hero.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-4 backdrop-blur-sm bg-white/70 transition-colors duration-500">
                {/* Nombre y Título en la parte superior */}
                <div className="flex justify-between items-start mb-2">
                  {/* Nombre a la izquierda */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 text-left">
                      {hero.name}
                    </h2>
                    <p className="text-sm text-gray-600 text-left">
                      {hero.fullname}
                    </p>
                  </div>
                  {/* Título a la derecha */}
                  <p className="text-sm text-orange-700 font-semibold text-right mt-1 ml-4">
                    {hero.title}
                  </p>
                </div>

                {/* Quote */}
                <motion.blockquote 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.3 + 0.2 }}
                  className="text-gray-600 text-center italic text-base" 
                >
                  <span className="text-orange-600 text-xl">&ldquo;</span>
                  {hero.quote}
                  <span className="text-orange-600 text-xl">&rdquo;</span>
                </motion.blockquote>

                {/* Instagram Icono al final derecha */}
                <div className="flex justify-end mt-4">
                  <a
                    href={hero.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 hover:scale-110 transition-transform"
                    aria-label="Instagram"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="white"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="white" strokeWidth="2"/>
                      <circle cx="18" cy="6" r="1.2" fill="white"/>
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-8 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Quieres ser un <span style={{ color: '#EB711B' }}>Embajador</span> también?
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Únete a nuestro equipo de voluntarios o realiza una donación mensual para aumentar tu impacto y ayudar a cambiar más vidas cada día.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/donacion"
                className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors duration-300 hover:scale-105 transform"
              >
                Donar Mensualmente
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}