-- Agregar columnas max_screens y plan_type a la tabla plans
ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS max_screens integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'basic' CHECK (plan_type IN ('basic', 'premium', 'premium_plus'));

-- Actualizar los planes existentes con los valores correctos
UPDATE public.plans SET max_screens = 1, plan_type = 'basic' WHERE id = 'basic';
UPDATE public.plans SET max_screens = 2, plan_type = 'premium' WHERE id = 'premium';
UPDATE public.plans SET max_screens = 4, plan_type = 'premium_plus' WHERE id = 'premium-plus';

-- Comentarios para documentar las columnas
COMMENT ON COLUMN public.plans.max_screens IS 'Número máximo de pantallas/dispositivos simultáneos permitidos';
COMMENT ON COLUMN public.plans.plan_type IS 'Tipo de plan: basic, premium, o premium_plus';
