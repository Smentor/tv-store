-- Agregar columna plan_type_id para almacenar el ID numérico del tipo de paquete
ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS plan_type_id integer;

-- Comentario para documentar la columna
COMMENT ON COLUMN public.plans.plan_type_id IS 'ID numérico del tipo de paquete (1, 4, 10, etc) para uso del backend';
