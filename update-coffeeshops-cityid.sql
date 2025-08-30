-- Actualizar cafeterías existentes para asociarlas con ciudades
-- Ejecutar este SQL en el editor SQL de Supabase

-- Primero verificar si existe la columna cityId en CoffeeShop
-- Si no existe, agregarla
ALTER TABLE "CoffeeShop" 
ADD COLUMN IF NOT EXISTS "cityId" TEXT;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_coffeeshop_cityid ON "CoffeeShop"("cityId");

-- Actualizar cafeterías existentes para asociarlas con Madrid
-- (asumiendo que las cafeterías actuales están en Madrid)
UPDATE "CoffeeShop" 
SET "cityId" = 'madrid-espana'
WHERE "cityId" IS NULL OR "cityId" = '';

-- Verificar la actualización
SELECT id, name, address, "cityId" FROM "CoffeeShop" LIMIT 10;

