// Monday.com types and interfaces

export interface MondayColumnValues {
  // Columnas que se envían inmediatamente desde PayPal webhook
  text_mkreghav?: string;      // nombre (string)
  email_mkrnmh1e?: { email: string; text: string }; // correo electronico (email column)
  numeric_mkrer28d?: number;   // monto (number)
  text_mkrmebsq?: string;      // pais (string - código como "EC")
  text_mkrmse6w?: string;      // ciudad (string)
  date_mkrfw5g?: string;       // fechadonacion (string en formato YYYY-MM-DD)
  
  // Columnas que se actualizarán posteriormente
  phone_mkrgz8x?: { phone: string; countryShortName: string }; // telefono
  date_mkrfvx99?: string;      // fecha nacimiento (string en formato YYYY-MM-DD)
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
  BOARD_ID: process.env.MONDAY_BOARD_ID || '9254420270',
  GROUP_ID: process.env.MONDAY_GROUP_ID || 'group_mkrevg55',
  COLUMNS: {
    NOMBRE: 'text_mkreghav',
    EMAIL: 'email_mkrnmh1e', // Updated to email column
    TELEFONO: 'phone_mkrgz8x',
    MONTO: 'numeric_mkrer28d',
    FECHA_NACIMIENTO: 'date_mkrfvx99',
    PAIS: 'text_mkrmebsq',
    CIUDAD: 'text_mkrmse6w',
    FECHA_DONACION: 'date_mkrfw5g'
  }
} as const;

export const MONDAY_COLUMNS = {
  name: 'text_mkreghav',
  email: 'email_mkrnmh1e',
  phone: 'phone_mkrgz8x',
  amount: 'numeric_mkrer28d',
  birthDate: 'date_mkrfvx99',
  country: 'text_mkrmebsq',
  city: 'text_mkrmse6w',
  donationDate: 'date_mkrfw5g'
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