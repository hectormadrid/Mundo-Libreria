<?php

namespace App\Database;

use mysqli;
use App\Helpers\EnvLoader;

/**
 * Clase de conexión a la base de datos para Mundo-Libreria.
 */
class Conexion {
    private static $instance = null;
    private $conexion;

    private function __construct() {
        // Cargar variables de entorno
        EnvLoader::load(__DIR__ . '/../../.env');

        $host = $_ENV['DB_HOST'] ?? 'localhost';
        $dbname = $_ENV['DB_NAME'] ?? '';
        $user = $_ENV['DB_USER'] ?? '';
        $pass = $_ENV['DB_PASS'] ?? '';
        $debug = ($_ENV['DEBUG_MODE'] ?? 'false') === 'true';

        $this->conexion = new mysqli($host, $user, $pass, $dbname);

        if ($this->conexion->connect_error) {
            $error_message = $debug ? 'Error de conexión: ' . $this->conexion->connect_error : 'Error de conexión a la base de datos.';
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $error_message]);
            exit;
        }

        $this->conexion->set_charset("utf8");
    }

    public static function getConnection() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance->conexion;
    }
}
