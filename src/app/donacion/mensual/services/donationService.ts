import { FormData } from '../hooks/useFormValidation';

export interface DonationPayload {
  cedula_ruc: string;
  nombres_completos: string;
  numero_telefono: string;
  correo_electronico: string;
  direccion: string;
  numero_cuenta: string;
  tipo_cuenta: 'Ahorros' | 'Corriente';
  banco_cooperativa: string;
  monto_donar: number;
  acepta_aporte_voluntario: boolean;
  acepta_tratamiento_datos: boolean;
  provincia: string;
  ciudad: string;
  requiere_factura: boolean; 
}

export class DonationService {
  private static validatePayload(payload: DonationPayload): void {
      const requiredFields = [
        'cedula_ruc', 'nombres_completos', 'numero_telefono', 'correo_electronico',
        'direccion', 'numero_cuenta', 'tipo_cuenta', 'banco_cooperativa',
        'monto_donar', 'acepta_aporte_voluntario', 'acepta_tratamiento_datos',
        'provincia', 'ciudad'
      ];    const missingFields = requiredFields.filter(field => {
      const value = payload[field as keyof DonationPayload];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    if (typeof payload.monto_donar !== 'number' || payload.monto_donar < 0.99) {
      throw new Error('Monto must be a number greater than or equal to 0.99 USD');
    }

    if (!/^\d{8,20}$/.test(payload.numero_cuenta)) {
      throw new Error('numero_cuenta must be 8-20 digits');
    }

    if (!/^\d{10,13}$/.test(payload.cedula_ruc)) {
      throw new Error('cedula_ruc must be 10-13 digits');
    }

    const cleanPhone = payload.numero_telefono.replace(/\D/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 15) {
      throw new Error('numero_telefono must be 9-15 digits');
    }
  }

  private static transformFormData(
    form: FormData, 
    monto: number, 
    termsChecked: boolean,
    quiereFactura: boolean
  ): DonationPayload {
    return {
      cedula_ruc: form.cedula,
      nombres_completos: form.nombres,
      numero_telefono: form.numero.replace(/\D/g, ''),
      correo_electronico: form.correo,
      direccion: form.direccion,
      numero_cuenta: form.cuenta.replace(/\D/g, ''),
      tipo_cuenta: form.tipoCuenta as 'Ahorros' | 'Corriente',
      banco_cooperativa: form.banco === 'Otra' ? form.otroBanco : form.banco,
      monto_donar: monto,
      acepta_aporte_voluntario: form.acepta,
      acepta_tratamiento_datos: termsChecked,
      provincia: form.provincia,
      ciudad: form.ciudad,
      requiere_factura: quiereFactura,
    };
  }

  static async submitDonation(
    form: FormData, 
    monto: number, 
    termsChecked: boolean,
    quiereFactura: boolean
  ): Promise<any> {
    const payload = this.transformFormData(form, monto, termsChecked, quiereFactura);
    this.validatePayload(payload);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('API URL not configured');
    }

    const endpoint = `${apiUrl}/donaciones-recurrentes/donador`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorText;
      try {
        const errorJson = await response.json();
        errorText = JSON.stringify(errorJson);
      } catch {
        errorText = await response.text();
      }
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return response.json();
  }
}
