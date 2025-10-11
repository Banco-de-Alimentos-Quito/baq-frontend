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
  ciudad: string;
  requiere_factura: boolean;
  gestor_donacion: string;
}

export class DonationService {
  private static validatePayload(payload: DonationPayload): void {
      const requiredFields = [
        'cedula_ruc', 'nombres_completos', 'numero_telefono', 'correo_electronico',
        'direccion', 'numero_cuenta', 'tipo_cuenta', 'banco_cooperativa',
        'monto_donar', 'acepta_aporte_voluntario', 'acepta_tratamiento_datos',
        'ciudad', 'requiere_factura', 'gestor_donacion'
      ];    const missingFields = requiredFields.filter(field => {
      const value = payload[field as keyof DonationPayload];
      // Especial handling para booleanos
      if (field === 'requiere_factura') {
        console.log("🔍 DEBUG - Validando requiere_factura:", value, typeof value);
        return typeof value !== 'boolean';
      }
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
      cedula_ruc: form.cedula.trim(),
      nombres_completos: form.nombres.trim(),
      numero_telefono: form.numero.trim().replace(/\D/g, ''),
      correo_electronico: form.correo.trim(),
      direccion: form.direccion.trim(),
      numero_cuenta: form.cuenta.trim().replace(/\D/g, ''),
      tipo_cuenta: form.tipoCuenta.trim() as 'Ahorros' | 'Corriente',
      banco_cooperativa: form.banco === 'Otra' ? form.otroBanco.trim() : form.banco.trim(),
      monto_donar: monto,
      acepta_aporte_voluntario: form.acepta,
      acepta_tratamiento_datos: termsChecked,
      ciudad: form.ciudad.trim(),
      requiere_factura: quiereFactura,
      gestor_donacion: form.gestorDonacion.trim()
    };
  }

  static async submitDonation(
    form: FormData, 
    monto: number, 
    termsChecked: boolean,
    quiereFactura: boolean
  ): Promise<any> {
    console.log("🔍 DEBUG - Parámetro quiereFactura recibido:", quiereFactura, typeof quiereFactura);
    
    const payload = this.transformFormData(form, monto, termsChecked, quiereFactura);
    
    console.log("📦 DEBUG - Payload completo:", payload);
    console.log("📝 DEBUG - requiere_factura en payload:", payload.requiere_factura, typeof payload.requiere_factura);
    
    this.validatePayload(payload);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error('API URL not configured');
    }

    const endpoint = `${apiUrl}/donaciones-recurrentes/donador`;

    console.log("🌐 DEBUG - Endpoint:", endpoint);
    console.log("📤 DEBUG - JSON que se va a enviar:", JSON.stringify(payload, null, 2));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log("📥 DEBUG - Response status:", response.status);
    console.log("📥 DEBUG - Response ok:", response.ok);

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
