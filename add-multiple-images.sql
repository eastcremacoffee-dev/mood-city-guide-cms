-- Script para agregar columnas adicionales de imágenes
-- Ejecutar en el SQL Editor de Supabase Dashboard

ALTER TABLE "CoffeeShop" 
ADD COLUMN "imageUrl2" TEXT,
ADD COLUMN "imageUrl3" TEXT;

-- Verificar que se agregaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'CoffeeShop' 
AND column_name IN ('imageUrl', 'imageUrl2', 'imageUrl3')
ORDER BY column_name;
