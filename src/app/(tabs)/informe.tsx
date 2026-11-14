import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';

import { Tarjeta, Vacio, fechaCorta } from '@/components/ui';
import { Colores, Espacio } from '@/constants/tema';
import { supabase } from '@/lib/supabase';
import type { Renta } from '@/lib/tipos';

// Informe del Administrador: todas las rentas con el usuario y las fechas.
// La base de datos solo devuelve todas las filas si quien pregunta es admin.
export default function InformeRentas() {
  const [rentas, setRentas] = useState<Renta[]>([]);

  useFocusEffect(
    useCallback(() => {
      supabase
        .from('rentas')
        .select('id, pelicula_titulo, fecha_inicio, fecha_fin, perfiles(nombre_completo)')
        .order('creado_en', { ascending: false })
        .then(({ data }) => setRentas((data as unknown as Renta[]) ?? []));
    }, [])
  );

  return (
    <FlatList
      data={rentas}
      keyExtractor={(renta) => String(renta.id)}
      contentContainerStyle={estilos.lista}
      ListHeaderComponent={<Text style={estilos.total}>Total de rentas: {rentas.length}</Text>}
      ListEmptyComponent={<Vacio texto="Todavía no hay rentas." />}
      renderItem={({ item }) => (
        <Tarjeta>
          <Text style={estilos.titulo}>{item.pelicula_titulo}</Text>
          <Text style={estilos.detalle}>
            Usuario: {item.perfiles?.nombre_completo || 'Sin nombre'}
          </Text>
          <Text style={estilos.detalle}>
            Del {fechaCorta(item.fecha_inicio)} al {fechaCorta(item.fecha_fin)}
          </Text>
        </Tarjeta>
      )}
    />
  );
}

const estilos = StyleSheet.create({
  lista: { padding: Espacio.m, gap: Espacio.m },
  total: { fontSize: 14, fontWeight: '600', color: Colores.textoSuave },
  titulo: { fontSize: 17, fontWeight: '700', color: Colores.texto },
  detalle: { fontSize: 14, color: Colores.textoSuave },
});
