'use client';

import streakService from '@/services/streakService';

export interface StreakData {
  currentStreak: number;
  lastDonationDate: string | null;
  longestStreak: number;
  totalDonations: number;
  // Historial de donaciones para la línea cronológica
  donationHistory: Array<{
    date: string;
    amount?: number;
    breakPoint?: boolean;
    milestone?: boolean; // Para marcar hitos especiales (cada 5 donaciones)
  }>;
}

export interface DonationStreakRef {
  handleDonation: (amount?: number) => void;
}

// Función para obtener la racha de donaciones desde la API
export async function fetchStreakFromAPI(): Promise<StreakData> {
  return await streakService.getStreak();
}

// Función para crear efecto confetti
export function createConfetti(container: HTMLElement, particleCount: number) {
  const colors = ['#FF7300', '#FFB347', '#FFD580', '#FFEDAD', '#009688'];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const size = Math.random() * 8 + 6; // 6-14px
    
    particle.classList.add('confetti-particle');
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.position = 'absolute';
    particle.style.top = '50%';
    particle.style.left = '50%';
    particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    particle.style.opacity = '1';
    particle.style.transform = `translate(-50%, -50%)`;
    particle.style.zIndex = '1000';
    
    // Random starting rotation
    const rotation = Math.random() * 360;
    
    // Random animation properties
    const duration = Math.random() * 2 + 1.5; // 1.5-3.5 seconds
    const xDistance = (Math.random() - 0.5) * 400; // -200px to 200px
    const yDistance = (Math.random() - 0.5) * 400 - 100; // -300px to 100px (biased upward)
    
    // Create and apply the animation
    particle.animate(
      [
        { transform: `translate(-50%, -50%) rotate(${rotation}deg)`, opacity: 1 },
        { transform: `translate(calc(-50% + ${xDistance}px), calc(-50% + ${yDistance}px)) rotate(${rotation + 360}deg)`, opacity: 0 }
      ],
      {
        duration: duration * 1000,
        easing: 'cubic-bezier(0.1, 1, 0.3, 1)'
      }
    );
    
    container.appendChild(particle);
    
    // Remove particle after animation completes
    setTimeout(() => {
      if (container.contains(particle)) {
        container.removeChild(particle);
      }
    }, duration * 1000);
  }
} 