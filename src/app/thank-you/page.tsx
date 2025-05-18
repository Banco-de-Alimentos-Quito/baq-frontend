'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { StreakData, handleStreakCalculation, createConfetti } from './DonationStreak';
import DonationStreakPopup from './DonationStreakPopup';
import DonationStreakMinimized from './DonationStreakMinimized';

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
    }, 1000);
    
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
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h1>
        <p className="mb-6 text-lg">
          Tu pago ha sido procesado correctamente.
        </p>
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