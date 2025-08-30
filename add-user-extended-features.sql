-- Script SQL para añadir funcionalidades extendidas de usuario
-- Ejecutar en Supabase SQL Editor

-- 1. Añadir columnas adicionales a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'es',
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"push": true, "email": true, "marketing": false}',
ADD COLUMN IF NOT EXISTS total_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(20),
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Crear tabla de visitas de usuarios
CREATE TABLE IF NOT EXISTS user_visits (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    apple_user_id VARCHAR(255) NOT NULL,
    coffee_shop_id INTEGER NOT NULL,
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_minutes INTEGER,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (coffee_shop_id) REFERENCES coffee_shops(id) ON DELETE CASCADE
);

-- 3. Crear tabla de referencias/referidos
CREATE TABLE IF NOT EXISTS user_referrals (
    id SERIAL PRIMARY KEY,
    referrer_user_id VARCHAR(255) NOT NULL,
    referrer_apple_id VARCHAR(255) NOT NULL,
    referred_user_id VARCHAR(255),
    referred_apple_id VARCHAR(255),
    referral_code VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, expired
    reward_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(referrer_user_id, referred_user_id)
);

-- 4. Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    apple_user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general', -- general, promotion, system, referral
    status VARCHAR(20) DEFAULT 'unread', -- unread, read, archived
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    data JSONB, -- datos adicionales específicos del tipo de notificación
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_user_visits_user_id ON user_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_visits_apple_user_id ON user_visits(apple_user_id);
CREATE INDEX IF NOT EXISTS idx_user_visits_coffee_shop_id ON user_visits(coffee_shop_id);
CREATE INDEX IF NOT EXISTS idx_user_visits_visit_date ON user_visits(visit_date);

CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer ON user_referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referred ON user_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_referrals_status ON user_referrals(status);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_apple_user_id ON user_notifications(apple_user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_status ON user_notifications(status);
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON user_notifications(type);
CREATE INDEX IF NOT EXISTS idx_user_notifications_scheduled ON user_notifications(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_users_language ON users(language);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity_at);

-- 6. Función para generar códigos de referido únicos
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generar código de 8 caracteres alfanuméricos
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Verificar si ya existe
        SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = code) INTO exists;
        
        -- Si no existe, salir del loop
        IF NOT exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para generar códigos de referido automáticamente
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_referral_code ON users;
CREATE TRIGGER trigger_set_referral_code
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_referral_code();

-- 8. Función para actualizar contadores de usuarios
CREATE OR REPLACE FUNCTION update_user_counters()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar contador de visitas
    UPDATE users 
    SET total_visits = (
        SELECT COUNT(*) 
        FROM user_visits 
        WHERE apple_user_id = NEW.apple_user_id
    )
    WHERE apple_user_id = NEW.apple_user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para actualizar contadores automáticamente
DROP TRIGGER IF EXISTS trigger_update_visit_counter ON user_visits;
CREATE TRIGGER trigger_update_visit_counter
    AFTER INSERT OR DELETE ON user_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_user_counters();

-- 10. Insertar datos de ejemplo para testing
INSERT INTO user_visits (user_id, apple_user_id, coffee_shop_id, visit_date, duration_minutes, rating, notes)
VALUES 
    ('user_1756568904309_f2qu58irk', 'test_user_123', 1, NOW() - INTERVAL '2 days', 45, 5, 'Excelente café y ambiente'),
    ('user_1756568904309_f2qu58irk', 'test_user_123', 2, NOW() - INTERVAL '5 days', 30, 4, 'Buen servicio, un poco ruidoso'),
    ('user_1756568904309_f2qu58irk', 'test_user_123', 3, NOW() - INTERVAL '1 week', 60, 5, 'Mi lugar favorito para trabajar')
ON CONFLICT DO NOTHING;

INSERT INTO user_notifications (user_id, apple_user_id, title, message, type, priority)
VALUES 
    ('user_1756568904309_f2qu58irk', 'test_user_123', 'Bienvenido a MoodCityGuide', 'Gracias por unirte a nuestra comunidad de amantes del café', 'system', 'normal'),
    ('user_1756568904309_f2qu58irk', 'test_user_123', 'Nueva cafetería cerca', 'Hemos añadido una nueva cafetería a 500m de tu ubicación', 'general', 'normal'),
    ('user_1756568904309_f2qu58irk', 'test_user_123', 'Oferta especial', '20% de descuento en tu próxima visita', 'promotion', 'high')
ON CONFLICT DO NOTHING;

-- 11. Actualizar usuarios existentes con códigos de referido
UPDATE users 
SET referral_code = generate_referral_code() 
WHERE referral_code IS NULL;

COMMIT;
