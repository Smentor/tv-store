-- Agregar DROP POLICY para evitar errores si ya existen las políticas
-- Crear tabla de perfiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  whatsapp text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Crear tabla de planes
CREATE TABLE IF NOT EXISTS public.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price decimal(10, 2) NOT NULL,
  features text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Insertar planes por defecto
INSERT INTO public.plans (id, name, description, price, features) VALUES
  ('basic', 'Básico', 'Perfecto para empezar', 9.99, ARRAY['1 pantalla', 'HD', '200+ canales', 'Soporte básico']),
  ('premium', 'Premium', 'Más canales y pantallas', 14.99, ARRAY['2 pantallas', 'Full HD', '300+ canales', 'Soporte prioritario', 'Grabación en la nube']),
  ('premium-plus', 'Premium Plus', 'La mejor experiencia', 19.99, ARRAY['4 pantallas', '4K', '400+ canales', 'Soporte 24/7', 'Grabación ilimitada', 'Acceso anticipado'])
ON CONFLICT DO NOTHING;

-- Crear tabla de suscripciones
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.plans(id),
  plan_name text NOT NULL,
  price decimal(10, 2) NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  next_billing_date timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Crear tabla de credenciales
CREATE TABLE IF NOT EXISTS public.credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  password text NOT NULL,
  mac_address text NOT NULL,
  reseller_code text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Crear tabla de facturas
CREATE TABLE IF NOT EXISTS public.invoices (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'failed')),
  invoice_date date NOT NULL,
  due_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes primero para evitar conflictos
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.subscriptions;
DROP POLICY IF EXISTS "credentials_select_own" ON public.credentials;
DROP POLICY IF EXISTS "credentials_insert_own" ON public.credentials;
DROP POLICY IF EXISTS "credentials_update_own" ON public.credentials;
DROP POLICY IF EXISTS "invoices_select_own" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert_own" ON public.invoices;

-- Políticas RLS para profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para subscriptions
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_update_own" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para credentials
CREATE POLICY "credentials_select_own" ON public.credentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "credentials_insert_own" ON public.credentials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "credentials_update_own" ON public.credentials FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para invoices
CREATE POLICY "invoices_select_own" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "invoices_insert_own" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Crear función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
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

-- Crear trigger solo si no existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
