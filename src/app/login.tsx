import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { FormularioAcceso } from '@/components/formulario-acceso';
import { Boton, Campo } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion() {
    if (!correo.trim() || !clave) {
      Alert.alert('Datos incompletos', 'Escribe tu correo y tu contraseña.');
      return;
    }
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: clave,
    });
    setCargando(false);
    // Si no hay error, el layout raíz detecta la sesión y muestra el menú.
    if (error) Alert.alert('No se pudo iniciar sesión', 'Revisa tu correo y contraseña.');
  }

  return (
    <FormularioAcceso subtitulo="Inicia sesión para continuar">
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
        placeholder="Tu contraseña"
        secureTextEntry
      />
      <Boton texto="Iniciar sesión" onPress={iniciarSesion} cargando={cargando} />
      <Boton
        texto="Crear una cuenta"
        variante="secundario"
        onPress={() => router.push('/registro')}
      />
    </FormularioAcceso>
  );
}
