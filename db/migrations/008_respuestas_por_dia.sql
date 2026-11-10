-- Cuando la temporada dura más que el banco de preguntas, las preguntas se repiten. Una respuesta
-- queda atada a su DÍA (antes, una pregunta repetida ya no se podía responder: "ya respondiste").
alter table cc.respuestas drop constraint if exists respuestas_player_id_pregunta_id_key;
create unique index if not exists respuestas_jugador_dia_pregunta on cc.respuestas (player_id, dia, pregunta_id);
