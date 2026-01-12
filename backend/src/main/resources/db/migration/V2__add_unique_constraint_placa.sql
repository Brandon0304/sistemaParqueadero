-- Normalizar placas existentes
UPDATE vehiculos SET placa = UPPER(REPLACE(REPLACE(REPLACE(placa, ' ', ''), '-', ''), '.', ''));

-- Agregar constraint UNIQUE a la columna placa
ALTER TABLE vehiculos ADD CONSTRAINT uk_vehiculo_placa UNIQUE (placa);
