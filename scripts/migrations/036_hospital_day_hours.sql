-- 036: horas fijas en la hoja de tratamientos.
-- day_hours: las horas del día (0-23, hora local de la clínica) en que toca el tratamiento, por ejemplo
--   {8,13,20} para constantes a las 08:00, 13:00 y 20:00. Cuando está presente, frequency_hours va NULL
--   y el tratamiento se repite cada día a esas horas hasta suspenderlo o dar el alta.
ALTER TABLE hospital_treatments ADD COLUMN IF NOT EXISTS day_hours SMALLINT[];
