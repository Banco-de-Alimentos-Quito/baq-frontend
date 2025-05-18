'use client';

import React from 'react';
import { StreakData } from './DonationStreak';
import { calculateProgressWidth } from './DonationStreakUtils';
import './DonationStreakStyles.css';

interface DonationStreakMinimizedProps {
  streakData: StreakData;
  handleTogglePopup: () => void;
}

export default function DonationStreakMinimized({
  streakData,
  handleTogglePopup
}: DonationStreakMinimizedProps) {
  
  // Calcular el progreso cuando el componente se monta
  React.useEffect(() => {
    calculateProgressWidth(streakData.totalDonations, 'points-container-mini');
  }, [streakData.totalDonations]);
  
  return (
    <div 
      className="popup-minimized"
      style={{ cursor: 'pointer', opacity: 1 }}
      onClick={handleTogglePopup}
    >
      <div className="streak-flame-small">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
        </svg>
      </div>
      <div className="popup-title-small">Racha de Donaciones:</div>
      <div className="streak-number-small">{streakData.currentStreak}</div>
      
      {/* Barra de puntos de progreso estilo juego */}
      <div className="points-bar-container">
        <div className="debug-info" style={{fontSize: '10px', textAlign: 'center', color: 'white', marginBottom: '3px'}}>
          <div>Donaciones: {streakData.totalDonations}</div>
        </div>
        <div className="points-progress-bar">
          <div className="milestone-label-left">0</div>
          <div className="points-container" id="points-container-mini" style={{position: 'relative'}}>
            {/* Línea que va del 0 al primer círculo */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              height: '1px',
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
              
              // Calcular la posición horizontal (5 está en 12.5%, cada incremento es 12.5%)
              const position = 12.5 + (index * 12.5);
              
              return (
                <div 
                  key={index} 
                  className={`progress-point ${isFilled ? 'filled' : 'empty'} ${isSpecialMilestone ? 'special-milestone' : ''}`}
                  title={`${pointValue} donaciones`}
                  style={{
                    position: 'absolute', 
                    left: `${position}%`, 
                    transform: 'translateX(-50%)',
                    width: '12px',
                    height: '12px',
                  }}
                >
                  {isSpecialMilestone && (
                    <div className="milestone-star-small" style={{
                      fontSize: '8px',
                      top: '-11px',
                    }}>★</div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="milestone-label-right">40</div>
        </div>
      </div>
    </div>
  );
} 