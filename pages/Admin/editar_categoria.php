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

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';

if (empty($id) || empty($nombre)) {
    echo json_encode(['success' => false, 'error' => 'Faltan datos para la actualización.']);
    exit;
}

try {
    // Verificar si el nuevo nombre de la categoría ya existe en otro ID
    $stmt = $conexion->prepare("SELECT id FROM categorias WHERE nombre = ? AND id != ?");
    $stmt->bind_param("si", $nombre, $id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'error' => 'El nuevo nombre de la categoría ya está en uso.']);
        exit;
    }

    // Actualizar categoría
    $stmt = $conexion->prepare("UPDATE categorias SET nombre = ? WHERE id = ?");
    $stmt->bind_param("si", $nombre, $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Categoría actualizada correctamente.']);
        } else {
            echo json_encode(['success' => false, 'error' => 'No se encontró la categoría o no hubo cambios.']);
        }
    } else {
        throw new Exception('Error al actualizar la categoría.');
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
