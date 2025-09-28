import React from 'react';

const WhyWeDoExist: React.FC = () => {
  return (
    <section className="why-we-exist">
    <div className="container mx-auto px-4 py-16 bg-white/90 rounded-xl shadow-2xl border border-orange-200 backdrop-blur-md relative z-10">
        {/* Título principal */}
        <h2 className="text-4xl font-bold text-orange-500 text-center mb-8">
          Para qué existimos
        </h2>

        {/* Contenido principal */}
        <div className="max-w-4xl mx-auto text-gray-700 leading-relaxed mb-12 text-center">
          <p className="mb-6">
            El Atlas de Políticas Públicas de Donación de Alimentos, investigación realizada por Harvard Law School 2022, señala que{' '}
            <span className="font-semibold">en el mundo se desperdicia más de 1.300 millones de toneladas de alimentos y en Ecuador se desperdicia más de 800.000 toneladas</span>, 
            mientras la CEPAL informa que{' '}
            <span className="font-semibold">somos una de las países con un alto índice de desnutrición crónica infantil en la región</span>, 
            sin referirse que por 3,7 % de la población pueden marginalizarse económica y socialmente.
          </p>

          <p>
            Tenemos la responsabilidad moral y la obligación de no permitir el desperdicio y la pérdida de alimento mientras exista hambre en 
            niños, adulto mayor, madres gestantes, personas con capacidades especiales o enfermedades.
          </p>

          <div className="text-right mt-6">
            <a 
              href="https://atlas.foodbanking.org/country/ecuador/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-600 underline text-lg font-medium transition-colors"
            >
              https://atlas.foodbanking.org/country/ecuador/
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyWeDoExist;