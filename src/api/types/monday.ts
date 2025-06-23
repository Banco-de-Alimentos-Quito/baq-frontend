// Monday.com types and interfaces

export interface MondayColumnValues {
  // Columnas que se envían inmediatamente desde PayPal webhook
  text_mkrxarv5?: string;      // nombre (string)
  email_mkrxg5ct?: { email: string; text: string }; // correo electronico (email column)
  numeric_mkrxs38c?: number;   // monto (number)
  text_mkrx27e5?: string;      // pais (string - código como "EC")
  text_mkrx4w4m?: string;      // ciudad (string)
  date?: string;               // fechadonacion (string en formato YYYY-MM-DD)
  
  // Columnas que se actualizarán posteriormente
  phone_mkrxxch9?: { phone: string; countryShortName: string }; // telefono
  date_mkrxxa9b?: string;      // fecha nacimiento (string en formato YYYY-MM-DD)
}

export interface MondayItemData {
  boardId: string;
  groupId: string;
  itemName: string;  // contact field
  columnValues: MondayColumnValues | Record<string, string | number | { email: string; text: string }>;
}

export interface MondayCreateItemResponse {
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

export interface MondayUpdateItemResponse {
  data?: {
    change_multiple_column_values?: {
      id: string;
    }
  };
  errors?: Array<{
    message: string;
    extensions?: Record<string, unknown>;
  }>;
}

// Constantes del board
export const MONDAY_CONFIG = {
  BOARD_ID: process.env.MONDAY_BOARD_ID,
  GROUP_ID: process.env.MONDAY_GROUP_ID,
  COLUMNS: {
    NOMBRE: 'text_mkrxarv5',
    EMAIL: 'email_mkrxg5ct',
    TELEFONO: 'phone_mkrxxch9',
    MONTO: 'numeric_mkrxs38c',
    FECHA_NACIMIENTO: 'date_mkrxxa9b',
    PAIS: 'text_mkrx27e5',
    CIUDAD: 'text_mkrx4w4m',
    FECHA_DONACION: 'date'
  }
} as const;

// Validación estricta de variables de entorno requeridas
if (!MONDAY_CONFIG.BOARD_ID) {
  throw new Error(' MONDAY_BOARD_ID environment variable is required');
}

if (!MONDAY_CONFIG.GROUP_ID) {
  throw new Error('MONDAY_GROUP_ID environment variable is required');
}

console.log('✅ Monday.com configuration loaded successfully:', {
  BOARD_ID: MONDAY_CONFIG.BOARD_ID,
  GROUP_ID: MONDAY_CONFIG.GROUP_ID
});

export const MONDAY_COLUMNS = {
  name: 'text_mkrxarv5',
  email: 'email_mkrxg5ct',
  phone: 'phone_mkrxxch9',
  amount: 'numeric_mkrxs38c',
  birthDate: 'date_mkrxxa9b',
  country: 'text_mkrx27e5',
  city: 'text_mkrx4w4m',
  donationDate: 'date'
} as const;

export const COLUMN_FORMATS = {
  [MONDAY_COLUMNS.name]: (value: string) => value,
  [MONDAY_COLUMNS.email]: (value: string) => ({
    email: value,
    text: value
  }),
  [MONDAY_COLUMNS.phone]: (value: string) => ({ phone: value, countryShortName: 'EC' }),
  [MONDAY_COLUMNS.amount]: (value: number) => value,
  [MONDAY_COLUMNS.birthDate]: (value: string) => value,
  [MONDAY_COLUMNS.country]: (value: string) => value,
  [MONDAY_COLUMNS.city]: (value: string) => value,
  [MONDAY_COLUMNS.donationDate]: (value: string) => value
} as const; 