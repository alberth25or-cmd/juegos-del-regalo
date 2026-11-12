-- Casa Corazón (pedido de Luis, 2026-11-12): una pregunta bonita por día. Sus respuestas son un poco
-- más largas y van a la ficha del amigo secreto ("Lo más bonito").
alter table cc.respuestas drop constraint if exists respuestas_casa_check;
alter table cc.respuestas add constraint respuestas_casa_check check (casa in (2, 3, 4, 5, 6));
alter table cc.respuestas drop constraint if exists respuestas_respuesta_check;
alter table cc.respuestas add constraint respuestas_respuesta_check check (char_length(respuesta) <= 160);
