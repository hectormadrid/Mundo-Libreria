<?php
/**
 * Archivo de conexión a la base de datos para Mundo-Libreria.
 * Utiliza variables de entorno para mayor seguridad.
 */
require_once __DIR__ . '/EnvLoader.php';

// Cargar variables de entorno desde el archivo .env en la raíz del proyecto
EnvLoader::load(__DIR__ . '/../.env');

// Obtener credenciales desde $_ENV
$host = $_ENV['DB_HOST'] ?? 'localhost';
$dbname = $_ENV['DB_NAME'] ?? '';
$user = $_ENV['DB_USER'] ?? '';
$pass = $_ENV['DB_PASS'] ?? '';
$debug = ($_ENV['DEBUG_MODE'] ?? 'false') === 'true';

// Crear la conexión a la base de datos
$conexion = new mysqli($host, $user, $pass, $dbname);

// Verificar la conexión
if ($conexion->connect_error) {
    // Si estamos en modo de depuración, mostrar el error detallado
    if ($debug) {
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

// Definir constante DEBUG_MODE para compatibilidad con otros archivos
if (!defined('DEBUG_MODE')) {
    define('DEBUG_MODE', $debug);
}
?>
