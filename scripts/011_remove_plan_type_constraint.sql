-- Eliminar el check constraint de plan_type para permitir valores personalizados
ALTER TABLE public.plans
DROP CONSTRAINT IF EXISTS plans_plan_type_check;

-- Modificar la columna para aceptar cualquier texto
ALTER TABLE public.plans
ALTER COLUMN plan_type DROP DEFAULT;

-- Comentario para documentar que ahora acepta valores personalizados
COMMENT ON COLUMN public.plans.plan_type IS 'Nombre del tipo de paquete (personalizable: Gold, Silver, Enterprise, etc)';
