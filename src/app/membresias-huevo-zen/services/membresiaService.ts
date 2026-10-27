/**
 * Servicio para validación y registro de Membresías Huevo Zen
 * para Voluntarios Operativos del Banco de Alimentos Quito.
 *
 * Se comunica EXCLUSIVAMENTE con el backend API (baq-api).
 * No contiene llamadas directas ni fallbacks a Supabase desde el frontend.
 */

export interface VerificacionVoluntarioResponse {
  valido: boolean;
  codigo: 'VALIDO' | 'NO_FORMA_PARTE' | 'NO_ES_OPERATIVO' | 'CEDULA_INVALIDA' | 'YA_REGISTRADO';
  mensaje: string;
  persona_id?: string;
  nombre?: string;
  cedula?: string;
  categoria_actual?: string;
}

export interface RegistroMembresiaResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface EstadoSemanaResponse {
  total_inscritos: number;
  limite_cupos: number;
  cupos_disponibles: number;
  dia_semana: number;
  abierto_por_dia: boolean;
  cupos_agotados: boolean;
  abierto: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/baq';

export class MembresiaHuevoZenService {
  /**
   * Obtiene el estado de las inscripciones de la semana desde el backend.
   * Devuelve si está abierto por día (toda la semana) y cupos disponibles.
   */
  public static async obtenerEstadoSemana(): Promise<EstadoSemanaResponse> {
    const res = await fetch(`${API_BASE_URL}/membresias-huevo-zen/estado-semana`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al consultar estado de inscripciones al backend');
    }

    return (await res.json()) as EstadoSemanaResponse;
  }

  /**
   * Verifica si la cédula pertenece al voluntariado operativo del BAQ.
   * La consulta la procesa el backend mediante su conexión a Supabase Sistema.
   */
  public static async verificarCedula(
    cedula: string
  ): Promise<VerificacionVoluntarioResponse> {
    const cleanCedula = cedula.trim();

    if (!cleanCedula) {
      return {
        valido: false,
        codigo: 'CEDULA_INVALIDA',
        mensaje: 'Debe ingresar un número de cédula válido.',
      };
    }

    const endpoint = `${API_BASE_URL}/membresias-huevo-zen/verificar/${encodeURIComponent(
      cleanCedula
    )}`;

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al verificar la cédula en el backend');
    }

    return (await res.json()) as VerificacionVoluntarioResponse;
  }

  /**
   * Envía la cédula, tipo de banco, el número de comprobante y el archivo de comprobante al backend.
   * El backend se encarga de subir el archivo a Supabase Storage y registrar la membresía en la BD.
   */
  public static async registrarMembresia(
    cedula: string,
    tipoBanco: string,
    numeroComprobante: string,
    file: File
  ): Promise<RegistroMembresiaResponse> {
    const cleanCedula = cedula.trim();

    const formData = new FormData();
    formData.append('cedula', cleanCedula);
    formData.append('tipo_banco', (tipoBanco || 'Banco Pichincha').trim());
    formData.append('numero_comprobante', numeroComprobante.trim());
    formData.append('file', file);

    const endpoint = `${API_BASE_URL}/membresias-huevo-zen/registro`;
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al registrar la membresía en el backend');
    }

    return (await res.json()) as RegistroMembresiaResponse;
  }
}
