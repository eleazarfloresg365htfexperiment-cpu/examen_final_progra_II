import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { ProveedorSesion, useSesion } from '@/contexto/sesion';

// Mantiene la pantalla de carga hasta saber si hay sesión guardada.
SplashScreen.preventAutoHideAsync();

export default function LayoutRaiz() {
  return (
    <ProveedorSesion>
      <StatusBar style="dark" />
      <Navegacion />
    </ProveedorSesion>
  );
}

function Navegacion() {
  const { sesion, cargando } = useSesion();

  useEffect(() => {
    if (!cargando) SplashScreen.hideAsync();
  }, [cargando]);

  if (cargando) return null;

  // Stack.Protected decide qué pantallas existen según haya sesión o no:
  // sin sesión solo se puede ver login/registro; con sesión, solo el menú.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!sesion}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={!sesion}>
        <Stack.Screen name="login" />
        <Stack.Screen name="registro" />
      </Stack.Protected>
    </Stack>
  );
}
