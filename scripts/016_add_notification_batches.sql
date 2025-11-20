-- Agregar columna batch_id a notificaciones
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS batch_id uuid;

-- Crear tabla de lotes de notificaciones
CREATE TABLE IF NOT EXISTS notification_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  target_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Configurar eliminación en cascada: si borras el lote, se borran las notificaciones
ALTER TABLE notifications 
  DROP CONSTRAINT IF EXISTS fk_notifications_batch;

ALTER TABLE notifications 
  ADD CONSTRAINT fk_notifications_batch 
  FOREIGN KEY (batch_id) 
  REFERENCES notification_batches(id) 
  ON DELETE CASCADE;

-- Habilitar RLS
ALTER TABLE notification_batches ENABLE ROW LEVEL SECURITY;

-- Políticas para administradores
CREATE POLICY "Admins can manage notification batches" ON notification_batches
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
