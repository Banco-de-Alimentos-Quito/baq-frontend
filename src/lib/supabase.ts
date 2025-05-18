import { createClient } from '@supabase/supabase-js';

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridas.'
  );
}

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// String de conexión para acceso directo a la base de datos si es necesario
export const connectionString = process.env.SUPABASE_CONNECTION_STRING || 
  'postgresql://postgres:Sanduchitoteamo.@db.nucrceisrgwinfejiuur.supabase.co:5432/postgres';

// Funciones de utilidad para operaciones comunes

/**
 * Obtiene todos los registros de una tabla
 */
export async function getAll(table: string, options?: {
  select?: string,
  limit?: number,
  orderBy?: { column: string, ascending?: boolean }
}) {
  try {
    let query = supabase
      .from(table)
      .select(options?.select || '*');
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? true 
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error al obtener datos de ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Obtiene un registro por ID
 */
export async function getById(table: string, id: string | number, select?: string) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(select || '*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error al obtener registro ${id} de ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Inserta uno o más registros en una tabla
 */
export async function insert(table: string, data: any | any[]) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();
    
    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error(`Error al insertar en ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Actualiza un registro por ID
 */
export async function update(table: string, id: string | number, data: any) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error(`Error al actualizar registro ${id} en ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Elimina un registro por ID
 */
export async function remove(table: string, id: string | number) {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error al eliminar registro ${id} de ${table}:`, error);
    return { success: false, error };
  }
}

// Función para ejecutar consultas SQL directas (para casos específicos)
export async function executeQuery(query: string, params?: any[]) {
  try {
    // Usando la API de Supabase para consultas directas
    const { data, error } = await supabase.rpc('execute_sql', {
      query_text: query,
      params: params || [],
    });

    if (error) {
      console.error('Error ejecutando la consulta:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en executeQuery:', error);
    throw error;
  }
}

// Ejemplo de función para obtener todos los registros de una tabla
export async function fetchAllFromTable(tableName: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error in fetchAllFromTable for ${tableName}:`, error);
    throw error;
  }
}

// Ejemplo de función para insertar datos en una tabla
export async function insertIntoTable(tableName: string, data: any) {
  try {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();

    if (error) {
      console.error(`Error inserting data into ${tableName}:`, error);
      throw error;
    }

    return result;
  } catch (error) {
    console.error(`Error in insertIntoTable for ${tableName}:`, error);
    throw error;
  }
}

// Ejemplo de función para actualizar datos en una tabla
export async function updateTable(tableName: string, id: number | string, data: any) {
  try {
    const { data: result, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select();

    if (error) {
      console.error(`Error updating data in ${tableName}:`, error);
      throw error;
    }

    return result;
  } catch (error) {
    console.error(`Error in updateTable for ${tableName}:`, error);
    throw error;
  }
}

// Ejemplo de función para eliminar datos de una tabla
export async function deleteFromTable(tableName: string, id: number | string) {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting data from ${tableName}:`, error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error in deleteFromTable for ${tableName}:`, error);
    throw error;
  }
} 