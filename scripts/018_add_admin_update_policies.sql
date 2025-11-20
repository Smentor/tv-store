-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can update all credentials" ON public.credentials;
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can insert notification batches" ON public.notification_batches;
DROP POLICY IF EXISTS "Admins can view all user logs" ON public.user_logs;
DROP POLICY IF EXISTS "Admins can insert user logs" ON public.user_logs;

-- Permitir a los administradores actualizar todos los perfiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Permitir a los administradores actualizar todas las suscripciones
CREATE POLICY "Admins can update all subscriptions" ON public.subscriptions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Permitir a los administradores actualizar todas las credenciales
CREATE POLICY "Admins can update all credentials" ON public.credentials
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Permitir a los administradores insertar notificaciones
CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Permitir a los administradores insertar en notification_batches
CREATE POLICY "Admins can insert notification batches" ON public.notification_batches
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Permitir a los administradores ver logs de usuarios
CREATE POLICY "Admins can view all user logs" ON public.user_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Permitir a los administradores insertar logs
CREATE POLICY "Admins can insert user logs" ON public.user_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
