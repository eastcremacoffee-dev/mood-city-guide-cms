-- Script para agregar las columnas del perfil de usuario a la tabla users
-- Ejecutar en Supabase SQL Editor

-- Verificar si las columnas ya existen antes de agregarlas
DO $$ 
BEGIN
    -- Agregar columna bio si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
        RAISE NOTICE 'Columna bio agregada';
    ELSE
        RAISE NOTICE 'Columna bio ya existe';
    END IF;

    -- Agregar columna location si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'location') THEN
        ALTER TABLE users ADD COLUMN location VARCHAR(255);
        RAISE NOTICE 'Columna location agregada';
    ELSE
        RAISE NOTICE 'Columna location ya existe';
    END IF;

    -- Agregar columna favorite_type si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'favorite_type') THEN
        ALTER TABLE users ADD COLUMN favorite_type VARCHAR(100);
        RAISE NOTICE 'Columna favorite_type agregada';
    ELSE
        RAISE NOTICE 'Columna favorite_type ya existe';
    END IF;

    -- Agregar columna profile_image_url si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'profile_image_url') THEN
        ALTER TABLE users ADD COLUMN profile_image_url TEXT;
        RAISE NOTICE 'Columna profile_image_url agregada';
    ELSE
        RAISE NOTICE 'Columna profile_image_url ya existe';
    END IF;

    -- Agregar columna updated_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna updated_at agregada';
    ELSE
        RAISE NOTICE 'Columna updated_at ya existe';
    END IF;
END $$;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_apple_user_id ON users(apple_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Comentarios en las columnas para documentación
COMMENT ON COLUMN users.bio IS 'Biografía del usuario';
COMMENT ON COLUMN users.location IS 'Ubicación del usuario (ciudad, país)';
COMMENT ON COLUMN users.favorite_type IS 'Tipo de café favorito del usuario';
COMMENT ON COLUMN users.profile_image_url IS 'URL de la imagen de perfil del usuario';
COMMENT ON COLUMN users.updated_at IS 'Fecha y hora de la última actualización del perfil';

-- Mostrar la estructura actual de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
