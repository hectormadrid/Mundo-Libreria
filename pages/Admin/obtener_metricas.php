<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../../db/Conexion.php';

// Verificar que sea administrador
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso no autorizado.']);
    exit;
}

try {
    $metrics = [];

    // Total Productos
    $r = $conexion->query("SELECT COUNT(*) AS c FROM productos");
    $metrics['totalProductos'] = ($r && $rr = $r->fetch_assoc()) ? $rr['c'] : 0;

    // Productos Activos
    $r = $conexion->query("SELECT COUNT(*) AS c FROM productos WHERE estado = 'Activo'");
    $metrics['productosActivos'] = ($r && $rr = $r->fetch_assoc()) ? $rr['c'] : 0;

    // Stock Bajo
    $r = $conexion->query("SELECT COUNT(*) AS c FROM productos WHERE Stock < 10 AND estado = 'Activo'");
    $metrics['stockBajo'] = ($r && $rr = $r->fetch_assoc()) ? $rr['c'] : 0;

    // Valor Total del Inventario
    $r = $conexion->query("SELECT IFNULL(SUM(precio * Stock),0) AS v FROM productos WHERE estado = 'Activo'");
    $metrics['valorTotal'] = ($r && $rr = $r->fetch_assoc()) ? (float)$rr['v'] : 0.0;
    
    echo json_encode([
        'success' => true,
        'data' => $metrics
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error del servidor: ' . $e->getMessage()
    ]);
} finally {
    if (isset($conexion)) $conexion->close();
}
