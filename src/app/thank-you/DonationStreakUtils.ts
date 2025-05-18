'use client';

/**
 * Calcula el ancho de la barra de progreso basado en el número de donaciones
 */
export const calculateProgressWidth = (totalDonations: number, containerId: string) => {
  // Máximo de donaciones consideradas: 40
  const maxDonations = 40;
  
  // Si no hay donaciones, barra vacía
  if (totalDonations === 0) {
    setTimeout(() => {
      const container = document.getElementById(containerId);
      if (container) {
        container.style.setProperty('--progress-width', '0%');
      }
    }, 10);
    return;
  }
  
  // Para el nuevo diseño: 0-5 es 0-12.5%, luego cada 5 donaciones es 12.5% adicional
  let progressPercentage;
  
  if (totalDonations < 5) {
    // Entre 0 y 5, hacemos una regla de tres: 0 -> 0%, 5 -> 12.5%
    progressPercentage = (totalDonations / 5) * 12.5;
  } else {
    // Para 5 o más, calculamos la posición exacta
    const completeSections = Math.floor(totalDonations / 5); // Cantidad de secciones completas (5, 10, 15...)
    const remainder = totalDonations % 5; // Donaciones extra después de la última sección completa
    
    // Calculamos el porcentaje base (12.5% por cada sección completa)
    const basePercentage = completeSections * 12.5;
    
    // Si hay remainder, añadimos el porcentaje proporcional de la siguiente sección
    const extraPercentage = (remainder / 5) * 12.5;
    
    // Combinamos ambos, asegurándonos de no superar el 100%
    progressPercentage = Math.min(100, basePercentage + extraPercentage);
  }
  
  setTimeout(() => {
    const container = document.getElementById(containerId);
    if (container) {
      container.style.setProperty('--progress-width', `${progressPercentage}%`);
      console.log(`Setting progress to ${progressPercentage}% for ${totalDonations} donations`);
    }
  }, 10);
}; 