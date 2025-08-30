-- Crear tabla City en Supabase
-- Ejecutar este SQL en el editor SQL de Supabase

CREATE TABLE IF NOT EXISTS "City" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT,
    image TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_city_name ON "City"(name);
CREATE INDEX IF NOT EXISTS idx_city_country ON "City"(country);
CREATE INDEX IF NOT EXISTS idx_city_active ON "City"("isActive");

-- Crear trigger para actualizar updatedAt automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_city_updated_at BEFORE UPDATE ON "City"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar ciudad de ejemplo (Madrid)
INSERT INTO "City" (id, name, country, latitude, longitude, description, "isActive")
VALUES (
    'madrid-espana',
    'Madrid',
    'España',
    40.4168,
    -3.7038,
    'La capital de España, conocida por su vibrante cultura cafetera y sus acogedores espacios para trabajar.',
    true
)
ON CONFLICT (id) DO NOTHING;

-- Verificar que la tabla se creó correctamente
SELECT * FROM "City" LIMIT 5;

