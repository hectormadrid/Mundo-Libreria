-- Este script elimina la antigua columna 'categoria' de la tabla 'productos'.
-- Ejecútalo SOLO después de confirmar que toda la funcionalidad de categorías
-- está funcionando correctamente con el nuevo sistema de 'id_categoria'.
-- Se recomienda hacer una copia de seguridad antes.

ALTER TABLE `productos` DROP COLUMN `categoria`;
