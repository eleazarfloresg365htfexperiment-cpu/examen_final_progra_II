-- =====================================================================
-- Renta Virtual de Películas - esquema de base de datos (Supabase)
-- Se ejecuta una sola vez en el SQL Editor de Supabase.
-- =====================================================================

-- ---------- 1. TABLAS ------------------------------------------------

-- Perfil de cada usuario. El id es el mismo id que Supabase Auth
-- le asigna al usuario cuando se registra.
create table public.perfiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  nombre_completo text not null default '',
  edad            int  check (edad between 1 and 120),
  no_tarjeta      text check (no_tarjeta ~ '^[0-9]{13,19}$'),
  foto_url        text,
  rol             text not null default 'usuario'
                  check (rol in ('usuario', 'administrador')),
  creado_en       timestamptz not null default now()
);

-- Catálogo de películas.
create table public.peliculas (
  id        bigint generated always as identity primary key,
  titulo    text not null,
  genero    text not null default '',
  anio      int,
  creado_en timestamptz not null default now()
);

-- Registro de cada renta. Se guarda una copia del título para que el
-- informe siga mostrando la película aunque el administrador la elimine.
create table public.rentas (
  id              bigint generated always as identity primary key,
  usuario_id      uuid   not null references public.perfiles (id) on delete cascade,
  pelicula_id     bigint references public.peliculas (id) on delete set null,
  pelicula_titulo text   not null default '',
  fecha_inicio    date   not null default current_date,
  fecha_fin       date   not null,
  creado_en       timestamptz not null default now(),
  check (fecha_fin > fecha_inicio)
);

-- ---------- 2. FUNCIONES Y TRIGGERS ----------------------------------

-- Devuelve true si el usuario que hace la petición es administrador.
-- Es "security definer" para poder leer perfiles sin chocar con RLS.
create function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol = 'administrador'
  );
$$;

-- Al registrarse un usuario en Auth, se le crea su fila en perfiles.
create function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre_completo)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre_completo', ''));
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_nuevo_usuario();

-- REGLA DE NEGOCIO (se ejecuta en la base de datos, no en la app):
--   1. La renta siempre queda a nombre del usuario que tiene la sesión.
--   2. Las fechas las pone el servidor: inicia hoy y dura 3 días.
--   3. No se puede rentar una película que ya se tiene rentada.
--   4. Máximo 3 rentas activas por usuario.
create function public.validar_renta()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  rentas_activas int;
begin
  new.usuario_id   := (select auth.uid());
  new.fecha_inicio := current_date;
  new.fecha_fin    := current_date + 3;

  select titulo into new.pelicula_titulo
  from public.peliculas where id = new.pelicula_id;

  if new.pelicula_titulo is null then
    raise exception 'La película no existe.';
  end if;

  if exists (
    select 1 from public.rentas
    where usuario_id = new.usuario_id
      and pelicula_id = new.pelicula_id
      and fecha_fin >= current_date
  ) then
    raise exception 'Ya tienes rentada esta película.';
  end if;

  select count(*) into rentas_activas
  from public.rentas
  where usuario_id = new.usuario_id and fecha_fin >= current_date;

  if rentas_activas >= 3 then
    raise exception 'Solo puedes tener 3 rentas activas a la vez.';
  end if;

  return new;
end;
$$;

create trigger antes_de_rentar
  before insert on public.rentas
  for each row execute function public.validar_renta();

-- ---------- 3. SEGURIDAD (RLS) ---------------------------------------

alter table public.perfiles  enable row level security;
alter table public.peliculas enable row level security;
alter table public.rentas    enable row level security;

-- Permisos base: solo usuarios con sesión, y solo lo necesario.
revoke all on public.perfiles, public.peliculas, public.rentas from anon, authenticated;

grant select on public.perfiles to authenticated;
-- El usuario puede editar sus datos, pero NO la columna rol.
grant update (nombre_completo, edad, no_tarjeta, foto_url) on public.perfiles to authenticated;

grant select, insert, delete on public.peliculas to authenticated;
grant select on public.rentas to authenticated;
grant insert (pelicula_id) on public.rentas to authenticated;

-- perfiles: cada quien ve y edita el suyo; el administrador ve todos.
create policy "ver perfil propio o admin" on public.perfiles
  for select to authenticated
  using (id = (select auth.uid()) or public.es_admin());

create policy "editar perfil propio" on public.perfiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- peliculas: todos las ven; solo el administrador agrega y elimina.
create policy "ver peliculas" on public.peliculas
  for select to authenticated using (true);

create policy "admin agrega peliculas" on public.peliculas
  for insert to authenticated with check (public.es_admin());

create policy "admin elimina peliculas" on public.peliculas
  for delete to authenticated using (public.es_admin());

-- rentas: cada quien ve las suyas; el administrador ve todas (informe).
create policy "ver rentas propias o admin" on public.rentas
  for select to authenticated
  using (usuario_id = (select auth.uid()) or public.es_admin());

create policy "rentar" on public.rentas
  for insert to authenticated with check (true);

-- ---------- 4. FOTOGRAFÍAS (Storage) ---------------------------------

insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true);

-- Cada usuario solo puede subir o reemplazar archivos dentro de una
-- carpeta con su propio id:  fotos/<id-del-usuario>/perfil.jpg
create policy "subir foto propia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "reemplazar foto propia" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ---------- 5. PELÍCULAS INICIALES -----------------------------------

insert into public.peliculas (titulo, genero, anio) values
  ('El Padrino',              'Drama',           1972),
  ('Volver al Futuro',        'Ciencia ficción', 1985),
  ('Jurassic Park',           'Aventura',        1993),
  ('Matrix',                  'Ciencia ficción', 1999),
  ('El Señor de los Anillos', 'Fantasía',        2001),
  ('Buscando a Nemo',         'Animación',       2003),
  ('El Origen',               'Ciencia ficción', 2010),
  ('Coco',                    'Animación',       2017);
