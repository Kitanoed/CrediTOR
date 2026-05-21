-- Optional: run in Supabase SQL Editor if you prefer manual schema over Hibernate ddl-auto.
-- Hibernate "update" mode will create/update tables automatically on startup.

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'registrar',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS tor_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    dcn VARCHAR(50) NOT NULL UNIQUE,
    date_issued DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    uploaded_file_name VARCHAR(500),
    file_size VARCHAR(50),
    verification_token VARCHAR(500) NOT NULL UNIQUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    dcn VARCHAR(50),
    details TEXT,
    registrar_id VARCHAR(100),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tor_records_dcn ON tor_records(dcn);
CREATE INDEX IF NOT EXISTS idx_tor_records_token ON tor_records(verification_token);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
