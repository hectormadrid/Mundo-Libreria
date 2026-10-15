-- Migración para la versión con API + React.
-- Ejecutar una vez sobre una base existente (después de update_pedido_table.sql).
-- Las instalaciones nuevas con base_de_datos.sql ya incluyen estos cambios.

-- El checkout pide dirección y teléfono de contacto; ahora se guardan en el pedido.
ALTER TABLE pedido ADD COLUMN direccion_envio VARCHAR(255) NULL AFTER metodo_pago;
ALTER TABLE pedido ADD COLUMN telefono_contacto VARCHAR(20) NULL AFTER direccion_envio;

-- El RUT con formato (12.345.678-5) tiene 12 caracteres; VARCHAR(10) lo truncaba
-- y se perdía el dígito verificador.
ALTER TABLE usuario MODIFY COLUMN rut VARCHAR(12) NOT NULL;
