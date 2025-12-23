<?php
header('Content-Type: application/json');
require_once __DIR__.'/../../db/Conexion.php';

session_start();
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso no autorizado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';

if (empty($nombre)) {
    echo json_encode(['success' => false, 'error' => 'El nombre de la categoría es obligatorio.']);
    exit;
}

try {
    // Verificar si la categoría ya existe
    $stmt = $conexion->prepare("SELECT id FROM categorias WHERE nombre = ?");
    $stmt->bind_param("s", $nombre);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'error' => 'La categoría ya existe.']);
        exit;
    }

    // Insertar nueva categoría
    $stmt = $conexion->prepare("INSERT INTO categorias (nombre) VALUES (?)");
    $stmt->bind_param("s", $nombre);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Categoría agregada correctamente.']);
    } else {
        throw new Exception('Error al guardar la categoría.');
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
