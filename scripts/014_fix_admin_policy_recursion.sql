-- Función segura para verificar si es admin sin causar recursión
-- SECURITY DEFINER permite que la función se ejecute con permisos de superusuario
-- evitando así el chequeo de políticas RLS que causa el bucle
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Eliminar la política recursiva anterior
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Crear la nueva política usando la función segura
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id  -- El usuario puede ver su propio perfil
    OR
    public.is_admin() -- O es administrador (usando la función segura)
  );

-- Actualizar las otras políticas para usar la función segura (opcional pero recomendado para consistencia)
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT
  USING (
    auth.uid() = user_id -- El usuario ve sus propias suscripciones
    OR
    public.is_admin() -- Admin ve todas
  );

DROP POLICY IF EXISTS "Admins can view all credentials" ON public.credentials;
CREATE POLICY "Admins can view all credentials" ON public.credentials
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can view all invoices" ON public.invoices;
CREATE POLICY "Admins can view all invoices" ON public.invoices
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    public.is_admin()
  );
