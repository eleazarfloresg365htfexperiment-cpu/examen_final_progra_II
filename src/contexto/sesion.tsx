import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';
import type { Perfil } from '@/lib/tipos';

type ValorSesion = {
  sesion: Session | null;
  perfil: Perfil | null;
  esAdmin: boolean;
  cargando: boolean;
  recargarPerfil: () => Promise<void>;
};

const ContextoSesion = createContext<ValorSesion | null>(null);

// Envuelve la app y comparte la sesión y el perfil con todas las pantallas.
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);

  const idUsuario = sesion?.user.id;

  // 1. Lee la sesión guardada y escucha los cambios (login / logout).
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      if (!data.session) setCargando(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion);
      if (!nuevaSesion) {
        setPerfil(null);
        setCargando(false);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  // 2. Trae de la tabla perfiles la fila del usuario con sesión.
  const recargarPerfil = useCallback(async () => {
    if (!idUsuario) return;
    const { data } = await supabase.from('perfiles').select('*').eq('id', idUsuario).single();
    setPerfil(data as Perfil | null);
    setCargando(false);
  }, [idUsuario]);

  useEffect(() => {
    recargarPerfil();
  }, [recargarPerfil]);

  return (
    <ContextoSesion.Provider
      value={{
        sesion,
        perfil,
        esAdmin: perfil?.rol === 'administrador',
        cargando,
        recargarPerfil,
      }}>
      {children}
    </ContextoSesion.Provider>
  );
}

export function useSesion() {
  const valor = useContext(ContextoSesion);
  if (!valor) throw new Error('useSesion debe usarse dentro de ProveedorSesion');
  return valor;
}
