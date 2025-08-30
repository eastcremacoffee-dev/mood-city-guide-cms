-- Crear tabla para propuestas de cafeterías
CREATE TABLE IF NOT EXISTS coffee_shop_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Información básica de la propuesta
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(100) DEFAULT 'Spain',
    
    -- Coordenadas geográficas
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Información de contacto
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    
    -- Redes sociales
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    
    -- Horarios (JSON con estructura de días de la semana)
    opening_hours JSONB,
    
    -- Características y servicios
    features TEXT[], -- Array de características como "WiFi", "Pet Friendly", etc.
    price_range VARCHAR(10) DEFAULT '€€', -- €, €€, €€€, €€€€
    
    -- Información del usuario que envía la propuesta
    submitted_by_user_id VARCHAR(255), -- ID del usuario de la app
    submitted_by_name VARCHAR(255),
    submitted_by_email VARCHAR(255),
    
    -- Estado de la propuesta
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, in_review
    admin_notes TEXT, -- Notas del administrador
    
    -- Imágenes
    image_urls TEXT[], -- Array de URLs de imágenes
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(255) -- ID del admin que revisó
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_proposals_status ON coffee_shop_proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_city ON coffee_shop_proposals(city);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON coffee_shop_proposals(created_at);
CREATE INDEX IF NOT EXISTS idx_proposals_submitted_by ON coffee_shop_proposals(submitted_by_user_id);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_proposals_updated_at ON coffee_shop_proposals;
CREATE TRIGGER trigger_update_proposals_updated_at
    BEFORE UPDATE ON coffee_shop_proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_proposals_updated_at();

-- Insertar algunos datos de ejemplo para testing
INSERT INTO coffee_shop_proposals (
    name, description, address, city, latitude, longitude,
    phone, email, website, instagram,
    opening_hours, features, price_range,
    submitted_by_name, submitted_by_email, status
) VALUES 
(
    'Café Propuesta Ejemplo',
    'Una cafetería acogedora con ambiente bohemio y excelente café de especialidad.',
    'Calle Ejemplo 123, Madrid',
    'Madrid',
    40.4168,
    -3.7038,
    '+34 123 456 789',
    'contacto@cafeejemplo.com',
    'https://cafeejemplo.com',
    '@cafeejemplo',
    '{"Lunes": "08:00-20:00", "Martes": "08:00-20:00", "Miércoles": "08:00-20:00", "Jueves": "08:00-20:00", "Viernes": "08:00-22:00", "Sábado": "09:00-22:00", "Domingo": "09:00-20:00"}',
    ARRAY['WiFi', 'Pet Friendly', 'Terraza', 'Café de Especialidad'],
    '€€',
    'Juan Pérez',
    'juan.perez@email.com',
    'pending'
),
(
    'Tostadero Artesanal',
    'Tostadero local con café de origen único y cursos de barista.',
    'Avenida del Café 45, Barcelona',
    'Barcelona',
    41.3851,
    2.1734,
    '+34 987 654 321',
    'info@tostaderoartesanal.com',
    'https://tostaderoartesanal.com',
    '@tostaderoartesanal',
    '{"Lunes": "07:30-19:00", "Martes": "07:30-19:00", "Miércoles": "07:30-19:00", "Jueves": "07:30-19:00", "Viernes": "07:30-21:00", "Sábado": "08:00-21:00", "Domingo": "Cerrado"}',
    ARRAY['Café de Especialidad', 'Tostado Propio', 'Cursos', 'Venta de Granos'],
    '€€€',
    'María García',
    'maria.garcia@email.com',
    'in_review'
);

-- Comentarios sobre la estructura
COMMENT ON TABLE coffee_shop_proposals IS 'Tabla para almacenar propuestas de nuevas cafeterías enviadas por usuarios';
COMMENT ON COLUMN coffee_shop_proposals.status IS 'Estado de la propuesta: pending, approved, rejected, in_review';
COMMENT ON COLUMN coffee_shop_proposals.opening_hours IS 'Horarios en formato JSON con días de la semana como claves';
COMMENT ON COLUMN coffee_shop_proposals.features IS 'Array de características y servicios de la cafetería';
COMMENT ON COLUMN coffee_shop_proposals.price_range IS 'Rango de precios: €, €€, €€€, €€€€';
