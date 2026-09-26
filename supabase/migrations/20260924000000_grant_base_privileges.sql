-- En un proyecto Supabase hospedado, los roles `anon` y `authenticated` ya
-- vienen con USAGE sobre el schema `public` y privilegios por defecto sobre
-- tablas futuras. Lo declaramos igual acá para que las migrations sean
-- reproducibles de punta a punta contra cualquier Postgres (por ejemplo en
-- este mismo entorno de testing), sin depender de configuración implícita
-- del dashboard.
--
-- IMPORTANTE: esto NO reemplaza RLS. RLS sigue siendo la barrera real fila
-- por fila; esto solo habilita que la policy tenga oportunidad de evaluarse.

grant usage on schema public to anon, authenticated;

alter default privileges in schema public
  grant select on tables to anon, authenticated;

alter default privileges in schema public
  grant insert on tables to anon, authenticated;
