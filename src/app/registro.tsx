import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { FormularioAcceso } from '@/components/formulario-acceso';
import { Boton, Campo } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [cargando, setCargando] = useState(false);

  async function registrarse() {
    if (!nombre.trim() || !correo.trim()) {
      Alert.alert('Datos incompletos', 'Escribe tu nombre y tu correo.');
      return;
    }
    if (clave.length < 6) {
      Alert.alert('Contraseña muy corta', 'Debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    // El nombre viaja como "metadata"; un trigger en la base de datos
    // lo usa para crear la fila del usuario en la tabla perfiles.
    const { error } = await supabase.auth.signUp({
      email: correo.trim(),
      password: clave,
      options: { data: { nombre_completo: nombre.trim() } },
    });
    setCargando(false);

    if (error) Alert.alert('No se pudo crear la cuenta', error.message);
  }

  return (
    <FormularioAcceso subtitulo="Crea tu cuenta">
      <Campo
        etiqueta="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
        placeholder="Nombre y apellidos"
      />
      <Campo
        etiqueta="Correo"
        value={correo}
        onChangeText={setCorreo}
        placeholder="correo@ejemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Campo
        etiqueta="Contraseña"
        value={clave}
        onChangeText={setClave}
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
      />
      <Boton texto="Registrarme" onPress={registrarse} cargando={cargando} />
      <Boton texto="Ya tengo cuenta" variante="secundario" onPress={() => router.back()} />
    </FormularioAcceso>
  );
}
