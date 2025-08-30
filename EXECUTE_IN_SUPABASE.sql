-- ========================================
-- SCRIPT PARA EJECUTAR EN SUPABASE SQL EDITOR
-- ========================================
-- 
-- Instrucciones:
-- 1. Ve a https://supabase.com/dashboard
-- 2. Selecciona tu proyecto
-- 3. Ve a SQL Editor
-- 4. Copia y pega este código completo
-- 5. Haz clic en "Run"

-- Agregar columnas necesarias para el perfil de usuario
ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_user_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_type VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Crear índice para búsquedas rápidas por apple_user_id
CREATE INDEX IF NOT EXISTS idx_users_apple_user_id ON users(apple_user_id);

-- Verificar que las columnas se crearon correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Mensaje de confirmación
SELECT 'Columnas creadas exitosamente! ✅' as status;
