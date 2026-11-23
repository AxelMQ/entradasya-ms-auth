-- Semillas: 001_seed_initial_users.sql
-- Base de datos: auth_db
-- Descripción: Usuarios iniciales de prueba para organizador, portero y cliente

INSERT INTO users (id, name, email, password_hash, role, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Organizador Oficial', 'organizador@entradasya.com', '$2a$10$bkw3u9VmwBX/oSD2/0Cq6OVd.1gxq/mAlxBqNHyH4JY5Ran5SgrGK', 'organizador', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'Portero Puerta Norte', 'portero@entradasya.com', '$2a$10$riQJyofys675EKAdZ3GrJ.hIwewS6MZysO5NPuhOseBgvTziUUo/K', 'portero', TRUE),
    ('33333333-3333-3333-3333-333333333333', 'Cliente Frecuente', 'cliente@entradasya.com', '$2a$10$aMXZyzvsYkO1zW8ztbCzP.SbAbOjTsaZqLr35KuKScVz4w/6a3je6', 'cliente', TRUE)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;
