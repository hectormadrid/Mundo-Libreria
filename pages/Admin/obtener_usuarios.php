<?php
// obtener_usuarios.php - Versión corregida
session_start();
header('Content-Type: application/json');
require_once __DIR__.'/../../db/Conexion.php';

// Verificar si es administrador

try {
    $query = "SELECT id, rut, nombre, correo FROM usuario ORDER BY id DESC";
    $stmt = $conexion->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();

    $usuarios = [];
    while ($row = $result->fetch_assoc()) {
        $usuarios[] = $row;
    }

    // Asegurar que siempre devuelve un array en 'data'
    echo json_encode([
        'data' => $usuarios
    ]);

} catch (Exception $e) {
    // En caso de error, devolver array vacío
    echo json_encode([
        'data' => []
    ]);
}
?>