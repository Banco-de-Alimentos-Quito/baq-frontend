import { EggPresentation, DeliveryFrequency, PricingOption } from "../types/huevo-zen";

export const PRICING_MATRIX: Record<EggPresentation, Record<DeliveryFrequency, PricingOption>> = {
  30: {
    1: {
      entregas_al_mes: 1,
      frecuenciaNombre: "Mensual",
      frecuenciaDescripcion: "1 entrega al mes",
      precioPorCubeta: 11.0,
      totalMensual: 11.0,
      totalHuevosMes: 30,
      ahorroPorCubeta: 0,
      ahorroMensual: 0,
      badge: "Plan Base",
    },
    2: {
      entregas_al_mes: 2,
      frecuenciaNombre: "Quincenal",
      frecuenciaDescripcion: "2 entregas al mes (cada 15 días)",
      precioPorCubeta: 10.0,
      totalMensual: 20.0,
      totalHuevosMes: 60,
      ahorroPorCubeta: 1.0,
      ahorroMensual: 2.0,
      badge: "Ahorra $2/mes",
    },
    4: {
      entregas_al_mes: 4,
      frecuenciaNombre: "Semanal",
      frecuenciaDescripcion: "4 entregas al mes (cada semana)",
      precioPorCubeta: 9.5,
      totalMensual: 38.0,
      totalHuevosMes: 120,
      ahorroPorCubeta: 1.5,
      ahorroMensual: 6.0,
      badge: "Mejor Valor • Ahorra $6/mes",
    },
  },
  12: {
    1: {
      entregas_al_mes: 1,
      frecuenciaNombre: "Mensual",
      frecuenciaDescripcion: "1 entrega al mes",
      precioPorCubeta: 5.0,
      totalMensual: 5.0,
      totalHuevosMes: 12,
      ahorroPorCubeta: 0,
      ahorroMensual: 0,
      badge: "Plan Base",
    },
    2: {
      entregas_al_mes: 2,
      frecuenciaNombre: "Quincenal",
      frecuenciaDescripcion: "2 entregas al mes (cada 15 días)",
      precioPorCubeta: 4.5,
      totalMensual: 9.0,
      totalHuevosMes: 24,
      ahorroPorCubeta: 0.5,
      ahorroMensual: 1.0,
      badge: "Ahorra $1/mes",
    },
    4: {
      entregas_al_mes: 4,
      frecuenciaNombre: "Semanal",
      frecuenciaDescripcion: "4 entregas al mes (cada semana)",
      precioPorCubeta: 4.0,
      totalMensual: 16.0,
      totalHuevosMes: 48,
      ahorroPorCubeta: 1.0,
      ahorroMensual: 4.0,
      badge: "Mejor Valor • Ahorra $4/mes",
    },
  },
};

export function getPricingOption(
  presentation: EggPresentation,
  frequency: DeliveryFrequency
): PricingOption {
  return PRICING_MATRIX[presentation][frequency];
}
