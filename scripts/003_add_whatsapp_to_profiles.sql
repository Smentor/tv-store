-- Agregar campo whatsapp a la tabla profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp text;

-- Actualizar la función handle_new_user para incluir campos adicionales
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.credentials (user_id, username, password, mac_address, reseller_code)
  VALUES (
    new.id,
    new.email || '_' || substr(md5(random()::text), 1, 8),
    'Temp' || substr(md5(random()::text), 1, 12),
    upper(substr(md5(random()::text), 1, 12)),
    'iptv_' || substr(md5(random()::text), 1, 8)
  );
  
  INSERT INTO public.subscriptions (user_id, plan_id, plan_name, price, next_billing_date)
  VALUES (
    new.id,
    'basic',
    'Básico',
    9.99,
    NOW() + INTERVAL '30 days'
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar updated_at timestamp cuando se modifica whatsapp
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_timestamp ON public.profiles;
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();
