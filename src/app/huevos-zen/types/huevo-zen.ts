export type EggPresentation = 12 | 30;

export type DeliveryFrequency = 1 | 2 | 4;

export interface PricingOption {
  entregas_al_mes: DeliveryFrequency;
  frecuenciaNombre: string;
  frecuenciaDescripcion: string;
  precioPorCubeta: number;
  totalMensual: number;
  totalHuevosMes: number;
  ahorroPorCubeta: number;
  ahorroMensual: number;
  badge?: string;
}

export interface HuevoZenPayload {
  cedula_ruc: string;
  nombres_completos: string;
  numero_telefono: string;
  correo_electronico: string;
  ciudad?: string;
  direccion: string;
  google_maps_url?: string;
  banco_cooperativa: string;
  numero_cuenta: string;
  tipo_cuenta: 'Ahorros' | 'Corriente';
  presentacion_unidades: EggPresentation;
  entregas_al_mes: DeliveryFrequency;
  total_mensual_usd: number;
  acepta_aporte_voluntario: boolean;
  acepta_tratamiento_datos: boolean;
  archivo_cedula?: string;
}
