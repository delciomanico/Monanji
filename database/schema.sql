-- MININT Complaint System Database Schema
-- PostgreSQL Database for Monanji App

-- Create database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== ENUMS ====================

-- Complaint Types
CREATE TYPE complaint_type AS ENUM (
    'missing-person',
    'common-crime',
    'corruption',
    'domestic-violence',
    'cyber-crime'
);

-- Complaint Status
CREATE TYPE complaint_status AS ENUM (
    'submitted',      -- Denúncia submetida
    'received',       -- Recebida
    'reviewing',      -- Em análise
    'investigating',  -- Em investigação
    'resolved',       -- Resolvida
    'archived',       -- Arquivada
    'cancelled'       -- Cancelada
);

-- Crime Types for Common Crimes
CREATE TYPE common_crime_type AS ENUM (
    'theft',          -- Furto
    'robbery',        -- Roubo
    'assault',        -- Agressão física
    'homicide',       -- Homicídio
    'kidnapping',     -- Sequestro
    'rape',           -- Violação
    'vandalism',      -- Vandalismo
    'trafficking',    -- Tráfico
    'fraud',          -- Burla
    'other'           -- Outro
);

-- Corruption Types
CREATE TYPE corruption_type AS ENUM (
    'bribery',        -- Suborno
    'extortion',      -- Extorsão
    'nepotism',       -- Nepotismo
    'abuse_of_power', -- Abuso de poder
    'fraud',          -- Fraude
    'embezzlement',   -- Desvio de fundos
    'other'           -- Outro
);

-- Violence Types for Domestic Violence
CREATE TYPE violence_type AS ENUM (
    'physical',       -- Física
    'psychological',  -- Psicológica
    'sexual',         -- Sexual
    'moral',          -- Moral
    'patrimonial',    -- Patrimonial
    'multiple'        -- Múltiplas
);

-- Frequency for Domestic Violence
CREATE TYPE violence_frequency AS ENUM (
    'first_time',     -- Primeira vez
    'occasional',     -- Ocasional
    'frequent',       -- Frequente
    'daily'           -- Diária
);

-- Cyber Crime Types
CREATE TYPE cyber_crime_type AS ENUM (
    'online_fraud',   -- Burla/Golpe online
    'identity_theft', -- Roubo de identidade
    'phishing',       -- Phishing
    'blackmail',      -- Chantagem
    'cyberbullying',  -- Cyberbullying
    'hacking',        -- Invasão de sistema
    'other'           -- Outro
);

-- Gender
CREATE TYPE gender_type AS ENUM (
    'male',           -- Masculino
    'female',         -- Feminino
    'other',          -- Outro
    'prefer_not_say'  -- Prefiro não informar
);

-- User Roles
CREATE TYPE user_role AS ENUM (
    'admin',
    'investigator',
    'operator',
    'citizen'
);

-- ==================== TABLES ====================

-- Users table for system authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'citizen',
    bi_number VARCHAR(14) UNIQUE, -- Bilhete de Identidade
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main complaints table
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol_number VARCHAR(50) UNIQUE NOT NULL,
    complaint_type complaint_type NOT NULL,
    status complaint_status DEFAULT 'submitted',
    is_anonymous BOOLEAN DEFAULT false,
    
    -- Reporter information (null if anonymous)
    reporter_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_name VARCHAR(255),
    reporter_contact VARCHAR(20),
    reporter_email VARCHAR(255),
    reporter_bi VARCHAR(14),
    
    -- Common fields
    incident_date DATE,
    incident_time TIME,
    location TEXT,
    description TEXT NOT NULL,
    
    -- Assigned investigator
    investigator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Metadata
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Missing person specific details
CREATE TABLE missing_person_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    
    -- Person details
    full_name VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age > 0 AND age <= 150),
    gender gender_type,
    physical_description TEXT,
    
    -- Disappearance details
    last_seen_location TEXT,
    last_seen_date DATE,
    last_seen_time TIME,
    clothing_description TEXT,
    last_seen_with TEXT,
    
    -- Additional info
    medical_conditions TEXT,
    frequent_places TEXT,
    relationship_to_reporter VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Common crime specific details
CREATE TABLE common_crime_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    
    crime_type common_crime_type NOT NULL,
    other_crime_type VARCHAR(255), -- When crime_type = 'other'
    brief_description TEXT,
    people_involved TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Corruption specific details
CREATE TABLE corruption_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    
    corruption_type corruption_type NOT NULL,
    institution VARCHAR(255) NOT NULL,
    official_name VARCHAR(255),
    estimated_amount DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'AOA',
    how_known TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Domestic violence specific details
CREATE TABLE domestic_violence_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    
    -- Victim details
    victim_name VARCHAR(255) NOT NULL,
    victim_age INTEGER CHECK (victim_age > 0 AND victim_age <= 150),
    victim_gender gender_type,
    
    -- Violence details
    relationship_with_aggressor VARCHAR(255),
    violence_type violence_type NOT NULL,
    frequency violence_frequency,
    children_involved BOOLEAN,
    needs_medical_help BOOLEAN,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cyber crime specific details
CREATE TABLE cyber_crime_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    
    cyber_crime_type cyber_crime_type NOT NULL,
    platform VARCHAR(255),
    url TEXT,
    contact_method TEXT,
    suspect_info TEXT,
    estimated_loss DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'AOA',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaint updates/timeline
CREATE TABLE complaint_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    status complaint_status NOT NULL,
    update_description TEXT NOT NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true, -- Whether this update is visible to the reporter
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evidence files (photos, documents, etc.)
CREATE TABLE complaint_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- image/jpeg, image/png, application/pdf, etc.
    file_size INTEGER,
    description TEXT,
    
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System logs for audit
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'update',
    is_read BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== FUNCTIONS ====================

-- Generate protocol number
CREATE OR REPLACE FUNCTION generate_protocol_number()
RETURNS TEXT AS $$
DECLARE
    new_protocol TEXT;
    counter INTEGER;
BEGIN
    -- Generate format: DENUNCIA-YYYYMMDD-NNNN
    SELECT COUNT(*) + 1 INTO counter 
    FROM complaints 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    new_protocol := 'DENUNCIA-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    
    RETURN new_protocol;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================== TRIGGERS ====================

-- Auto-update timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate protocol number
CREATE OR REPLACE FUNCTION set_protocol_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.protocol_number IS NULL OR NEW.protocol_number = '' THEN
        NEW.protocol_number := generate_protocol_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_complaint_protocol BEFORE INSERT ON complaints
    FOR EACH ROW EXECUTE FUNCTION set_protocol_number();

-- ==================== INITIAL DATA ====================

-- Create admin user
INSERT INTO users (email, password_hash, full_name, role, bi_number) VALUES 
('admin@minint.gov.ao', crypt('admin123', gen_salt('bf')), 'Administrador do Sistema', 'admin', '000000000LA000');

-- Create sample investigator
INSERT INTO users (email, password_hash, full_name, phone, role, bi_number) VALUES 
('investigador@minint.gov.ao', crypt('inv123', gen_salt('bf')), 'Inspector Manuel Santos', '+244923456789', 'investigator', '001234567LA001');

-- ==================== VIEWS ====================

-- Complete complaint view with all details
CREATE VIEW complaint_full_view AS
SELECT 
    c.*,
    u.full_name as investigator_name,
    u.phone as investigator_phone,
    u.email as investigator_email,
    
    -- Missing person details
    mpd.full_name as missing_person_name,
    mpd.age as missing_person_age,
    mpd.gender as missing_person_gender,
    mpd.last_seen_location,
    mpd.last_seen_date,
    
    -- Crime details  
    ccd.crime_type as common_crime_type,
    ccd.other_crime_type,
    
    -- Corruption details
    cod.corruption_type,
    cod.institution,
    cod.estimated_amount as corruption_amount,
    
    -- Violence details
    dvd.victim_name,
    dvd.victim_age,
    dvd.violence_type,
    dvd.frequency as violence_frequency,
    
    -- Cyber crime details
    cycd.cyber_crime_type,
    cycd.platform as cyber_platform,
    cycd.estimated_loss as cyber_loss

FROM complaints c
LEFT JOIN users u ON c.investigator_id = u.id
LEFT JOIN missing_person_details mpd ON c.id = mpd.complaint_id
LEFT JOIN common_crime_details ccd ON c.id = ccd.complaint_id
LEFT JOIN corruption_details cod ON c.id = cod.complaint_id
LEFT JOIN domestic_violence_details dvd ON c.id = dvd.complaint_id
LEFT JOIN cyber_crime_details cycd ON c.id = cycd.complaint_id;

-- Recent complaints summary
CREATE VIEW recent_complaints_summary AS
SELECT 
    DATE(created_at) as complaint_date,
    complaint_type,
    status,
    COUNT(*) as count
FROM complaints 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), complaint_type, status
ORDER BY complaint_date DESC;

-- ==================== INDEXES FOR PERFORMANCE ====================

-- Basic indexes for main table
CREATE INDEX idx_complaints_protocol ON complaints(protocol_number);
CREATE INDEX idx_complaints_type ON complaints(complaint_type);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_reporter ON complaints(reporter_user_id);
CREATE INDEX idx_complaints_investigator ON complaints(investigator_id);
CREATE INDEX idx_complaints_created ON complaints(created_at);

-- Additional composite indexes
CREATE INDEX idx_complaints_type_status ON complaints(complaint_type, status);
CREATE INDEX idx_complaints_reporter_bi ON complaints(reporter_bi) WHERE reporter_bi IS NOT NULL;
CREATE INDEX idx_complaints_location ON complaints USING GIN(to_tsvector('portuguese', location));
CREATE INDEX idx_complaints_description ON complaints USING GIN(to_tsvector('portuguese', description));

-- Other table indexes
CREATE INDEX idx_updates_complaint ON complaint_updates(complaint_id);
CREATE INDEX idx_updates_created ON complaint_updates(created_at);
CREATE INDEX idx_evidence_complaint ON complaint_evidence(complaint_id);
CREATE INDEX idx_logs_user ON system_logs(user_id);
CREATE INDEX idx_logs_action ON system_logs(action);
CREATE INDEX idx_logs_created ON system_logs(created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_complaint ON notifications(complaint_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- Missing person specific indexes
CREATE INDEX idx_missing_person_name ON missing_person_details USING GIN(to_tsvector('portuguese', full_name));
CREATE INDEX idx_missing_person_location ON missing_person_details USING GIN(to_tsvector('portuguese', last_seen_location));

-- Date range queries
CREATE INDEX idx_complaints_incident_date ON complaints(incident_date) WHERE incident_date IS NOT NULL;
CREATE INDEX idx_missing_person_last_seen ON missing_person_details(last_seen_date) WHERE last_seen_date IS NOT NULL;

-- ==================== SECURITY ====================

-- Row Level Security (RLS) examples
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own complaints or public info if they are investigators
CREATE POLICY complaint_access_policy ON complaints
    FOR SELECT
    USING (
        -- Own complaints
        reporter_user_id = current_setting('app.current_user_id')::UUID
        OR
        -- Investigators can see assigned complaints
        (investigator_id = current_setting('app.current_user_id')::UUID)
        OR
        -- Admins can see all
        (EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('app.current_user_id')::UUID 
            AND role = 'admin'
        ))
    );

-- Create app_user role and grant permissions
CREATE ROLE app_user WITH LOGIN PASSWORD 'app_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;
