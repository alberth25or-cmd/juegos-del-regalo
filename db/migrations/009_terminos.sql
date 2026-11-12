-- Todos juegan todas las casas (decisión de Luis, 2026-11-12). En vez de elegir Picante sí/no,
-- cada agente confirma UNA vez, al inicio, que es mayor de edad y acepta las reglas.
alter table cc.players add column if not exists acepta_terminos_at timestamptz;
-- Desde qué día le llegan las preguntas de Picante (para no cobrar días anteriores a quien antes
-- había elegido no jugarla). null = desde el primer día.
alter table cc.players add column if not exists picante_desde int;
