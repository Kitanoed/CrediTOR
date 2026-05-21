-- Run this in Supabase SQL Editor if you get "lower(bytea) does not exist" errors.
-- It converts text columns from bytea to varchar (safe to run only when columns are wrong type).

ALTER TABLE tor_records
  ALTER COLUMN student_id TYPE varchar(50) USING convert_from(student_id, 'UTF8'),
  ALTER COLUMN full_name TYPE varchar(255) USING convert_from(full_name, 'UTF8'),
  ALTER COLUMN dcn TYPE varchar(50) USING convert_from(dcn, 'UTF8'),
  ALTER COLUMN status TYPE varchar(20) USING convert_from(status, 'UTF8'),
  ALTER COLUMN uploaded_file_name TYPE varchar(500) USING convert_from(uploaded_file_name, 'UTF8'),
  ALTER COLUMN file_size TYPE varchar(50) USING convert_from(file_size, 'UTF8'),
  ALTER COLUMN verification_token TYPE varchar(500) USING convert_from(verification_token, 'UTF8');

-- If columns are already text/varchar, use this simpler version instead:
-- ALTER TABLE tor_records
--   ALTER COLUMN student_id TYPE varchar(50),
--   ALTER COLUMN full_name TYPE varchar(255),
--   ALTER COLUMN dcn TYPE varchar(50);

-- Audit logs: fix duplicate timestamp / logged_at columns (run once in Supabase SQL Editor)
UPDATE audit_logs
SET timestamp = COALESCE(timestamp, logged_at, NOW())
WHERE timestamp IS NULL;

ALTER TABLE audit_logs
  ALTER COLUMN timestamp SET NOT NULL,
  ALTER COLUMN timestamp SET DEFAULT NOW();

ALTER TABLE audit_logs DROP COLUMN IF EXISTS logged_at;
