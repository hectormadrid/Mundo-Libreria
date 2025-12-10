<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../db/Conexion.php';

// Verificar que sea administrador
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['data' => [], 'error' => 'Acceso no autorizado.']);
    exit;
}

try {
    $query = "SELECT id, nombre FROM Administrador ORDER BY id DESC";
    $result = $conexion->query($query);
    
    $admins = [];
    while($row = $result->fetch_assoc()) {
        $admins[] = $row;
    }
    
    echo json_encode(['data' => $admins]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['data' => [], 'error' => $e->getMessage()]);
}
?>