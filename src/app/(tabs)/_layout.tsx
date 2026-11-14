import { Tabs } from 'expo-router/js-tabs';
import { Text } from 'react-native';

import { Colores } from '@/constants/tema';
import { useSesion } from '@/contexto/sesion';

// Dibuja un emoji como ícono de cada opción del menú.
function icono(emoji: string) {
  return function Icono() {
    return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
  };
}

// Menú inferior. Las dos últimas opciones solo existen para el Administrador.
export default function LayoutMenu() {
  const { esAdmin } = useSesion();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colores.primario,
        tabBarInactiveTintColor: Colores.textoSuave,
        headerStyle: { backgroundColor: Colores.tarjeta },
        headerTitleStyle: { color: Colores.texto, fontWeight: '700' },
        sceneStyle: { backgroundColor: Colores.fondo },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Películas', tabBarIcon: icono('🎬') }} />
      <Tabs.Screen name="rentas" options={{ title: 'Mis rentas', tabBarIcon: icono('🎟️') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icono('👤') }} />

      <Tabs.Protected guard={esAdmin}>
        <Tabs.Screen name="admin" options={{ title: 'Administrar', tabBarIcon: icono('🛠️') }} />
        <Tabs.Screen name="informe" options={{ title: 'Informe', tabBarIcon: icono('📊') }} />
      </Tabs.Protected>
    </Tabs>
  );
}
