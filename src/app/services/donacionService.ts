import { supabase } from '@/lib/supabase';

export async function registrarDonacionConRacha(datosDonacion: {
  email: string;
  monto: number;
  metodo_pago: string;
  tipo_donador: 'recurrente' | 'simple';
}) {
  try {
    // 1. Buscar o crear donador simple
    let { data: donador, error: donadorError } = await supabase
      .from('donadores_simples')
      .select('id')
      .eq('correo_electronico', datosDonacion.email)
      .single();

    if (!donador) {
      // Crear nuevo donador si no existe
      const { data: nuevoDonador, error: crearError } = await supabase
        .from('donadores_simples')
        .insert({ correo_electronico: datosDonacion.email })
        .select('id')
        .single();
      
      if (crearError) throw crearError;
      donador = nuevoDonador;
    }

    // 2. Registrar donación
    const { data: donacion, error: donacionError } = await supabase
      .from('donaciones')
      .insert({
        tipo_donador: datosDonacion.tipo_donador,
        donador_simple_id: donador.id,
        monto_usd: datosDonacion.monto,
        fecha_donacion: new Date().toISOString(),
        metodo_pago: datosDonacion.metodo_pago
      })
      .select()
      .single();

    if (donacionError) throw donacionError;

    // 3. Actualizar racha
    await actualizarRacha(donador.id);

    return { success: true, data: donacion };
  } catch (error) {
    console.error('Error en registrarDonacionConRacha:', error);
    return { success: false, error };
  }
}

async function actualizarRacha(donadorId: number) {
  try {
    // Buscar racha existente
    let { data: racha, error: rachaError } = await supabase
      .from('rachas')
      .select('*')
      .eq('donador_id', donadorId)
      .eq('estado', 'activo')
      .single();

    const fechaActual = new Date().toISOString();

    if (racha) {
      // Actualizar racha existente
      const nuevaCantidad = racha.cantidad_donaciones + 1;
      const nuevaMejorRacha = Math.max(racha.mejor_racha, nuevaCantidad);

      await supabase
        .from('rachas')
        .update({
          fecha_ultimo_pago: fechaActual,
          cantidad_donaciones: nuevaCantidad,
          mejor_racha: nuevaMejorRacha,
          estado: 'activo'
        })
        .eq('id', racha.id);
    } else {
      // Crear nueva racha
      await supabase
        .from('rachas')
        .insert({
          donador_id: donadorId,
          fecha_inicio: fechaActual,
          fecha_ultimo_pago: fechaActual,
          cantidad_donaciones: 1,
          mejor_racha: 1,
          estado: 'activo'
        });
    }
  } catch (error) {
    console.error('Error actualizando racha:', error);
  }
}

// NUEVO: Obtener racha y donaciones reales para mostrar en el frontend
export async function obtenerRachaYHistorial(email: string) {
  // 1. Buscar donador simple
  const { data: donador, error: donadorError } = await supabase
    .from('donadores_simples')
    .select('id')
    .eq('correo_electronico', email)
    .single();

  if (!donador) return null;

  // 2. Buscar racha activa
  const { data: racha, error: rachaError } = await supabase
    .from('rachas')
    .select('*')
    .eq('donador_id', donador.id)
    .eq('estado', 'activo')
    .single();

  // 3. Buscar historial de donaciones (últimas 20)
  const { data: donaciones, error: donacionesError } = await supabase
    .from('donaciones')
    .select('fecha_donacion, monto_usd')
    .eq('donador_simple_id', donador.id)
    .order('fecha_donacion', { ascending: false })
    .limit(20);

  return {
    racha,
    historial: (donaciones || []).map(d => ({
      date: d.fecha_donacion.split('T')[0],
      amount: d.monto_usd
    }))
  };
}