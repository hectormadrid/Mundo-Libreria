<?php
// Incluir el archivo de configuración de la base de datos
require_once __DIR__ . '/../db_config.php';

// Crear la conexión a la base de datos utilizando las constantes
$conexion = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Verificar la conexión
if ($conexion->connect_error) {
    // Si estamos en modo de depuración, mostrar el error detallado
    if (defined('DEBUG_MODE') && DEBUG_MODE === true) {
        $error_message = 'Error de conexión a la base de datos: ' . $conexion->connect_error;
    } else {
        // En producción, mostrar un mensaje genérico
        $error_message = 'Error de conexión a la base de datos. Por favor, inténtelo más tarde.';
    }

    // Devolver una respuesta de error genérica
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $error_message
    ]);
    exit;
}

// Establecer el juego de caracteres a UTF-8
$conexion->set_charset("utf8");
?>

