import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { Boton, Tarjeta, Vacio, fechaCorta } from '@/components/ui';
import { Colores, Espacio } from '@/constants/tema';
import { supabase } from '@/lib/supabase';
import type { Pelicula, Renta } from '@/lib/tipos';

export default function ListaPeliculas() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [rentando, setRentando] = useState<number | null>(null);

  // Se vuelve a cargar cada vez que se entra a esta pantalla.
  useFocusEffect(
    useCallback(() => {
      supabase
        .from('peliculas')
        .select('*')
        .order('titulo')
        .then(({ data }) => setPeliculas((data as Pelicula[]) ?? []));
    }, [])
  );

  async function rentar(pelicula: Pelicula) {
    setRentando(pelicula.id);
    // La app solo envía QUÉ película. El usuario, las fechas y las
    // validaciones los pone la base de datos (trigger validar_renta).
    const { data, error } = await supabase
      .from('rentas')
      .insert({ pelicula_id: pelicula.id })
      .select()
      .single();
    setRentando(null);

    if (error) {
      // Aquí llega el mensaje de la regla de negocio del backend.
      Alert.alert('No se pudo rentar', error.message);
      return;
    }
    const renta = data as Renta;
    Alert.alert(
      '¡Película rentada!',
      `${renta.pelicula_titulo}\nDel ${fechaCorta(renta.fecha_inicio)} al ${fechaCorta(renta.fecha_fin)}`
    );
  }

  return (
    <FlatList
      data={peliculas}
      keyExtractor={(pelicula) => String(pelicula.id)}
      contentContainerStyle={estilos.lista}
      ListEmptyComponent={<Vacio texto="No hay películas disponibles." />}
      renderItem={({ item }) => (
        <Tarjeta>
          <View>
            <Text style={estilos.titulo}>{item.titulo}</Text>
            <Text style={estilos.detalle}>
              {item.genero}
              {item.anio ? ` · ${item.anio}` : ''}
            </Text>
          </View>
          <Boton texto="Rentar" onPress={() => rentar(item)} cargando={rentando === item.id} />
        </Tarjeta>
      )}
    />
  );
}

const estilos = StyleSheet.create({
  lista: { padding: Espacio.m, gap: Espacio.m },
  titulo: { fontSize: 17, fontWeight: '700', color: Colores.texto },
  detalle: { fontSize: 14, color: Colores.textoSuave, marginTop: 2 },
});
