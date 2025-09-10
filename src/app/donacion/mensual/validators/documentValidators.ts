// Patrón Strategy para validación de documentos
export interface DocumentValidator {
  validate(document: string): boolean;
  getType(): string;
  getPattern(): RegExp;
}

// Validador de Cédula Ecuatoriana
export class CedulaValidator implements DocumentValidator {
  validate(cedula: string): boolean {
    // Limpiar la cédula
    const cleanCedula = cedula.replace(/\D/g, '');
    
    // Verificar longitud
    if (cleanCedula.length !== 10) return false;
    
    // Verificar que los dos primeros dígitos sean válidos (01-24)
    const provincia = parseInt(cleanCedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;
    
    // Verificar que el tercer dígito sea menor a 6 (para cédulas)
    const tercerDigito = parseInt(cleanCedula.charAt(2));
    if (tercerDigito >= 6) return false;
    
    // Algoritmo de validación
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    
    for (let i = 0; i < 9; i++) {
      let resultado = parseInt(cleanCedula.charAt(i)) * coeficientes[i];
      if (resultado >= 10) {
        resultado = resultado - 9;
      }
      suma += resultado;
    }
    
    const digitoVerificador = parseInt(cleanCedula.charAt(9));
    const modulo = suma % 10;
    const digitoCalculado = modulo === 0 ? 0 : 10 - modulo;
    
    return digitoCalculado === digitoVerificador;
  }
  
  getType(): string {
    return 'Cédula';
  }
  
  getPattern(): RegExp {
    return /^[0-2][0-9][0-5][0-9]{7}$/;
  }
}

// Validador de RUC Ecuatoriano
export class RucValidator implements DocumentValidator {
  validate(ruc: string): boolean {
    // Limpiar el RUC
    const cleanRuc = ruc.replace(/\D/g, '');
    
    // Verificar longitud
    if (cleanRuc.length !== 13) return false;
    
    // Verificar que los dos primeros dígitos sean válidos (01-24)
    const provincia = parseInt(cleanRuc.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;
    
    const tercerDigito = parseInt(cleanRuc.charAt(2));
    
    // RUC de persona natural (tercer dígito < 6)
    if (tercerDigito < 6) {
      // Validar como cédula los primeros 10 dígitos
      const cedula = cleanRuc.substring(0, 10);
      const cedulaValidator = new CedulaValidator();
      if (!cedulaValidator.validate(cedula)) return false;
      
      // Los últimos 3 dígitos deben ser 001
      return cleanRuc.substring(10) === '001';
    }
    
    // RUC de empresa privada (tercer dígito = 9)
    if (tercerDigito === 9) {
      const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
      let suma = 0;
      
      for (let i = 0; i < 9; i++) {
        suma += parseInt(cleanRuc.charAt(i)) * coeficientes[i];
      }
      
      const digitoVerificador = parseInt(cleanRuc.charAt(9));
      const modulo = suma % 11;
      const digitoCalculado = modulo < 2 ? modulo : 11 - modulo;
      
      if (digitoCalculado !== digitoVerificador) return false;
      
      // Los últimos 3 dígitos deben ser 001
      return cleanRuc.substring(10) === '001';
    }
    
    // RUC de entidad pública (tercer dígito = 6)
    if (tercerDigito === 6) {
      const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
      let suma = 0;
      
      for (let i = 0; i < 8; i++) {
        suma += parseInt(cleanRuc.charAt(i)) * coeficientes[i];
      }
      
      const digitoVerificador = parseInt(cleanRuc.charAt(8));
      const modulo = suma % 11;
      const digitoCalculado = modulo < 2 ? modulo : 11 - modulo;
      
      if (digitoCalculado !== digitoVerificador) return false;
      
      // Los últimos 4 dígitos deben ser 0001
      return cleanRuc.substring(9) === '0001';
    }
    
    return false;
  }
  
  getType(): string {
    return 'RUC';
  }
  
  getPattern(): RegExp {
    return /^[0-2][0-9][0-9][0-9]{10}$/;
  }
}

// Validador de Pasaporte
export class PassportValidator implements DocumentValidator {
  validate(passport: string): boolean {
    // Limpiar el pasaporte
    const cleanPassport = passport.replace(/\s/g, '').toUpperCase();
    
    // Verificar longitud (8-9 caracteres como mínimo)
    if (cleanPassport.length < 8 || cleanPassport.length > 9) return false;
    
    // Verificar patrón: puede contener letras y números
    const pattern = /^[A-Z0-9]+$/;
    return pattern.test(cleanPassport);
  }
  
  getType(): string {
    return 'Pasaporte';
  }
  
  getPattern(): RegExp {
    return /^[A-Z0-9]{8,9}$/;
  }
}

// Context del Strategy Pattern
export class DocumentValidationContext {
  private validator: DocumentValidator;
  
  constructor(validator: DocumentValidator) {
    this.validator = validator;
  }
  
  setValidator(validator: DocumentValidator): void {
    this.validator = validator;
  }
  
  validate(document: string): boolean {
    return this.validator.validate(document);
  }
  
  getType(): string {
    return this.validator.getType();
  }
}

// Factory para determinar el tipo de documento automáticamente
export class DocumentValidatorFactory {
  static getValidator(document: string): DocumentValidator | null {
    const cleanDocument = document.replace(/\D/g, '');
    
    // Si tiene 10 dígitos y cumple patrón de cédula
    if (cleanDocument.length === 10) {
      const cedulaValidator = new CedulaValidator();
      if (cedulaValidator.getPattern().test(cleanDocument)) {
        return cedulaValidator;
      }
    }
    
    // Si tiene 13 dígitos, es RUC
    if (cleanDocument.length === 13) {
      return new RucValidator();
    }
    
    // Si no es numérico o tiene longitud diferente, podría ser pasaporte
    if (!/^\d+$/.test(document.replace(/\s/g, '')) || 
        (document.replace(/\s/g, '').length >= 8 && document.replace(/\s/g, '').length <= 9)) {
      return new PassportValidator();
    }
    
    return null;
  }
  
  static validateDocument(document: string): { isValid: boolean; type: string | null } {
    const validator = this.getValidator(document);
    
    if (!validator) {
      return { isValid: false, type: null };
    }
    
    const isValid = validator.validate(document);
    const type = validator.getType();
    
    return { isValid, type };
  }
}
