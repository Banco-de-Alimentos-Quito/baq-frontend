// Donación Mensual types and interfaces

export interface DonacionMensualFormData {
  cedula: string;
  nombres: string;
  genero: string;
  correo: string;
  direccion: string;
  cuenta: string;
  tipoCuenta: string;
  banco: string;
  otroBanco?: string;
  monto: number;
}

export interface DonacionMensualColumnValues {
  text_mkryzaya?: string;      // cedula/RUC (texto)
  text_mkrykcyf?: string;      // nombreCompleto (texto)
  text_mks6a5we?: string;      // genero (texto)
  email_mkryzdsz?: { email: string; text: string }; // correo (email column)
  text_mkryg7b1?: string;      // direccion (texto)
  text_mkrys5rv?: string;      // numeroCuenta (texto)
  text_mkrye04e?: string;      // tipoCuenta (texto)
  text_mkryjz6f?: string;      // bancoCooperativa (texto)
  numeric_mkrz6a5?: number;    // monto (numero)
}

export interface DonacionMensualItemData {
  boardId: string;
  groupId: string;
  itemName: string;
  columnValues: DonacionMensualColumnValues | Record<string, string | number | { email: string; text: string }>;
}

export interface DonacionMensualCreateItemResponse {
  data?: {
    create_item?: {
      id: string;
      name: string;
    }
  };
  errors?: Array<{
    message: string;
    extensions?: Record<string, unknown>;
  }>;
}

// Constantes del board de donaciones mensuales
export const DONACION_MENSUAL_CONFIG = {
  BOARD_ID: process.env.MONDAY_BOARD_ID_RECURRENT,
  GROUP_ID: process.env.MONDAY_GROUP_ID_RECURRENT,
  COLUMNS: {
    CEDULA: 'text_mkryzaya',
    NOMBRE_COMPLETO: 'text_mkrykcyf',
    GENERO: 'text_mks6a5we',
    CORREO: 'email_mkryzdsz',
    DIRECCION: 'text_mkryg7b1',
    NUMERO_CUENTA: 'text_mkrys5rv',
    TIPO_CUENTA: 'text_mkrye04e',
    BANCO_COOPERATIVA: 'text_mkryjz6f',
    MONTO: 'numeric_mkrz6a5'
  }
} as const;

// Validación estricta de variables de entorno requeridas
if (!DONACION_MENSUAL_CONFIG.BOARD_ID) {
  throw new Error('❌ MONDAY_BOARD_ID_RECURRENT environment variable is required');
}

if (!DONACION_MENSUAL_CONFIG.GROUP_ID) {
  throw new Error('❌ MONDAY_GROUP_ID_RECURRENT environment variable is required');
}

console.log('✅ Donación Mensual configuration loaded successfully:', {
  BOARD_ID: DONACION_MENSUAL_CONFIG.BOARD_ID,
  GROUP_ID: DONACION_MENSUAL_CONFIG.GROUP_ID
});

export const DONACION_MENSUAL_COLUMNS = {
  cedula: 'text_mkryzaya',
  nombreCompleto: 'text_mkrykcyf',
  genero: 'text_mks6a5we',
  correo: 'email_mkryzdsz',
  direccion: 'text_mkryg7b1',
  numeroCuenta: 'text_mkrys5rv',
  tipoCuenta: 'text_mkrye04e',
  bancoCooperativa: 'text_mkryjz6f',
  monto: 'numeric_mkrz6a5'
} as const; 