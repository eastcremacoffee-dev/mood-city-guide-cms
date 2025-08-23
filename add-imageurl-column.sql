-- Script para agregar la columna imageUrl a la tabla CoffeeShop
-- Ejecutar en el SQL Editor de Supabase Dashboard

ALTER TABLE "CoffeeShop" 
ADD COLUMN "imageUrl" TEXT;

-- Verificar que se agregó correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'CoffeeShop' 
AND column_name = 'imageUrl';
