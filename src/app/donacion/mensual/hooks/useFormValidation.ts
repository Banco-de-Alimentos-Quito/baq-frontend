import { useState } from 'react';
import { DocumentValidatorFactory } from '../validators/documentValidators';

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
  gestorDonacion: string;
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
  const [documentType, setDocumentType] = useState<string | null>(null);

  const validateDocument = (document: string): { isValid: boolean; type: string | null; message?: string } => {
    if (!document.trim()) {
      return { isValid: false, type: null, message: 'Campo requerido' };
    }

    const result = DocumentValidatorFactory.validateDocument(document);
    
    if (!result.isValid && result.type) {
      return { 
        isValid: false, 
        type: result.type, 
        message: `${result.type} inválido/a. Verifica el formato.` 
      };
    }
    
    if (!result.type) {
      return { 
        isValid: false, 
        type: null, 
        message: 'Formato de documento no reconocido' 
      };
    }

    return { isValid: true, type: result.type };
  };

  // Mantener función legacy para compatibilidad
  const validateEcuadorianId = (id: string): boolean => {
    const result = validateDocument(id);
    return result.isValid;
  };

  const validateField = (name: keyof FormData, value: string) => {
    let isValid: boolean | null = null;
    let errorMessage = '';

    switch (name) {
      case 'cedula':
        if (value) {
          const docResult = validateDocument(value);
          isValid = docResult.isValid;
          setDocumentType(docResult.type);
          if (!isValid) {
            errorMessage = docResult.message || 'Documento inválido. Verifica el formato.';
          }
        } else {
          setDocumentType(null);
        }
        break;

      case 'correo':
        if (value) {
          // Validación mejorada de correo electrónico
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const hasMultipleAt = (value.match(/@/g) || []).length > 1;
          const hasValidDomain = value.includes('@') && value.split('@')[1] && value.split('@')[1].includes('.');
          
          isValid = emailRegex.test(value) && !hasMultipleAt && hasValidDomain;
          if (!isValid) {
            if (hasMultipleAt) {
              errorMessage = 'El correo no puede contener múltiples símbolos @.';
            } else if (!hasValidDomain) {
              errorMessage = 'El dominio del correo debe incluir un punto.';
            } else {
              errorMessage = 'Formato de correo electrónico inválido.';
            }
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

      case 'gestorDonacion':
        if (value) {
          isValid = value.trim().length >= 2;
          if (!isValid) {
            errorMessage = 'Debe seleccionar un gestor de donación.';
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
    documentType,
    validateField,
    clearValidation,
    validateEcuadorianId,
    validateDocument
  };
}