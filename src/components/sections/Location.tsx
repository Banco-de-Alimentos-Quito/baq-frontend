import React from "react";
import { Phone } from "lucide-react"; // Asumiendo que usas Lucide React para íconos; ajusta si es otra librería

const contactList = [
  { type: "Dirección", value: "direccion@baq.ec" },
  { type: "Comunicación", value: "comunicacion@baq.ec" },
  { type: "Alianzas(para realizar dinaciones)", value: "alianzas@baq.ec" },
  {
    type: "Gestión Social(Para solicitar donaciones)",
    value: "gestionsocial@baq.ec",
  },
  { type: "Talento Humano", value: "talentohumano@baq.ec" },
];

const phoneList = [
  { type: "Recepción Donaciones", value: "099 5450 969" },
  { type: "Vinculación Organizaciones Sociales", value: "097 8655 501" },
];

export default function Location() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-orange-500 mb-4 text-left">
            Visítanos en:
          </h2>
          <div className="w-full h-0.5 bg-orange-500 mb-4"></div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Parte izquierda: Oficinas y Contacto */}
          <div className="lg:w-1/2 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Oficinas
            </h3>
            <p className="text-gray-600 mb-6">
              Av. Pedro V. Maldonado S15-238 y Balzar
            </p>
            <div className="w-2/3 h-0.5 bg-orange-500 mb-4 mx-auto"></div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Contactos:
            </h3>
            <div className="w-2/3 h-0.5 bg-white mb-4 mx-auto"></div>
            {contactList.map((contact, index) => (
              <p key={index} className="text-gray-600 mb-2">
                <span className="font-bold">{contact.type}:</span>{" "}
                {contact.value}
              </p>
            ))}
          </div>

          {/* Parte derecha: Imagen y Mapa */}
          <div className="lg:w-1/2">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7736407304797!2d-78.52965222551619!3d-0.2711540997261691!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d599c062c64f1d%3A0x84f51141f335fc85!2sBanco%20de%20Alimentos%20Quito!5e0!3m2!1ses!2sec!4v1758301534973!5m2!1ses!2sec"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de ubicación"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
