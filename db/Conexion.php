<?php
$host = "localhost";
$user = "root";
$password = "";
$dbname = "Mundo_libreria";

$conexion = new mysqli($host, $user, $password, $dbname);

if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error de conexión a la base de datos: ' . $conexion->connect_error
    ]);
    exit;
}

$conexion->set_charset("utf8");
?>
