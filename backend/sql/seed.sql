-- Insert seed clients
INSERT INTO clientes (dni, nombre, apellidos, telefono, email, estado) VALUES
('12345678A', 'Juan', 'Pérez García', '600111222', 'juan.perez@email.com', 'en_tramite'),
('87654321B', 'María', 'López Sánchez', '611222333', 'maria.lopez@email.com', 'pendiente'),
('11223344C', 'Carlos', 'Rodríguez Martínez', '622333444', 'carlos.rod@email.com', 'resuelto'),
('55667788D', 'Ana', 'Gómez Ruiz', '633444555', 'ana.gomez@email.com', 'rechazado')
ON CONFLICT (dni) DO NOTHING;

-- Insert seed vehicles
INSERT INTO vehiculos (cliente_id, matricula, marca, modelo, anio_matriculacion, color, puertas, observaciones) VALUES
((SELECT id FROM clientes WHERE dni = '12345678A'), '1234BBB', 'Seat', 'Ibiza', 2010, 'Blanco', 5, 'Comprado en concesionario oficial'),
((SELECT id FROM clientes WHERE dni = '12345678A'), '5678CCC', 'Volkswagen', 'Golf', 2012, 'Negro', 3, 'Segunda mano'),
((SELECT id FROM clientes WHERE dni = '87654321B'), '9999DDD', 'Renault', 'Clio', 2008, 'Rojo', 5, 'Afectado por sobreprecio confirmado'),
((SELECT id FROM clientes WHERE dni = '11223344C'), '0000FFF', 'Ford', 'Focus', 2011, 'Azul', 5, 'Documentación completa aportada')
ON CONFLICT (matricula) DO NOTHING;

-- Insert seed incidents
INSERT INTO incidencias (cliente_id, titulo, descripcion, resuelta) VALUES
((SELECT id FROM clientes WHERE dni = '12345678A'), 'Falta factura original', 'El cliente no encuentra la factura de compra de 2010.', false),
((SELECT id FROM clientes WHERE dni = '87654321B'), 'Duplicidad de DNI', 'Revisar si el DNI coincide con otro registro antiguo.', false),
((SELECT id FROM clientes WHERE dni = '11223344C'), 'Solicitud de abono', 'Cálculo de indemnización aceptado, pendiente de pago.', true)
ON CONFLICT DO NOTHING;
