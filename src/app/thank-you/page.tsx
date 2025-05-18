'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StreakData, handleStreakCalculation, createConfetti } from './DonationStreak';
import DonationStreakPopup from './DonationStreakPopup';
import DonationStreakMinimized from './DonationStreakMinimized';
import Image from 'next/image';

export default function ThankYou() {
  // Estados para el manejo de la racha de donaciones
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastDonationDate: null,
    longestStreak: 0,
    totalDonations: 0,
    donationHistory: []
  });
  
  const [popupPhase, setPopupPhase] = useState<'loading' | 'complete' | 'minimized'>('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakAnimating, setStreakAnimating] = useState(false);
  const [donationHistory, setDonationHistory] = useState<Array<{date: string, amount?: number, breakPoint?: boolean, milestone?: boolean}>>([]);
  
  const confettiRef = useRef<HTMLDivElement | null>(null);
  
  // Lógica para compartir en redes sociales
  const shareText = '¡Acabo de hacer una donación al Banco de Alimentos Quito! Súmate tú también y ayuda a combatir el hambre en Ecuador.';
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://baq.ec/thank-you';
  const shareImage = '/thanks-image.jpeg';

  // Web Share API para compartir en móvil (incluyendo imagen si es posible)
  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Banco de Alimentos Quito',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // Cancelado o error
      }
    } else {
      alert('La función de compartir no está disponible en este navegador.');
    }
  }, [shareText, shareUrl]);
  
  // Simular carga y mostrar popup de racha
  useEffect(() => {
    // Mostrar popup después de 1 segundo
    const popupTimer = setTimeout(() => {
      setShowPopup(true);
      
      // Iniciar barra de progreso
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 2;
        setLoadingProgress(progress);
        
        if (progress >= 100) {
          clearInterval(progressInterval);
          
          // Calcular nueva racha
          const newStreakData = handleStreakCalculation();
          setStreakData(newStreakData);
          setDonationHistory(newStreakData.donationHistory);
          
          // Cambiar a fase completa
          setPopupPhase('complete');
          
          // Animar racha
          setStreakAnimating(true);
          setTimeout(() => setStreakAnimating(false), 500);
          
          // Mostrar efecto de confetti
          setShowConfetti(true);
          if (confettiRef.current) {
            createConfetti(confettiRef.current, 100);
          }
        }
      }, 30);
      
      return () => {
        clearInterval(progressInterval);
      };
    }, []);
    
    return () => {
      clearTimeout(popupTimer);
    };
  }, []);
  
  // Manejar cierre del popup
  const handleClosePopup = () => {
    setPopupPhase('minimized');
    setShowPopup(false);
  };
  
  // Manejar reapertura del popup minimizado
  const handleTogglePopup = () => {
    setPopupPhase('complete');
    setShowPopup(true);
  };
  
  // Reiniciar racha
  const resetStreak = () => {
    if (confirm('¿Estás seguro que deseas reiniciar tu racha de donaciones? Esta acción no se puede deshacer.')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('donationStreak');
        setStreakData({
          currentStreak: 0,
          lastDonationDate: null,
          longestStreak: 0,
          totalDonations: 0,
          donationHistory: []
        });
        setDonationHistory([]);
        
        // Opcional: mostrar mensaje de éxito
        alert('Tu racha de donaciones ha sido reiniciada correctamente.');
      }
    }
  };
  
  // Obtener mensaje de celebración basado en la racha
  const getCelebrationMessage = () => {
    const streak = streakData.currentStreak;
    if (streak === 1) return "¡Has iniciado tu racha de donaciones!";
    else if (streak >= 10) return "¡Increíble! Tu generosidad es extraordinaria.";
    else if (streak >= 5) return "¡Gran racha! Estás haciendo una diferencia.";
    else return "¡Gracias por mantener tu racha de donaciones!";
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[70vh]">
      {/* Mockup de celular con imagen */}
      <div className="flex justify-center items-center">
        <div className="relative w-[320px] h-[640px] bg-black rounded-[2.5rem] shadow-2xl border-4 border-gray-200 flex items-center justify-center overflow-hidden">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-2 bg-gray-300 rounded-full z-10" />
          <Image
            src="/thanks-image.jpeg"
            alt="Gracias por tu donación"
            fill
            className="object-cover rounded-[2.2rem]"
            priority
          />
        </div>
      </div>
      {/* Sección de agradecimiento y compartir */}
      <div className="rounded-lg border bg-card p-8 text-center shadow-sm flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">¡Gracias por tu donación!</h1>
        <p className="mb-6 text-lg">
          Tu donación ha sido procesada correctamente.
        </p>
        {/* Botones para compartir en redes sociales */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            title="Compartir en Facebook"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
            Facebook
          </a>
          {/* LinkedIn */}
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition"
            title="Compartir en LinkedIn"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
            LinkedIn
          </a>
          {/* Instagram (abrir perfil) */}
          <a
            href="https://www.instagram.com/baq.ec/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white rounded hover:opacity-90 transition"
            title="Ver Instagram de la Fundación"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.851s-.011 3.584-.069 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.011-4.85-.069c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.981.981-1.275 2.093-1.334 3.374C2.013 8.332 2 8.741 2 12c0 3.259.013 3.668.072 4.948.059 1.281.353 2.393 1.334 3.374.981.981 2.093 1.275 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.353 3.374-1.334.981-.981 1.275-2.093 1.334-3.374.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.281-.353-2.393-1.334-3.374-.981-.981-2.093-1.275-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            Instagram
          </a>
          {/* WhatsApp */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            title="Compartir en WhatsApp"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.029-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.363.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.617h-.001a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.455 4.436-9.89 9.893-9.89 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.896 6.994c-.003 5.456-4.438 9.891-9.893 9.891m8.413-18.304A11.815 11.815 0 0 0 12.05 0C5.495 0 .06 5.435.058 12.086c0 2.13.557 4.21 1.615 6.033L.057 24l6.063-1.594a11.876 11.876 0 0 0 5.929 1.523h.005c6.554 0 11.89-5.435 11.893-12.085a11.82 11.82 0 0 0-3.48-8.651"/></svg>
            WhatsApp
          </a>
          {/* Compartir nativo (Web Share API) */}
          <button
            onClick={handleNativeShare}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
            title="Compartir desde tu dispositivo"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8.59V5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3.59l1.3 1.3a1 1 0 0 0 1.4-1.42l-3-3a1 1 0 0 0-1.4 0l-3 3a1 1 0 0 0 1.4 1.42l1.3-1.3z"/></svg>
            Compartir
          </button>
        </div>
        <Link 
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-center font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Volver al inicio
        </Link>
      </div>
      
      {/* Popup de racha de donaciones */}
      {showPopup && (
        <DonationStreakPopup 
          streakData={streakData}
          popupPhase={popupPhase}
          loadingProgress={loadingProgress}
          handleClosePopup={handleClosePopup}
          resetStreak={resetStreak}
          showConfetti={showConfetti}
          streakAnimating={streakAnimating}
          confettiRef={confettiRef}
          donationHistory={donationHistory}
          getCelebrationMessage={getCelebrationMessage}
        />
      )}
      
      {/* Versión minimizada del popup */}
      {popupPhase === 'minimized' && (
        <DonationStreakMinimized 
          streakData={streakData}
          handleTogglePopup={handleTogglePopup}
        />
      )}
    </div>
  );
}