<?php
$host = "localhost";
$user = "root";
$password = "";
$dbname = "Mundo_libreria";

// Crear conexión
$conexion = new mysqli($host, $user, $password, $dbname);

// Verificar conexión
if ($conexion->connect_error) {
    die("Error de conexión a la base de datos: " . $conexion->connect_error);
}

// Establecer el conjunto de caracteres a utf8
$conexion->set_charset("utf8");
?>