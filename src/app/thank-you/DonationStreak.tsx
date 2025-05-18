'use client';

import React from 'react';

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

// Función para calcular la racha de donaciones con línea cronológica
export function handleStreakCalculation(amount?: number): StreakData {
  // Obtener datos existentes o inicializar
  let streakData: StreakData;
  
  if (typeof window !== 'undefined') {
    const savedData = localStorage.getItem('donationStreak');
    if (savedData) {
      streakData = JSON.parse(savedData);
      
      // Asegurarse de que exista el historial en datos antiguos
      if (!streakData.donationHistory) {
        streakData.donationHistory = [];
        if (streakData.lastDonationDate) {
          streakData.donationHistory.push({
            date: streakData.lastDonationDate,
            amount: 0 // No tenemos el monto anterior
          });
        }
      }
    } else {
      streakData = {
        currentStreak: 0,
        lastDonationDate: null,
        longestStreak: 0,
        totalDonations: 0,
        donationHistory: []
      };
    }
  } else {
    streakData = {
      currentStreak: 0,
      lastDonationDate: null,
      longestStreak: 0,
      totalDonations: 0,
      donationHistory: []
    };
  }
  
  // Calcular nueva racha
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Si ya donó hoy, actualizar solo el monto si es mayor, pero no incrementar racha
  if (streakData.lastDonationDate === todayStr) {
    // Actualizar el último registro del historial si existe
    if (streakData.donationHistory.length > 0 && amount) {
      const lastDonation = streakData.donationHistory[streakData.donationHistory.length - 1];
      if (!lastDonation.amount || amount > lastDonation.amount) {
        lastDonation.amount = amount;
      }
    }
    
    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('donationStreak', JSON.stringify(streakData));
    }
    
    return streakData;
  }
  
  // Para propósitos de prueba, forzar incremento de racha siempre
  // SOLO PARA DESARROLLO - remover en producción
  let newStreak = streakData.currentStreak + 1;
  
  /* Código original comentado para pruebas
  // Verificar si la última donación fue dentro del mes (30 días)
  const lastDate = streakData.lastDonationDate ? new Date(streakData.lastDonationDate) : null;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  
  let newStreak = streakData.currentStreak;
  
  if (lastDate && (today.getTime() - lastDate.getTime() <= thirtyDaysMs)) {
    // Si hay racha activa, incrementar
    newStreak += 1;
  } else {
    // Iniciar nueva racha
    newStreak = 1;
    
    // Si hay una fecha de última donación y excede los 30 días, añadir un mensaje al historial
    if (lastDate && (today.getTime() - lastDate.getTime() > thirtyDaysMs)) {
      const breakDate = new Date(lastDate.getTime() + thirtyDaysMs);
      const breakDateStr = breakDate.toISOString().split('T')[0];
      
      // Añadir marca de interrupción de racha en la cronología
      streakData.donationHistory.push({
        date: breakDateStr,
        amount: 0,
        breakPoint: true
      });
    }
  }
  */
  
  // Calcular el nuevo total de donaciones
  const newTotalDonations = streakData.totalDonations + 1;
  
  // Verificar si esta donación es un hito (cada 5 donaciones)
  const isMilestone = newTotalDonations % 5 === 0;
  
  // Añadir esta donación al historial
  streakData.donationHistory.push({
    date: todayStr,
    amount: amount || 0,
    milestone: isMilestone
  });
  
  // Mantener solo las últimas 20 donaciones en el historial
  if (streakData.donationHistory.length > 20) {
    streakData.donationHistory = streakData.donationHistory.slice(-20);
  }
  
  // Actualizar datos
  const newStreakData = {
    currentStreak: newStreak,
    lastDonationDate: todayStr,
    longestStreak: Math.max(newStreak, streakData.longestStreak),
    totalDonations: newTotalDonations,
    donationHistory: streakData.donationHistory
  };
  
  // Guardar en localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('donationStreak', JSON.stringify(newStreakData));
  }
  
  console.log('Racha actualizada:', newStreakData);
  
  return newStreakData;
}

// Obtener historial de donaciones para la línea cronológica
export function getDonationHistory(): Array<{date: string, amount?: number}> {
  if (typeof window !== 'undefined') {
    const savedData = localStorage.getItem('donationStreak');
    if (savedData) {
      const data = JSON.parse(savedData);
      return data.donationHistory || [];
    }
  }
  return [];
}

// Verificar si una fecha está dentro de la racha actual
export function isDateInStreak(date: string): boolean {
  if (typeof window !== 'undefined') {
    const savedData = localStorage.getItem('donationStreak');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (!data.lastDonationDate) return false;
      
      const checkDate = new Date(date);
      const lastDate = new Date(data.lastDonationDate);
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      
      // Una fecha está en la racha si:
      // 1. Es posterior o igual a (última donación - (currentStreak-1)*30 días)
      // 2. Y es anterior o igual a la última donación
      
      const streakStartDate = new Date(lastDate.getTime() - (data.currentStreak - 1) * thirtyDaysMs);
      
      return checkDate >= streakStartDate && checkDate <= lastDate;
    }
  }
  return false;
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