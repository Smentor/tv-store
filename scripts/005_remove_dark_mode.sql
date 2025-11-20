-- Eliminar columna dark_mode de user_settings
ALTER TABLE public.user_settings DROP COLUMN IF EXISTS dark_mode;
