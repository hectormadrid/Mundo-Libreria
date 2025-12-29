<?php
header('Content-Type: application/json');

session_start();
// Verificar que sea administrador
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso no autorizado.']);
    exit;
}

try {
    require_once __DIR__.'/../../db/Conexion.php';
    
  
    $query = "SELECT p.id, p.nombre, p.marca, p.color, CAST(p.precio AS UNSIGNED) AS precio, p.descripcion, p.stock, p.estado, p.imagen, p.codigo_barras, p.fecha_creacion, p.id_categoria, c.nombre AS categoria, p.id_familia, f.nombre AS familia_nombre FROM productos p LEFT JOIN categorias c ON p.id_categoria = c.id LEFT JOIN familias f ON p.id_familia = f.id";
    $result = $conexion->query($query);
    
    $data = [];
    while($row = $result->fetch_assoc()) {
        if (isset($row['descripcion']) && $row['descripcion'] === '0') {
            $row['descripcion'] = ''; // Convertir "0" a cadena vacía para el frontend
        }
        $data[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "data" => $data,
        "debug" => [
            "request_time" => date('Y-m-d H:i:s'),
            "row_count" => count($data)
        ]
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
