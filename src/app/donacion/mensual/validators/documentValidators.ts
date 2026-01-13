// Patrón Strategy para validación de documentos
export interface DocumentValidator {
  validate(document: string): boolean;
  getType(): string;
  getPattern(): RegExp;
}

// Validador de Cédula Ecuatoriana
export class CedulaValidator implements DocumentValidator {
  validate(cedula: string): boolean {
    // Verificar que solo contenga dígitos
    if (!/^\d+$/.test(cedula.trim())) return false;

    // Limpiar la cédula (solo espacios)
    const cleanCedula = cedula.replace(/\s/g, "");

    // 1. Apuntar a que la cédula tenga 10 dígitos
    if (cleanCedula.length !== 10) return false;

    // 2. Extraer los dos primeros dígitos de la izquierda y comprobar que existan las regiones
    const digitoRegion = parseInt(cleanCedula.substring(0, 2));
    if (digitoRegion < 1 || digitoRegion > 24) return false;

    // 3. (Opcional) El tercer dígito
    // Se elimina la restricción estricta (< 6) para permitir validación puramente matemática
    // según el script legado proporcionado por el usuario.

    // 4. Algoritmo Módulo 10 (Suma de pares e impares con corrección)
    const ultimoDigito = parseInt(cleanCedula.substring(9, 10));

    // Agrupo todos los pares y los sumo (posiciones 2, 4, 6, 8 -> índices 1, 3, 5, 7)
    const pares =
      parseInt(cleanCedula.substring(1, 2)) +
      parseInt(cleanCedula.substring(3, 4)) +
      parseInt(cleanCedula.substring(5, 6)) +
      parseInt(cleanCedula.substring(7, 8));

    // Agrupo los impares, multiplico por 2, si > 9 resto 9
    let numero1 = parseInt(cleanCedula.substring(0, 1)) * 2;
    if (numero1 > 9) numero1 -= 9;

    let numero3 = parseInt(cleanCedula.substring(2, 3)) * 2;
    if (numero3 > 9) numero3 -= 9;

    let numero5 = parseInt(cleanCedula.substring(4, 5)) * 2;
    if (numero5 > 9) numero5 -= 9;

    let numero7 = parseInt(cleanCedula.substring(6, 7)) * 2;
    if (numero7 > 9) numero7 -= 9;

    let numero9 = parseInt(cleanCedula.substring(8, 9)) * 2;
    if (numero9 > 9) numero9 -= 9;

    const impares = numero1 + numero3 + numero5 + numero7 + numero9;
    const sumaTotal = pares + impares;

    // Decena inmediata
    const primerDigitoSuma = parseInt(String(sumaTotal).substring(0, 1));
    const decena = (primerDigitoSuma + 1) * 10;

    // Dígito validador
    let digitoValidador = decena - sumaTotal;
    if (digitoValidador === 10) digitoValidador = 0;

    return digitoValidador === ultimoDigito;
  }

  getType(): string {
    return "Cédula";
  }

  getPattern(): RegExp {
    // Permitir cualquier dígito en la tercera posición (0-9)
    return /^[0-2][0-9][0-9][0-9]{7}$/;
  }
}

// Validador de RUC Ecuatoriano
export class RucValidator implements DocumentValidator {
  validate(ruc: string): boolean {
    // Verificar que solo contenga dígitos
    if (!/^\d+$/.test(ruc.trim())) return false;

    // Limpiar el RUC (solo espacios, ya que verificamos que solo tenga dígitos)
    const cleanRuc = ruc.replace(/\s/g, "");

    // Verificar longitud
    if (cleanRuc.length !== 13) return false;

    // Verificar que los dos primeros dígitos sean válidos (01-24)
    const provincia = parseInt(cleanRuc.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;

    const tercerDigito = parseInt(cleanRuc.charAt(2));

    // CASO 1: RUC de Persona Natural (tercer dígito < 6)
    // Se valida igual que la cédula (primeros 10 dígitos) + sufijo
    if (tercerDigito < 6) {
      // Validar sufijo (últimos 3 dígitos no pueden ser 000)
      const sufijo = cleanRuc.substring(10, 13);
      if (sufijo === "000") return false;

      // Se usa el mismo algoritmo Módulo 10 de la Cédula para los primeros 10 dígitos
      const cedulaPart = cleanRuc.substring(0, 10);
      return new CedulaValidator().validate(cedulaPart);
    }

    // CASO 2: RUC de Sociedad Privada y Extranjeros (tercer dígito = 9)
    if (tercerDigito === 9) {
      // Validar sufijo (últimos 3 dígitos no pueden ser 000)
      const sufijo = cleanRuc.substring(10, 13);
      if (sufijo === "000") return false;

      // Algoritmo Módulo 11
      const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
      let suma = 0;

      // Multiplicar dígitos por coeficientes (posiciones 1-9)
      for (let i = 0; i < 9; i++) {
        suma += parseInt(cleanRuc.charAt(i)) * coeficientes[i];
      }

      const digitoVerificador = parseInt(cleanRuc.charAt(9)); // Posición 10
      const modulo = suma % 11;
      const digitoCalculado = modulo === 0 ? 0 : 11 - modulo;

      return digitoCalculado === digitoVerificador;
    }

    // CASO 3: RUC de Sociedad Pública (tercer dígito = 6)
    if (tercerDigito === 6) {
      // Validar sufijo (últimos 4 dígitos no pueden ser 0000)
      // En públicas el dígito verificador es el 9no dígito.
      const sufijo = cleanRuc.substring(9, 13);
      if (sufijo === "0000") return false;

      // Algoritmo Módulo 11 (Variante para públicas)
      // Coeficientes: 3, 2, 7, 6, 5, 4, 3, 2
      const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
      let suma = 0;

      // Se evalúan los primeros 8 dígitos (índices 0-7)
      for (let i = 0; i < 8; i++) {
        suma += parseInt(cleanRuc.charAt(i)) * coeficientes[i];
      }

      const digitoVerificador = parseInt(cleanRuc.charAt(8)); // Posición 9 (índice 8)
      const modulo = suma % 11;
      const digitoCalculado = modulo === 0 ? 0 : 11 - modulo;

      return digitoCalculado === digitoVerificador;
    }

    return false;
  }

  getType(): string {
    return "RUC";
  }

  getPattern(): RegExp {
    // 3er dígito puede ser 0-5 (Natural), 9 (Privada), 6 (Pública)
    return /^[0-2][0-9][0-69][0-9]{10}$/;
  }
}

// Validador de Pasaporte
export class PassportValidator implements DocumentValidator {
  validate(passport: string): boolean {
    // Limpiar el pasaporte
    const cleanPassport = passport.replace(/\s/g, "").toUpperCase();

    // Verificar longitud (8-9 caracteres como mínimo)
    if (cleanPassport.length < 8 || cleanPassport.length > 9) return false;

    // Verificar patrón: puede contener letras y números
    const pattern = /^[A-Z0-9]+$/;
    return pattern.test(cleanPassport);
  }

  getType(): string {
    return "Pasaporte";
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
    const trimmedDocument = document.trim();

    // Si solo contiene dígitos (y posibles espacios)
    if (/^\d+$/.test(trimmedDocument.replace(/\s/g, ""))) {
      const cleanDocument = trimmedDocument.replace(/\s/g, "");

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
    }

    // Si no es completamente numérico, podría ser pasaporte
    if (
      !/^\d+$/.test(trimmedDocument.replace(/\s/g, "")) &&
      trimmedDocument.replace(/\s/g, "").length >= 8 &&
      trimmedDocument.replace(/\s/g, "").length <= 9
    ) {
      return new PassportValidator();
    }

    return null;
  }

  static validateDocument(document: string): {
    isValid: boolean;
    type: string | null;
  } {
    const validator = this.getValidator(document);

    if (!validator) {
      return { isValid: false, type: null };
    }

    const isValid = validator.validate(document);
    const type = validator.getType();

    return { isValid, type };
  }
}
