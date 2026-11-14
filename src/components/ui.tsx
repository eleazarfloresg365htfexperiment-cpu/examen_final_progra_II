import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { Colores, Espacio, Radio } from '@/constants/tema';

// Piezas visuales reutilizables: así todas las pantallas se ven iguales.

type PropsBoton = {
  texto: string;
  onPress: () => void;
  cargando?: boolean;
  variante?: 'primario' | 'secundario';
};

export function Boton({ texto, onPress, cargando = false, variante = 'primario' }: PropsBoton) {
  const esPrimario = variante === 'primario';
  return (
    <Pressable
      onPress={onPress}
      disabled={cargando}
      style={({ pressed }) => [
        estilos.boton,
        esPrimario ? estilos.botonPrimario : estilos.botonSecundario,
        (pressed || cargando) && { opacity: 0.7 },
      ]}>
      {cargando ? (
        <ActivityIndicator color={esPrimario ? Colores.blanco : Colores.primario} />
      ) : (
        <Text style={[estilos.botonTexto, !esPrimario && { color: Colores.primario }]}>{texto}</Text>
      )}
    </Pressable>
  );
}

export function Campo({ etiqueta, ...props }: TextInputProps & { etiqueta: string }) {
  return (
    <View style={{ gap: Espacio.xs }}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput placeholderTextColor={Colores.textoSuave} style={estilos.campo} {...props} />
    </View>
  );
}

export function Tarjeta({ children }: { children: ReactNode }) {
  return <View style={estilos.tarjeta}>{children}</View>;
}

export function Vacio({ texto }: { texto: string }) {
  return <Text style={estilos.vacio}>{texto}</Text>;
}

// Convierte "2026-11-14" en "14/11/2026".
export function fechaCorta(fecha: string) {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

const estilos = StyleSheet.create({
  boton: {
    minHeight: 48,
    borderRadius: Radio,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Espacio.m,
  },
  botonPrimario: { backgroundColor: Colores.primario },
  botonSecundario: { backgroundColor: Colores.primarioSuave },
  botonTexto: { color: Colores.blanco, fontSize: 16, fontWeight: '600' },
  etiqueta: { fontSize: 13, fontWeight: '600', color: Colores.textoSuave },
  campo: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colores.borde,
    borderRadius: Radio,
    paddingHorizontal: Espacio.m,
    fontSize: 16,
    color: Colores.texto,
    backgroundColor: Colores.tarjeta,
  },
  tarjeta: {
    backgroundColor: Colores.tarjeta,
    borderRadius: Radio,
    borderWidth: 1,
    borderColor: Colores.borde,
    padding: Espacio.m,
    gap: Espacio.s,
  },
  vacio: { textAlign: 'center', color: Colores.textoSuave, marginTop: Espacio.xl },
});
