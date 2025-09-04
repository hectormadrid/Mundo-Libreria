<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__.'/../db/Conexion.php';

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['ID'])) {
    echo json_encode(['success' => true, 'cartCount' => 0]);
    exit;
}

$id_usuario = $_SESSION['ID'];

try {
    // Obtener el conteo total de productos en el carrito
    $stmt = $conexion->prepare("SELECT SUM(cantidad) as total_items FROM carrito WHERE id_usuario = ?");
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $result = $stmt->get_result();
    $total_items = $result->fetch_assoc()['total_items'] ?? 0;

    echo json_encode([
        'success' => true,
        'cartCount' => (int)$total_items
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'cartCount' => 0,
        'error' => $e->getMessage()
    ]);
}
?>