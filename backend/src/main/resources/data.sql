-- Script de inicialización de la base de datos

-- Insertar roles
INSERT INTO roles (nombre) VALUES ('ROLE_ADMIN') ON CONFLICT DO NOTHING;
INSERT INTO roles (nombre) VALUES ('ROLE_OPERADOR') ON CONFLICT DO NOTHING;
INSERT INTO roles (nombre) VALUES ('ROLE_CLIENTE') ON CONFLICT DO NOTHING;

-- Insertar usuario administrador por defecto
-- Password: admin123 (BCrypt encoded)
INSERT INTO usuarios (username, password, nombre, apellido, email, activo, fecha_creacion, fecha_actualizacion)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrador', 'Sistema', 'admin@parqueadero.com', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Asignar rol de administrador al usuario admin
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id FROM usuarios u, roles r 
WHERE u.username = 'admin' AND r.nombre = 'ROLE_ADMIN'
ON CONFLICT DO NOTHING;

-- Insertar tarifas por defecto (valores en COP - Pesos Colombianos)
INSERT INTO tarifas (tipo_vehiculo, tarifa_hora, tarifa_dia, tarifa_minuto_adicional, activa, fecha_creacion, fecha_actualizacion)
VALUES 
    ('AUTO', 5000.00, 40000.00, 100.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MOTO', 3000.00, 25000.00, 50.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('BICICLETA', 2000.00, 15000.00, 30.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('CAMION', 8000.00, 60000.00, 150.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Insertar configuración de espacios por defecto
INSERT INTO configuracion (tipo_vehiculo, capacidad_total, activa)
VALUES 
    ('AUTO', 50, true),
    ('MOTO', 30, true),
    ('BICICLETA', 20, true),
    ('CAMION', 10, true)
ON CONFLICT DO NOTHING;
