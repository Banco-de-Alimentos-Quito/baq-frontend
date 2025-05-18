'use client';

import React, { useEffect } from 'react';
import { StreakData } from './DonationStreak';
import { calculateProgressWidth } from './DonationStreakUtils';
import './DonationStreakStyles.css';

interface DonationStreakPopupProps {
  streakData: StreakData;
  popupPhase: 'loading' | 'complete' | 'minimized';
  loadingProgress: number;
  handleClosePopup: () => void;
  resetStreak: () => void;
  showConfetti: boolean;
  streakAnimating: boolean;
  confettiRef: React.RefObject<HTMLDivElement | null>;
  donationHistory: Array<{date: string, amount?: number, breakPoint?: boolean, milestone?: boolean}>;
  getCelebrationMessage: () => string;
}

export default function DonationStreakPopup({
  streakData,
  popupPhase,
  loadingProgress,
  handleClosePopup,
  resetStreak,
  showConfetti,
  streakAnimating,
  confettiRef,
  donationHistory,
  getCelebrationMessage
}: DonationStreakPopupProps) {
  
  return (
    <div className="popup-overlay">
      <div className="popup-container">
        {popupPhase === 'complete' && (
          <button className="close-btn" onClick={handleClosePopup}>✕</button>
        )}
        
        {/* Barra de progreso */}
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${loadingProgress}%` }} />
        </div>
        
        {/* Título del popup */}
        <div className="popup-title">
          <div className="streak-flame">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
            </svg>
          </div>
          Racha de Donaciones
        </div>
        
        {/* Número de racha */}
        <div className={`streak-number ${streakAnimating ? 'animate-streak' : ''}`}>
          {popupPhase === 'loading' ? (
            <div
              className="loading-animation"
              style={{opacity: 0.8, scale: 0.9}}
            >
              {streakData.currentStreak}
            </div>
          ) : (
            streakData.currentStreak
          )}
        </div>
        
        {/* Mensaje basado en fase de popup */}
        <div className="streak-message">
          {popupPhase === 'loading' 
            ? "Procesando tu donación..." 
            : getCelebrationMessage()
          }
        </div>
        
        {/* Línea cronológica de donaciones */}
        {popupPhase === 'complete' && donationHistory.length > 0 && (
          <div className="donation-timeline">
            <h3 className="timeline-title">Tu progreso de donaciones</h3>
            
            {/* Barra de progreso estilo videojuego */}
            <div className="points-bar-container">
              <div className="debug-info">
                <div>Donaciones: {streakData.totalDonations}</div>
              </div>
              <div className="points-progress-bar">
                <div className="milestone-label-left">0</div>
                <div className="points-container" id="points-container-main" style={{position: 'relative'}}>
                  {/* Línea que va del 0 al primer círculo */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    height: '2px',
                    width: '12.5%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-50%)',
                    zIndex: 1
                  }}></div>
                  
                  {/* Círculos solo en múltiplos de 5 (sin círculo en 0) */}
                  {Array(8).fill(0).map((_, index) => {
                    // Usar valores fijos para los puntos (5, 10, 15, 20, 25, 30, 35, 40)
                    const pointValue = (index + 1) * 5;
                    const isFilled = streakData.totalDonations >= pointValue;
                    const isSpecialMilestone = pointValue % 10 === 0;
                    
                    // Calcular el progreso solo una vez por renderizado
                    if (index === 0) {
                      calculateProgressWidth(streakData.totalDonations, 'points-container-main');
                      console.log("Progress calculation - Total donations:", streakData.totalDonations);
                    }
                    
                    // Calcular la posición horizontal (5 está en 12.5%, cada incremento es 12.5%)
                    const position = 12.5 + (index * 12.5);
                    
                    return (
                      <div 
                        key={index} 
                        className={`progress-point ${isFilled ? 'filled' : 'empty'} ${isSpecialMilestone ? 'special-milestone' : ''}`}
                        title={`${pointValue} donaciones`}
                        style={{position: 'absolute', left: `${position}%`, transform: 'translateX(-50%)'}}
                      >
                        {isSpecialMilestone && (
                          <div className="milestone-star-small">★</div>
                        )}
                        <div style={{
                          position: 'absolute',
                          bottom: '-22px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '9px',
                          color: 'rgba(255, 255, 255, 0.9)'
                        }}>
                          {pointValue}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="milestone-label-right">40</div>
              </div>
            </div>
            
            <div className="timeline-info">
              {streakData.currentStreak > 0 ? (
                <div className="timeline-streak-active">¡Mantén tu racha donando en los próximos 30 días!</div>
              ) : (
                <div className="timeline-streak-lost">Tu racha se ha interrumpido. ¡Dona hoy para comenzar una nueva!</div>
              )}
            </div>
          </div>
        )}
        
        {/* Estadísticas (solo visibles en fase completa) */}
        {popupPhase === 'complete' && (
          <div className="streak-stats">
            <div className="stat-item">
              <div className="stat-value">{streakData.longestStreak}</div>
              <div className="stat-label">Mejor racha</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{streakData.totalDonations}</div>
              <div className="stat-label">Total donaciones</div>
            </div>
          </div>
        )}
        
        {/* Botón de reinicio de racha */}
        {popupPhase === 'complete' && (
          <div className="reset-streak-container">
            <button 
              className="reset-streak-btn"
              onClick={resetStreak}
            >
              Reiniciar racha
            </button>
          </div>
        )}
        
        {/* Contenedor para efectos de confetti */}
        <div ref={confettiRef} className="confetti-container"></div>
        
        {/* Efecto de resplandor */}
        <div className={`glow-effect ${showConfetti ? 'active' : ''}`}></div>
      </div>
    </div>
  );
} 