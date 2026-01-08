<?php
// Datos de conexión a la base de datos
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'ingrid');
define('DB_PASSWORD', 'Hectorpola2505!');
define('DB_NAME', 'Mundo_libreria');

// Intentar conectar a la base de datos MySQL
$conexion = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Comprobar conexión
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}
// Establecer el juego de caracteres a utf8 para evitar problemas con tildes y eñes
$conexion->set_charset("utf8");
?>