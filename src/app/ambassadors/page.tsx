import Image from 'next/image';

// Datos hardcodeados de los héroes
const heroes = [
  {
    id: 1,
    name: "Emily Montalvo",
    image: "/ambassadors/1679526502702.jpg",
    quote: "Cada día es una oportunidad de cambiar vidas a través de la alimentación."
  },
  {
    id: 2,
    name: "Luis Guerrero",
    image: "/ambassadors/1750481236230.jpg",
    quote: "La verdadera riqueza está en poder compartir lo que tenemos con quienes más lo necesitan."
  },
  {
    id: 3,
    name: "Alejandro Llanganate",
    image: "/ambassadors/1753395799462.jpg",
    quote: "Un plato de comida puede ser la diferencia entre la esperanza y la desesperanza."
  }
];

export default function HeroesContraElHambrePage() {
  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span style={{ color: '#EB711B' }}>Héroes</span> contra el hambre
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conoce a las personas extraordinarias que dedican su tiempo y esfuerzo a combatir el hambre en nuestra comunidad
          </p>
        </div>

        {/* Heroes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {heroes.map((hero) => (
            <div
              key={hero.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:scale-105"
            >
              {/* Hero Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={hero.image}
                  alt={hero.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Name */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {hero.name}
                </h2>

                {/* Quote */}
                <blockquote className="text-gray-600 text-center italic">
                  <span className="text-orange-600 text-2xl">&ldquo;</span>
                  {hero.quote}
                  <span className="text-orange-600 text-2xl">&rdquo;</span>
                </blockquote>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Quieres ser un <span style={{ color: '#EB711B' }}>héroe</span> también?
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Únete a nuestro equipo de voluntarios y ayuda a marcar la diferencia en la vida de miles de personas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/donacion"
                className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors duration-200"
              >
                Donar Ahora
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
              <a
                href="/volunteering"
                className="inline-flex items-center px-6 py-3 border-2 border-orange-600 text-orange-600 font-medium rounded-lg hover:bg-orange-600 hover:text-white transition-colors duration-200"
              >
                Dona Alimento
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
                    d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 20H4v-2a3 3 0 015.196-2.121m0 0a11.952 11.952 0 016.08 0M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}