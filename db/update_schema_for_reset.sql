-- Aumentar la seguridad de la tabla `usuario` para la recuperación de contraseña

ALTER TABLE `usuario`
ADD COLUMN `reset_token_hash` VARCHAR(64) NULL DEFAULT NULL,
ADD COLUMN `reset_token_expires_at` DATETIME NULL DEFAULT NULL,
ADD UNIQUE (`reset_token_hash`);

-- Este script añade dos columnas a la tabla `usuario`:
-- 1. `reset_token_hash`: Para almacenar una versión hasheada del token de reseteo.
--    Se hace único para prevenir colisiones.
-- 2. `reset_token_expires_at`: Para almacenar la fecha y hora de expiración del token.
--    Esto es crucial para que los enlaces de reseteo no sean válidos para siempre.
