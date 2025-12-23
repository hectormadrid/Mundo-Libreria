<?php
header('Content-Type: application/json');
require_once __DIR__.'/../../db/Conexion.php';

session_start();
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso no autorizado.']);
    exit;
}

try {
    $query = "SELECT id, nombre, fecha_creacion FROM categorias ORDER BY id DESC";
    $result = $conexion->query($query);
    
    $data = [];
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "data" => $data
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
