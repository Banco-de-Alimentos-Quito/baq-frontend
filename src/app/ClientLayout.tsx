"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingModal from "../components/LoadingModal";

const MIN_LOADING_TIME = 900; // ms
const CONTENT_TRANSITION_DELAY = 400; // ms después de que el modal empiece a desaparecer

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para mostrar loading
  const showLoading = () => {
    setIsTransitioning(true);
    setLoading(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setTimeout(() => {
        setIsTransitioning(false);
      }, CONTENT_TRANSITION_DELAY);
    }, MIN_LOADING_TIME);
  };

  useEffect(() => {
    showLoading();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  // Escuchar evento del Header
  useEffect(() => {
    const handleShowLoading = () => showLoading();
    window.addEventListener('show-loading', handleShowLoading);
    return () => window.removeEventListener('show-loading', handleShowLoading);
  }, []);

  return (
    <>
      {/* Contenido que se "congela" durante la transición */}
      <div className={`transition-opacity duration-300 ${
        isTransitioning ? 'pointer-events-none select-none' : 'pointer-events-auto'
      }`}>
        {children}
      </div>
      
      {/* Modal de carga por encima */}
      <LoadingModal show={loading} />
    </>
  );
}