-- Permitir que los usuarios registren sus propias acciones en user_logs
-- Esta migración agrega una política para que los usuarios puedan insertar logs de sus propias acciones

-- Eliminar política restrictiva existente
DROP POLICY IF EXISTS "admin_insert_logs" ON public.user_logs;

-- Política: Admins pueden insertar cualquier log
CREATE POLICY "admin_insert_logs" ON public.user_logs
  FOR INSERT WITH CHECK (public.is_admin());

-- Política: Usuarios pueden insertar logs de sus propias acciones
-- (cuando admin_id es NULL y user_id coincide con su ID)
CREATE POLICY "users_insert_own_logs" ON public.user_logs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND admin_id IS NULL
  );

-- Política: Usuarios pueden ver sus propios logs
CREATE POLICY "users_select_own_logs" ON public.user_logs
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin()
  );
