-- Modificar la columna plan_type para aceptar cualquier texto (sin restricciones)
ALTER TABLE public.plans
DROP CONSTRAINT IF EXISTS plans_plan_type_check;

-- Cambiar plan_type a text sin restricciones
ALTER TABLE public.plans
ALTER COLUMN plan_type TYPE text,
ALTER COLUMN plan_type DROP DEFAULT;

-- Agregar columna para el ID del tipo de paquete
ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS plan_type_id integer;

-- Comentarios para documentar las columnas
COMMENT ON COLUMN public.plans.plan_type IS 'Nombre personalizable del tipo de paquete (ej: Gold, Silver, Enterprise)';
COMMENT ON COLUMN public.plans.plan_type_id IS 'ID numérico asociado al tipo de paquete para uso del backend';
