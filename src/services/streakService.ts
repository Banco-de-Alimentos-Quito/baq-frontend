'use client';

import { getOrCreateUserId } from "@/app/utils/utils";

export interface StreakApiResponseSuccess {
  racha_actual: number;
  mejor_racha: number;
  cantidad_donaciones: number;
}

export interface StreakData {
  currentStreak: number;
  lastDonationDate: string | null;
  longestStreak: number;
  totalDonations: number;
  donationHistory: Array<{
    date: string;
    amount?: number;
    breakPoint?: boolean;
    milestone?: boolean;
  }>;
}

class StreakService {
  private static instance: StreakService;
  private baseUrl: string;

  private constructor() {
    // Endpoint real del backend
    this.baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/rachas/verification`;
  }

  public static getInstance(): StreakService {
    if (!StreakService.instance) {
      StreakService.instance = new StreakService();
    }
    return StreakService.instance;
  }

  public async getStreak(): Promise<StreakData> {
    try {
      const userId = getOrCreateUserId();

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // enviar ambos nombres por compatibilidad backend
        body: JSON.stringify({ userId, user_id: userId }),
      });

      // intentar parsear JSON aunque sea un error
      const text = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('streakService -> respuesta no JSON:', text);
        throw new Error('Respuesta no JSON del backend');
      }

      // Backend puede devolver { status: "error", message: "..." }
      if (!response.ok || data?.status === 'error') {
        console.warn('streakService -> backend error response:', data);
        throw new Error(data?.message || `HTTP ${response.status}`);
      }

      // Mapear campos esperados
      return this.mapApiResponseToStreakData(data as StreakApiResponseSuccess);
    } catch (error) {
      console.error('Error al obtener datos de racha en streakService:', error);
      return this.getDefaultStreakData();
    }
  }

  private mapApiResponseToStreakData(apiData: StreakApiResponseSuccess): StreakData {
    return {
      currentStreak: typeof apiData.racha_actual === 'number' ? apiData.racha_actual : 0,
      lastDonationDate: new Date().toISOString(), // si backend no devuelve fecha, usar ahora()
      longestStreak: typeof apiData.mejor_racha === 'number' ? apiData.mejor_racha : 0,
      totalDonations: typeof apiData.cantidad_donaciones === 'number' ? apiData.cantidad_donaciones : 0,
      donationHistory: [],
    };
  }

  private getDefaultStreakData(): StreakData {
    return {
      currentStreak: 0,
      lastDonationDate: null,
      longestStreak: 0,
      totalDonations: 0,
      donationHistory: [],
    };
  }

}

export default StreakService.getInstance();
