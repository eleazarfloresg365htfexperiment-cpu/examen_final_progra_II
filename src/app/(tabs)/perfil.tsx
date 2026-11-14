import { File } from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton, Campo } from '@/components/ui';
import { Colores, Espacio } from '@/constants/tema';
import { useSesion } from '@/contexto/sesion';
import { supabase } from '@/lib/supabase';

export default function PerfilUsuario() {
  const { sesion, perfil, esAdmin, recargarPerfil } = useSesion();
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  // Llena el formulario con lo que ya está guardado.
  useEffect(() => {
    if (!perfil) return;
    setNombre(perfil.nombre_completo);
    setEdad(perfil.edad ? String(perfil.edad) : '');
  }, [perfil]);

  if (!perfil || !sesion) return null;
  const idUsuario = sesion.user.id;

  // Por seguridad nunca se muestra la tarjeta completa, solo el final.
  const tarjetaGuardada = perfil.no_tarjeta
    ? `Guardada: •••• ${perfil.no_tarjeta.slice(-4)}`
    : 'Sin tarjeta guardada';

  async function guardar() {
    const edadNumero = Number(edad);
    const soloDigitos = tarjeta.replace(/\D/g, '');

    if (!nombre.trim()) {
      Alert.alert('Falta el nombre', 'Escribe tu nombre completo.');
      return;
    }
    if (!Number.isInteger(edadNumero) || edadNumero < 1 || edadNumero > 120) {
      Alert.alert('Edad no válida', 'Escribe una edad entre 1 y 120.');
      return;
    }
    if (tarjeta && (soloDigitos.length < 13 || soloDigitos.length > 19)) {
      Alert.alert('Tarjeta no válida', 'El número debe tener entre 13 y 19 dígitos.');
      return;
    }

    setGuardando(true);
    const { error } = await supabase
      .from('perfiles')
      .update({
        nombre_completo: nombre.trim(),
        edad: edadNumero,
        // Solo se cambia la tarjeta si el usuario escribió una nueva.
        ...(tarjeta ? { no_tarjeta: soloDigitos } : {}),
      })
      .eq('id', idUsuario);
    setGuardando(false);

    if (error) {
      Alert.alert('No se pudo guardar', error.message);
      return;
    }
    setTarjeta('');
    await recargarPerfil();
    Alert.alert('Listo', 'Tu perfil se guardó.');
  }

  async function cambiarFoto() {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (resultado.canceled) return;

    setSubiendo(true);
    try {
      const imagen = resultado.assets[0];
      // Lee los bytes de la foto guardada en el teléfono.
      const archivo = await new File(imagen.uri).arrayBuffer();
      // La sube a la carpeta del usuario dentro del bucket "fotos".
      const ruta = `${idUsuario}/${Date.now()}.jpg`;

      const subida = await supabase.storage
        .from('fotos')
        .upload(ruta, archivo, { contentType: imagen.mimeType ?? 'image/jpeg' });
      if (subida.error) throw subida.error;

      // Guarda en el perfil la dirección pública de la foto.
      const { data } = supabase.storage.from('fotos').getPublicUrl(ruta);
      const guardado = await supabase
        .from('perfiles')
        .update({ foto_url: data.publicUrl })
        .eq('id', idUsuario);
      if (guardado.error) throw guardado.error;

      await recargarPerfil();
    } catch (error) {
      Alert.alert('No se pudo subir la foto', error instanceof Error ? error.message : '');
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <View style={estilos.encabezado}>
        {perfil.foto_url ? (
          <Image source={perfil.foto_url} style={estilos.foto} contentFit="cover" />
        ) : (
          <View style={[estilos.foto, estilos.fotoVacia]}>
            <Text style={{ fontSize: 44 }}>👤</Text>
          </View>
        )}
        <Text style={estilos.correo}>{sesion.user.email}</Text>
        <Text style={estilos.rol}>{esAdmin ? 'Administrador' : 'Usuario'}</Text>
        <Boton
          texto="Cambiar fotografía"
          variante="secundario"
          onPress={cambiarFoto}
          cargando={subiendo}
        />
      </View>

      <Campo etiqueta="Nombre completo" value={nombre} onChangeText={setNombre} />
      <Campo
        etiqueta="Edad"
        value={edad}
        onChangeText={setEdad}
        keyboardType="number-pad"
        maxLength={3}
      />
      <Campo
        etiqueta={`No. de tarjeta de crédito (${tarjetaGuardada})`}
        value={tarjeta}
        onChangeText={setTarjeta}
        placeholder="Escribe un número nuevo para cambiarla"
        keyboardType="number-pad"
        maxLength={19}
      />

      <Boton texto="Guardar cambios" onPress={guardar} cargando={guardando} />
      <Boton
        texto="Cerrar sesión"
        variante="secundario"
        onPress={() => supabase.auth.signOut()}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: Espacio.m, gap: Espacio.m },
  encabezado: { alignItems: 'center', gap: Espacio.s, marginBottom: Espacio.s },
  foto: { width: 112, height: 112, borderRadius: 56, backgroundColor: Colores.borde },
  fotoVacia: { alignItems: 'center', justifyContent: 'center' },
  correo: { fontSize: 15, color: Colores.texto, fontWeight: '600' },
  rol: {
    fontSize: 12,
    fontWeight: '700',
    color: Colores.primario,
    backgroundColor: Colores.primarioSuave,
    paddingHorizontal: Espacio.s,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
