import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { Boton, Campo, Tarjeta, Vacio } from '@/components/ui';
import { Colores, Espacio } from '@/constants/tema';
import { supabase } from '@/lib/supabase';
import type { Pelicula } from '@/lib/tipos';

// Solo el Administrador llega a esta pantalla. Aunque alguien lograra
// abrirla, la base de datos rechaza agregar o eliminar si no es admin.
export default function AdministrarPeliculas() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [titulo, setTitulo] = useState('');
  const [genero, setGenero] = useState('');
  const [anio, setAnio] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    const { data } = await supabase.from('peliculas').select('*').order('titulo');
    setPeliculas((data as Pelicula[]) ?? []);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function agregar() {
    if (!titulo.trim()) {
      Alert.alert('Falta el título', 'Escribe el título de la película.');
      return;
    }
    setGuardando(true);
    const { error } = await supabase.from('peliculas').insert({
      titulo: titulo.trim(),
      genero: genero.trim(),
      anio: anio ? Number(anio) : null,
    });
    setGuardando(false);

    if (error) {
      Alert.alert('No se pudo agregar', error.message);
      return;
    }
    setTitulo('');
    setGenero('');
    setAnio('');
    cargar();
  }

  function confirmarEliminar(pelicula: Pelicula) {
    Alert.alert('Eliminar película', `¿Eliminar "${pelicula.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(pelicula.id) },
    ]);
  }

  async function eliminar(id: number) {
    const { error } = await supabase.from('peliculas').delete().eq('id', id);
    if (error) Alert.alert('No se pudo eliminar', error.message);
    cargar();
  }

  return (
    <FlatList
      data={peliculas}
      keyExtractor={(pelicula) => String(pelicula.id)}
      contentContainerStyle={estilos.lista}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={estilos.formulario}>
          <Text style={estilos.seccion}>Agregar película</Text>
          <Campo etiqueta="Título" value={titulo} onChangeText={setTitulo} />
          <Campo etiqueta="Género" value={genero} onChangeText={setGenero} />
          <Campo
            etiqueta="Año"
            value={anio}
            onChangeText={setAnio}
            keyboardType="number-pad"
            maxLength={4}
          />
          <Boton texto="Agregar película" onPress={agregar} cargando={guardando} />
          <Text style={estilos.seccion}>Películas actuales</Text>
        </View>
      }
      ListEmptyComponent={<Vacio texto="No hay películas." />}
      renderItem={({ item }) => (
        <Tarjeta>
          <Text style={estilos.titulo}>{item.titulo}</Text>
          <Text style={estilos.detalle}>
            {item.genero}
            {item.anio ? ` · ${item.anio}` : ''}
          </Text>
          <Boton texto="Eliminar" variante="secundario" onPress={() => confirmarEliminar(item)} />
        </Tarjeta>
      )}
    />
  );
}

const estilos = StyleSheet.create({
  lista: { padding: Espacio.m, gap: Espacio.m },
  formulario: { gap: Espacio.m },
  seccion: { fontSize: 18, fontWeight: '700', color: Colores.texto, marginTop: Espacio.s },
  titulo: { fontSize: 17, fontWeight: '700', color: Colores.texto },
  detalle: { fontSize: 14, color: Colores.textoSuave },
});
