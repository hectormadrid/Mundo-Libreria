<?php
// Este script se debe ejecutar una sola vez desde la terminal: php db/migracion_familias.php

echo "Iniciando migración de base de datos...\n";

// Requerir el archivo de conexión
require_once __DIR__ . '/Conexion.php';

// Variable para contar errores
$errores = 0;

// --- 1. Crear la tabla `familias` ---
$sql_crear_familias = "
CREATE TABLE IF NOT EXISTS `familias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255) NOT NULL,
  `id_categoria` INT NOT NULL,
  CONSTRAINT `fk_familia_categoria`
    FOREIGN KEY (`id_categoria`)
    REFERENCES `categorias`(`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

echo "Intentando crear la tabla `familias`... ";
if ($conexion->query($sql_crear_familias)) {
    echo "¡Éxito!\n";
} else {
    echo "Error: " . $conexion->error . "\n";
    $errores++;
}


// --- 2. Añadir columna `id_familia` a la tabla `productos` ---

// Primero, verificar si la columna ya existe para evitar errores
$sql_verificar_columna = "SHOW COLUMNS FROM `productos` LIKE 'id_familia'";
$resultado = $conexion->query($sql_verificar_columna);

if ($resultado->num_rows == 0) {
    $sql_alterar_productos = "
    ALTER TABLE `productos`
    ADD COLUMN `id_familia` INT NULL DEFAULT NULL,
    ADD CONSTRAINT `fk_producto_familia`
      FOREIGN KEY (`id_familia`)
      REFERENCES `familias`(`id`)
      ON DELETE SET NULL;
    ";

    echo "La columna `id_familia` no existe. Intentando añadirla a `productos`... ";
    if ($conexion->query($sql_alterar_productos)) {
        echo "¡Éxito!\n";
    } else {
        echo "Error: " . $conexion->error . "\n";
        $errores++;
    }
} else {
    echo "La columna `id_familia` ya existe en la tabla `productos`. No se requieren cambios.\n";
}


// --- Resumen Final ---
echo "\n--- Migración completada ---\n";
if ($errores == 0) {
    echo "La base de datos se ha actualizado correctamente.\n";
} else {
    echo "Se encontraron $errores errores durante el proceso. Por favor, revisa los mensajes anteriores.\n";
}

// Cerrar la conexión
$conexion->close();
?>
