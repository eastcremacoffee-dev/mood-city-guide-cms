-- Agregar columnas necesarias a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_user_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_type VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Crear índice para apple_user_id
CREATE INDEX IF NOT EXISTS idx_users_apple_user_id ON users(apple_user_id);

-- Mostrar estructura actualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
