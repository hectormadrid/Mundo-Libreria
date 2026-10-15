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

        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
        try {
            $this->conexion = new mysqli($host, $user, $pass, $dbname);
        } catch (\mysqli_sql_exception $e) {
            error_log('Error de conexión a la base de datos: ' . $e->getMessage());
            $error_message = $debug ? 'Error de conexión: ' . $e->getMessage() : 'Error de conexión a la base de datos.';
            throw new \RuntimeException($error_message, 0, $e);
        }

        $this->conexion->set_charset("utf8mb4");
    }

    public static function getConnection() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance->conexion;
    }
}
