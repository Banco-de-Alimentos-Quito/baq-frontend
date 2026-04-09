import React from "react";
import Image from "next/image";

const OurAliances: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Título de la sección */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Nuestros aliados
          </h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
        </div>

        {/* Grid de logos de aliados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-items-center max-w-4xl mx-auto">
          {/* The Global Food Banking Network */}
          <div className="flex items-center justify-center p-6">
            <Image
              src="https://www.foodbanking.org/wp-content/uploads/2023/05/GFN_Logo_Teal.png"
              alt="The Global Food Banking Network"
              width={200}
              height={128}
              className="h-32 w-auto object-contain"
              unoptimized
            />
          </div>

          {/* Diálogos Vitales */}
          <div className="flex items-center justify-center p-6">
            <Image
              src="/LOGO DIALOGOS VITALES.png"
              alt="Diálogos Vitales"
              width={200}
              height={128}
              className="h-32 w-auto object-contain"
            />
          </div>

          {/* Pontificia Universidad Javeriana */}
          <div className="flex items-center justify-center p-6">
            <Image
              src="/logo-epn-vertical.png"
              alt="Escuela Politecnica Nacional"
              width={200}
              height={128}
              className="h-32 w-auto object-contain"
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurAliances;

