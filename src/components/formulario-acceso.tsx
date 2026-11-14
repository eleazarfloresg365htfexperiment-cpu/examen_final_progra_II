import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colores, Espacio } from '@/constants/tema';

// Marco compartido por las pantallas de login y registro.
export function FormularioAcceso({ subtitulo, children }: { subtitulo: string; children: ReactNode }) {
  return (
    <SafeAreaView style={estilos.pantalla}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <View style={estilos.encabezado}>
            <Text style={estilos.logo}>🎬</Text>
            <Text style={estilos.titulo}>Renta Virtual de Películas</Text>
            <Text style={estilos.subtitulo}>{subtitulo}</Text>
          </View>
          <View style={estilos.formulario}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  contenido: { flexGrow: 1, justifyContent: 'center', padding: Espacio.l, gap: Espacio.l },
  encabezado: { alignItems: 'center', gap: Espacio.s },
  logo: { fontSize: 48 },
  titulo: { fontSize: 24, fontWeight: '700', color: Colores.texto, textAlign: 'center' },
  subtitulo: { fontSize: 15, color: Colores.textoSuave },
  formulario: { gap: Espacio.m },
});
