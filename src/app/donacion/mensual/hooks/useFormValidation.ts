import { useState } from 'react';

export type FormData = {
  cedula: string;
  nombres: string;
  numero: string;
  correo: string;
  direccion: string;
  cuenta: string;
  tipoCuenta: string;
  banco: string;
  otroBanco: string;
  ciudad: string;
  acepta: boolean;
};

export type ValidationState = {
  [K in keyof FormData]?: boolean | null;
};

export type ErrorState = {
  [K in keyof FormData]?: string;
};

export function useFormValidation() {
  const [errors, setErrors] = useState<ErrorState>({});
  const [validationState, setValidationState] = useState<ValidationState>({});

  const validateEcuadorianId = (id: string): boolean => {
    const cleanId = id.replace(/\D/g, '');
    if (cleanId.length !== 10 && cleanId.length !== 13) {
      return false;
    }

    const cedula = cleanId.length === 13 ? cleanId.substring(0, 10) : cleanId;
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      let digit = parseInt(cedula[i]) * coefficients[i];
      if (digit >= 10) {
        digit -= 9;
      }
      sum += digit;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    const lastDigit = parseInt(cedula[9]);
    return checkDigit === lastDigit;
  };

  const validateField = (name: keyof FormData, value: string) => {
    let isValid: boolean | null = null;
    let errorMessage = '';

    switch (name) {
      case 'cedula':
        if (value) {
          isValid = validateEcuadorianId(value);
          if (!isValid) {
            errorMessage = 'Cédula/RUC inválido. Verifica el formato.';
          }
        }
        break;

      case 'correo':
        if (value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          isValid = emailRegex.test(value);
          if (!isValid) {
            errorMessage = 'Formato de correo electrónico inválido.';
          }
        }
        break;

      case 'numero':
        if (value) {
          const cleanPhone = value.replace(/\D/g, '');
          isValid = cleanPhone.length >= 9 && cleanPhone.length <= 15;
          if (!isValid) {
            errorMessage = 'Debe tener entre 9 y 15 dígitos.';
          }
        }
        break;

      case 'cuenta':
        if (value) {
          const cleanAccount = value.replace(/\D/g, '');
          isValid = cleanAccount.length >= 8 && cleanAccount.length <= 20;
          if (!isValid) {
            errorMessage = 'Debe tener entre 8 y 20 dígitos.';
          }
        }
        break;

      case 'nombres':
        if (value) {
          isValid = value.trim().length >= 3;
          if (!isValid) {
            errorMessage = 'Debe tener al menos 3 caracteres.';
          }
        }
        break;

      case 'direccion':
        if (value) {
          isValid = value.trim().length >= 5;
          if (!isValid) {
            errorMessage = 'Debe tener al menos 5 caracteres.';
          }
        }
        break;

      case 'ciudad':
        if (value) {
          isValid = value.trim().length >= 2;
          if (!isValid) {
            errorMessage = 'Debe tener al menos 2 caracteres.';
          }
        }
        break;

    }

    setValidationState(prev => ({ ...prev, [name]: isValid }));
    setErrors(prev => ({ ...prev, [name]: errorMessage }));

    return isValid;
  };

  const clearValidation = () => {
    setErrors({});
    setValidationState({});
  };

  return {
    errors,
    validationState,
    validateField,
    clearValidation,
    validateEcuadorianId
  };
}
