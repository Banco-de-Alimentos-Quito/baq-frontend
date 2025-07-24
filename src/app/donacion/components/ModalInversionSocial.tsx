import React, { useEffect, useState } from "react";
import Image from "next/image";

interface ModalInversionSocialProps {
  isOpen: boolean;
  onClose: () => void;
}

const historias = [
  {
    nombre: "Juanita, 7 años",
    imagen: "/historias/images_histories1.jpg",
    texto:
      "Juanita vive en el barrio El Progreso. Gracias a tu donación, ella y su familia reciben alimentos nutritivos cada semana. Ahora, Juanita puede ir a la escuela con energía y una gran sonrisa.",
    cita: "“Gracias por ayudarme a crecer fuerte y feliz.”",
  },
  {
    nombre: "Carlos, 10 años",
    imagen: "/historias/images_histories2.jpg",
    texto:
      "Carlos superó la desnutrición y hoy sueña con ser futbolista. Tu aporte hizo posible que reciba atención médica y una alimentación adecuada.",
    cita: "“Ahora corro y juego con mis amigos todos los días.”",
  },
  {
    nombre: "María, mamá de 3 niños",
    imagen: "/historias/images_histories3.jpg",
    texto:
      "María pudo abrir su pequeño negocio gracias al apoyo recibido. Hoy puede alimentar a sus hijos y darles un futuro mejor.",
    cita: "“Gracias por darme esperanza para mi familia.”",
  },
];

export default function ModalInversionSocial({ isOpen, onClose }: ModalInversionSocialProps) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setIndex(0); // Reinicia al abrir el modal
    setFade(true);
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev === historias.length - 1 ? 0 : prev + 1));
        setFade(true);
      }, 400); // Duración del fade-out
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const historia = historias[index];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          className="absolute top-4 right-4 text-2xl text-[#c0392b] hover:text-[#a93226]"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-extrabold text-[#c0392b] mb-4 text-center">
          Historias de algunos de nuestros beneficiarios
        </h2>
        <div
          className={`flex flex-col items-center transition-opacity duration-400 ${fade ? "opacity-100" : "opacity-0"}`}
        >
          <div className="w-full flex justify-center mb-4">
            <div className="relative w-[260px] h-[174px] rounded-xl overflow-hidden shadow-md">
              <Image
                src={historia.imagen}
                alt={historia.nombre}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 640px) 100vw, 260px"
                className="rounded-xl"
                priority
              />
            </div>
          </div>
          <h3 className="text-xl font-bold text-[#2F3388] mb-2">{historia.nombre}</h3>
          <p className="text-gray-700 text-lg text-center mb-4">
            {historia.texto}
          </p>
          <div className="bg-[#ff7300] text-white rounded-lg px-5 py-3 font-semibold text-center mb-4">
            {historia.cita}
          </div>
          <span className="text-base text-gray-500">
            {index + 1} / {historias.length}
          </span>
        </div>
      </div>
    </div>
  );
}