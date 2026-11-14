import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';

import { Tarjeta, Vacio, fechaCorta } from '@/components/ui';
import { Colores, Espacio } from '@/constants/tema';
import { useSesion } from '@/contexto/sesion';
import { supabase } from '@/lib/supabase';
import type { Renta } from '@/lib/tipos';

export default function MisRentas() {
  const { sesion } = useSesion();
  const idUsuario = sesion?.user.id;
  const [rentas, setRentas] = useState<Renta[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!idUsuario) return;
      supabase
        .from('rentas')
        .select('id, pelicula_titulo, fecha_inicio, fecha_fin')
        .eq('usuario_id', idUsuario)
        .order('creado_en', { ascending: false })
        .then(({ data }) => setRentas((data as Renta[]) ?? []));
    }, [idUsuario])
  );

  return (
    <FlatList
      data={rentas}
      keyExtractor={(renta) => String(renta.id)}
      contentContainerStyle={estilos.lista}
      ListEmptyComponent={<Vacio texto="Aún no has rentado películas." />}
      renderItem={({ item }) => (
        <Tarjeta>
          <Text style={estilos.titulo}>{item.pelicula_titulo}</Text>
          <Text style={estilos.detalle}>Inicio: {fechaCorta(item.fecha_inicio)}</Text>
          <Text style={estilos.detalle}>Fin: {fechaCorta(item.fecha_fin)}</Text>
        </Tarjeta>
      )}
    />
  );
}

const estilos = StyleSheet.create({
  lista: { padding: Espacio.m, gap: Espacio.m },
  titulo: { fontSize: 17, fontWeight: '700', color: Colores.texto },
  detalle: { fontSize: 14, color: Colores.textoSuave },
});
