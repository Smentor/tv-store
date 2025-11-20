-- Script para insertar datos dummy de prueba
-- Este script inserta facturas dummy para usuarios existentes

-- Insertar facturas dummy (requiere usuarios existentes)
INSERT INTO public.invoices (id, user_id, amount, status, invoice_date, due_date)
SELECT 
  'INV-' || gen_random_uuid()::text,
  id,
  99.99,
  CASE WHEN RANDOM() < 0.7 THEN 'paid'::text ELSE 'pending'::text END,
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE - INTERVAL '10 days'
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.invoices (id, user_id, amount, status, invoice_date, due_date)
SELECT 
  'INV-' || gen_random_uuid()::text,
  id,
  99.99,
  'paid',
  CURRENT_DATE - INTERVAL '60 days',
  CURRENT_DATE - INTERVAL '40 days'
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.invoices (id, user_id, amount, status, invoice_date, due_date)
SELECT 
  'INV-' || gen_random_uuid()::text,
  id,
  99.99,
  'paid',
  CURRENT_DATE - INTERVAL '90 days',
  CURRENT_DATE - INTERVAL '70 days'
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;
