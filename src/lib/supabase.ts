import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

// La URL y la clave pública vienen del archivo .env (que no se sube a GitHub).
const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const clave = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

// Cliente único de Supabase para toda la app.
// AsyncStorage guarda la sesión en el teléfono para no pedir login cada vez.
export const supabase = createClient(url, clave, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Renueva el token solo mientras la app está abierta en pantalla.
AppState.addEventListener('change', (estado) => {
  if (estado === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
