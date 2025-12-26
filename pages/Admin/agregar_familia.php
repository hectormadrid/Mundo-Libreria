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

// Validar entrada
$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$id_categoria = isset($_POST['id_categoria']) ? (int)$_POST['id_categoria'] : 0;

if (empty($nombre) || $id_categoria <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Todos los campos son obligatorios.']);
    exit;
}

try {
    // Verificar que el nombre de la familia no se repita DENTRO de la misma categoría
    $stmt_check = $conexion->prepare("SELECT id FROM familias WHERE nombre = ? AND id_categoria = ?");
    $stmt_check->bind_param("si", $nombre, $id_categoria);
    $stmt_check->execute();
    $stmt_check->store_result();
    
    if ($stmt_check->num_rows > 0) {
        http_response_code(409); // Conflict
        echo json_encode(['success' => false, 'error' => 'Ya existe una familia con ese nombre en esta categoría.']);
        $stmt_check->close();
        $conexion->close();
        exit;
    }
    $stmt_check->close();

    // Insertar nueva familia
    $stmt = $conexion->prepare("INSERT INTO familias (nombre, id_categoria) VALUES (?, ?)");
    $stmt->bind_param("si", $nombre, $id_categoria);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Familia agregada correctamente.']);
    } else {
        throw new Exception('Error al guardar la familia: ' . $stmt->error);
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conexion)) $conexion->close();
}
