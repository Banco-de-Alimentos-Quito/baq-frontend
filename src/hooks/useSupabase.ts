import { useState, useEffect, useCallback } from 'react';
import { Session, User, RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is' | 'cs' | 'cd';

interface QueryFilter {
  column: string;
  operator: FilterOperator;
  value: any;
}

interface PaginationOptions {
  page: number;
  pageSize: number;
}

// Hook mejorado para consultas de Supabase con paginación
export function useSupabaseQuery<T extends Record<string, any> = any>(
  tableName: string,
  query?: {
    select?: string;
    filters?: QueryFilter[];
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    pagination?: PaginationOptions;
  }
) {
  const [data, setData] = useState<T[] | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageCount, setPageCount] = useState<number>(0);

  // Usar useCallback para mantener la referencia de la función
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Iniciar la consulta básica
      let queryBuilder = supabase
        .from(tableName)
        .select(query?.select || '*', { count: query?.pagination ? 'exact' : undefined });
      
      // Aplicar filtros si existen usando los operadores correctos
      if (query?.filters && query.filters.length > 0) {
        query.filters.forEach(filter => {
          const { column, operator, value } = filter;
          
          // Aplicar el operador correcto
          switch (operator) {
            case 'eq':
              queryBuilder = queryBuilder.eq(column, value);
              break;
            case 'neq':
              queryBuilder = queryBuilder.neq(column, value);
              break;
            case 'gt':
              queryBuilder = queryBuilder.gt(column, value);
              break;
            case 'gte':
              queryBuilder = queryBuilder.gte(column, value);
              break;
            case 'lt':
              queryBuilder = queryBuilder.lt(column, value);
              break;
            case 'lte':
              queryBuilder = queryBuilder.lte(column, value);
              break;
            case 'like':
              queryBuilder = queryBuilder.like(column, value);
              break;
            case 'ilike':
              queryBuilder = queryBuilder.ilike(column, value);
              break;
            case 'in':
              queryBuilder = queryBuilder.in(column, value);
              break;
            case 'is':
              queryBuilder = queryBuilder.is(column, value);
              break;
            case 'cs':
              queryBuilder = queryBuilder.contains(column, value);
              break;
            case 'cd':
              queryBuilder = queryBuilder.containedBy(column, value);
              break;
            default:
              console.warn(`Operador desconocido: ${operator}`);
          }
        });
      }
      
      // Aplicar ordenamiento si existe
      if (query?.orderBy) {
        queryBuilder = queryBuilder.order(
          query.orderBy.column,
          { ascending: query.orderBy.ascending ?? true }
        );
      }
      
      // Aplicar paginación o límite
      if (query?.pagination) {
        const { page, pageSize } = query.pagination;
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;
        
        queryBuilder = queryBuilder.range(start, end);
      } else if (query?.limit) {
        queryBuilder = queryBuilder.limit(query.limit);
      }
      
      // Ejecutar la consulta
      const { data: result, error: queryError, count: totalCount } = await queryBuilder;
      
      if (queryError) {
        throw new Error(queryError.message);
      }
      
      setData(result as unknown as T[]);
      setError(null);
      
      // Manejar la paginación
      if (query?.pagination && totalCount !== null) {
        setCount(totalCount);
        setPageCount(Math.ceil(totalCount / query.pagination.pageSize));
      }
    } catch (err: any) {
      console.error('Error al consultar datos de Supabase:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tableName, JSON.stringify(query)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    data, 
    error, 
    loading, 
    count, 
    pageCount,
    // Método para refrescar los datos manualmente
    refresh: fetchData
  };
}

// Hook para autenticación mejorado con tipos correctos
export function useSupabaseAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Obtener el estado inicial de la sesión
    const initAuth = async () => {
      // Obtener la sesión actual
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);
      
      // Obtener el usuario actual
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);
      
      setLoading(false);
    };

    initAuth();

    // Configurar el listener para cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    // Limpieza al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { 
    session, 
    user, 
    loading,
    
    // Métodos de autenticación
    signIn: {
      // Iniciar sesión con email y contraseña
      withEmail: async (email: string, password: string) => {
        return await supabase.auth.signInWithPassword({ email, password });
      },
      // Iniciar sesión con proveedor (Google, GitHub, etc.)
      withOAuth: async (provider: 'google' | 'github' | 'facebook') => {
        return await supabase.auth.signInWithOAuth({ provider });
      },
      // Iniciar sesión con link mágico
      withMagicLink: async (email: string) => {
        return await supabase.auth.signInWithOtp({ email });
      }
    },
    
    // Cerrar sesión
    signOut: async () => {
      return await supabase.auth.signOut();
    },
    
    // Registrar nuevo usuario
    signUp: async (email: string, password: string, options?: { data?: object; redirectTo?: string }) => {
      return await supabase.auth.signUp({ 
        email, 
        password, 
        options 
      });
    },

    // Restablecer contraseña
    resetPassword: async (email: string) => {
      return await supabase.auth.resetPasswordForEmail(email);
    }
  };
}

// Hook para suscribirse a cambios en tiempo real
export function useSupabaseRealtime<T extends { id: string | number } = any>(
  table: string,
  options?: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
    select?: string;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Cargar datos iniciales
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const { data: initialData, error: initialError } = await supabase
          .from(table)
          .select(options?.select || '*');
          
        if (initialError) throw initialError;
        setData((initialData || []) as unknown as T[]);
      } catch (err: any) {
        console.error(`Error al cargar datos iniciales de ${table}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Suscribirse a cambios
    const channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes' as any, {
        event: options?.event || '*', 
        schema: 'public', 
        table: table,
        filter: options?.filter
      }, (payload: RealtimePostgresChangesPayload<T>) => {
        if (payload.eventType === 'INSERT') {
          setData((prev) => [...prev, payload.new as T]);
        } else if (payload.eventType === 'UPDATE') {
          setData((prev) => prev.map(item => 
            item.id === payload.new.id ? payload.new as T : item
          ));
        } else if (payload.eventType === 'DELETE') {
          setData((prev) => prev.filter(item => 
            item.id !== payload.old.id
          ));
        }
      })
      .subscribe();

    // Limpiar suscripción al desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, options?.event, options?.filter, options?.select]);

  return { data, error, loading };
}

// Hook para operaciones CRUD básicas en una tabla
export function useSupabaseCrud<T extends { id: string | number }>(tableName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Crear un nuevo registro
  const create = async (data: Omit<T, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: result, error: createError } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();
      
      if (createError) throw createError;
      return { data: result as T, error: null };
    } catch (err: any) {
      console.error(`Error al crear registro en ${tableName}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un registro
  const update = async (id: string | number, data: Partial<T>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: result, error: updateError } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      return { data: result as T, error: null };
    } catch (err: any) {
      console.error(`Error al actualizar registro ${id} en ${tableName}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un registro
  const remove = async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      return { success: true, error: null };
    } catch (err: any) {
      console.error(`Error al eliminar registro ${id} de ${tableName}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Obtener un registro por id
  const getById = async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: result, error: getError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (getError) throw getError;
      return { data: result as T, error: null };
    } catch (err: any) {
      console.error(`Error al obtener registro ${id} de ${tableName}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    update,
    remove,
    getById,
    loading,
    error
  };
} 