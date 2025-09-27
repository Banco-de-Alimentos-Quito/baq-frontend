"use client"
import { motion } from 'framer-motion';
import Image from 'next/image';

// Datos hardcodeados de los héroes
const heroes = [
  {
    id: 1,
    name: "Jeremy",
    fullname: "Jeremy Erazo",
    title: "Ethical Hacker",
    image: "/ambassadors/1836183642.jpg",
    quote: "El cambio empieza con una acción, por pequeña que sea.",
    instagram: "https://www.instagram.com/alexis541721",
  },
  {
    id: 2,
    name: "Emily",
    fullname: "Emily Montalvo",
    title: "Ingeniera de Software",
    image: "/ambassadors/1679526502702.jpg",
    quote: "Cada día es una oportunidad de cambiar vidas a través de la alimentación.",
    instagram: "https://www.instagram.com/emily.montalvo"
  },
  {
    id: 3,
    name: "Luis",
    fullname: "Luis Guerrero",
    title: "Desarrollador de Software",
    image: "/ambassadors/1750481236230.jpg",
    quote: "La verdadera riqueza está en poder compartir lo que tenemos con quienes más lo necesitan.",
    instagram: "https://www.instagram.com/laghie993"
  },
  {
    id: 4,
    name: "Alejandro",
    fullname: "Alejandro Llangante",
    title: "Ingeniero de Software",
    image: "/ambassadors/1753395799462.jpg",
    quote: "Un plato de comida puede ser la diferencia entre la esperanza y la desesperanza.",
    instagram: "https://www.instagram.com/alejandro_llanganate_"
  },
  {
    id: 5,
    name: "Alexis",
    fullname: "Alexis Sotomayor",
    title: "Desarrollador de Software",
    image: "/ambassadors/1712598357022.jpeg",
    quote: "Ayudar a otros es la mejor forma de encontrarse a uno mismo.",
    instagram: "https://www.instagram.com/alexis541721"
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
            Conoce a las personas extraordinarias que donan mensualmente y ponen su esfuerzo a combatir el hambre en nuestra comunidad
          </p>
        </div>

        {/* Heroes Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {heroes.map((hero, index) => (
            <motion.div
              key={hero.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden 
                        hover:shadow-xl transition-all duration-500 transform hover:scale-105 
                        hover:bg-white w-full max-w-xs mx-auto"
            >
              {/* Hero Image sin Overlay ni blur */}
              <div className="relative h-70 overflow-hidden group">
                <Image
                  src={hero.image}
                  alt={hero.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-105"
                />
              </div>
              {/* Content */}
              <div className="p-3 backdrop-blur-sm bg-white/70 transition-colors duration-500">
                {/* Nombre y Título en la parte superior */}
                <div className="flex justify-between items-start mb-1">
                  {/* Nombre a la izquierda */}
                  <div>
                    <h2 className="text-base font-bold text-gray-900 text-left">
                      {hero.name}
                    </h2>
                    <p className="text-xs text-gray-600 text-left">
                      {hero.fullname}
                    </p>
                  </div>
                  {/* Título a la derecha */}
                  <p className="text-xs text-orange-700 font-semibold text-right mt-1 ml-2">
                    {hero.title}
                  </p>
                </div>
                {/* Quote */}
                <motion.blockquote 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.3 + 0.2 }}
                  className="text-gray-600 text-center italic text-xs" 
                >
                  <span className="text-orange-600 text-lg">&ldquo;</span>
                  {hero.quote}
                  <span className="text-orange-600 text-lg">&rdquo;</span>
                </motion.blockquote>
                {/* Instagram Icono al final derecha */}
                <div className="flex justify-end mt-2">
                  <a
                    href={hero.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 hover:scale-110 transition-transform"
                    aria-label="Instagram"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="white"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
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
              ¿Eres donador recurrente y quieres aparecer en esta sección? <br />Escríbenos a&nbsp;
              <a
                href="mailto:tecnologia@baq.ec"
                className="text-orange-600 underline hover:text-orange-700"
              >
                tecnologia@baq.ec
              </a>
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