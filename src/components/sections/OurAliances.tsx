import React from "react";

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
            <img
              src="https://www.foodbanking.org/wp-content/uploads/2023/05/GFN_Logo_Teal.png"
              alt="The Global Food Banking Network"
              className="h-32 w-auto object-contain"
            />
          </div>

          {/* Diálogos Vitales */}
          <div className="flex items-center justify-center p-6">
            <img
              src="https://robertosalasguzman.cl/wp-content/uploads/2020/09/Logo.jpg"
              alt="Diálogos Vitales"
              className="h-32 w-auto object-contain"
            />
          </div>

          {/* Pontificia Universidad Javeriana */}
          <div className="flex items-center justify-center p-6">
            <img
              src="https://webhistorico.epn.edu.ec/wp-content/uploads/2022/08/logo-epn-vertical.png"
              alt="Escuela Politecnica Nacional"
              className="h-32 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurAliances;
