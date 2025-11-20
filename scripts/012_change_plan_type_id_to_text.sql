-- Cambiar el tipo de columna plan_type_id de INTEGER a TEXT para permitir múltiples IDs
-- Por ejemplo: "1", "2,4,5", "10,15,20"

ALTER TABLE plans 
ALTER COLUMN plan_type_id TYPE TEXT USING plan_type_id::TEXT;

-- Agregar comentario explicativo
COMMENT ON COLUMN plans.plan_type_id IS 'ID o IDs del tipo de paquete (puede ser un solo número o múltiples separados por comas, ej: "1" o "2,4,5")';
