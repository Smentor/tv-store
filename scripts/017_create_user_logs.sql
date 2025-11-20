-- Crear tabla de registros de cambios de usuarios
CREATE TABLE IF NOT EXISTS public.user_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_logs ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "admin_select_logs" ON public.user_logs;
DROP POLICY IF EXISTS "admin_insert_logs" ON public.user_logs;

-- Crear función segura para verificar si es admin (si no existe ya)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas RLS
-- Solo admins pueden ver los logs
CREATE POLICY "admin_select_logs" ON public.user_logs
  FOR SELECT USING (public.is_admin());

-- Solo admins pueden insertar logs
CREATE POLICY "admin_insert_logs" ON public.user_logs
  FOR INSERT WITH CHECK (public.is_admin());

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_user_logs_user_id ON public.user_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_logs_created_at ON public.user_logs(created_at DESC);
