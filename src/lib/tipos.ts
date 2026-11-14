// Forma de los datos que devuelven las tablas de Supabase.

export type Perfil = {
  id: string;
  nombre_completo: string;
  edad: number | null;
  no_tarjeta: string | null;
  foto_url: string | null;
  rol: 'usuario' | 'administrador';
};

export type Pelicula = {
  id: number;
  titulo: string;
  genero: string;
  anio: number | null;
};

export type Renta = {
  id: number;
  pelicula_titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  // Solo viene en el informe del administrador.
  perfiles?: { nombre_completo: string } | null;
};
