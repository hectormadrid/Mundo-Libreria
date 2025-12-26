<?php
header('Content-Type: application/json');
require_once __DIR__.'/../../db/Conexion.php';

// Este endpoint es público y no requiere sesión de admin.

$id_categoria = isset($_GET['categoria_id']) ? (int)$_GET['categoria_id'] : 0;
$nombre_categoria = isset($_GET['categoria_nombre']) ? trim($_GET['categoria_nombre']) : '';

try {
    // Si se proporciona el nombre de la categoría, encontrar su ID primero
    if ($id_categoria <= 0 && !empty($nombre_categoria)) {
        $stmt_cat = $conexion->prepare("SELECT id FROM categorias WHERE nombre = ?");
        $stmt_cat->bind_param("s", $nombre_categoria);
        $stmt_cat->execute();
        $result_cat = $stmt_cat->get_result();
        if ($row_cat = $result_cat->fetch_assoc()) {
            $id_categoria = (int)$row_cat['id'];
        }
        $stmt_cat->close();
    }

    $data = [];
    if ($id_categoria > 0) {
        $stmt = $conexion->prepare("SELECT id, nombre FROM familias WHERE id_categoria = ? ORDER BY nombre ASC");
        $stmt->bind_param("i", $id_categoria);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        $stmt->close();
    }
    
    echo json_encode($data);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
} finally {
    if (isset($conexion)) $conexion->close();
}
