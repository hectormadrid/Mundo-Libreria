<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__.'/../db/Conexion.php';

// Verificar sesión
if (!isset($_SESSION['ID'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado.']);
    exit;
}

$id_usuario = $_SESSION['ID'];

// Verificar que haya productos en el carrito
$sql = "SELECT p.id, p.nombre, p.precio, c.cantidad, p.stock
        FROM carrito c
        JOIN productos p ON c.id_producto = p.id
        WHERE c.id_usuario = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
$total = 0;
while ($row = $result->fetch_assoc()) {
    if ($row['cantidad'] > $row['stock']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No hay suficiente stock para el producto: ' . htmlspecialchars($row['nombre'])]);
        exit;
    }
    $items[] = $row;
    $total += $row['precio'] * $row['cantidad'];
}

if (empty($items)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Tu carrito está vacío.']);
    exit;
}

// Recibir datos del formulario
$nombre = $_POST['nombre'] ?? '';
$correo = $_POST['correo'] ?? '';
$metodo_pago = $_POST['metodo_pago'] ?? '';

// Validaciones simples
if (empty($nombre) || empty($correo) || empty($metodo_pago)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Por favor completa todos los campos.']);
    exit;
}

try {
    $conexion->begin_transaction();

    // Crear pedido
    $sql_pedido = "INSERT INTO pedido (id_usuario, total, estado) VALUES (?, ?, 'pendiente')";
    $stmt_pedido = $conexion->prepare($sql_pedido);
    $stmt_pedido->bind_param("id", $id_usuario, $total);
    $stmt_pedido->execute();
    $id_pedido = $stmt_pedido->insert_id;
    $stmt_pedido->close();

    // Insertar detalle_pedido
    $sql_detalle = "INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio) VALUES (?, ?, ?, ?)";
    $stmt_detalle = $conexion->prepare($sql_detalle);
    
    // Descontar stock
    $sql_stock = "UPDATE productos SET stock = stock - ? WHERE id = ?";
    $stmt_stock = $conexion->prepare($sql_stock);

    foreach ($items as $item) {
        $stmt_detalle->bind_param("iiid", $id_pedido, $item['id'], $item['cantidad'], $item['precio']);
        $stmt_detalle->execute();

        $stmt_stock->bind_param("ii", $item['cantidad'], $item['id']);
        $stmt_stock->execute();
    }
    $stmt_detalle->close();
    $stmt_stock->close();


    // Vaciar carrito
    $stmt_delete_cart = $conexion->prepare("DELETE FROM carrito WHERE id_usuario = ?");
    $stmt_delete_cart->bind_param("i", $id_usuario);
    $stmt_delete_cart->execute();
    $stmt_delete_cart->close();

    // Simulación de pago (aquí integrarías Stripe/PayPal si lo deseas)
    if ($metodo_pago === 'tarjeta' || $metodo_pago === 'transferencia') {
        $stmt_update_pedido_estado = $conexion->prepare("UPDATE pedido SET estado='pagado' WHERE id=?");
        $stmt_update_pedido_estado->bind_param("i", $id_pedido);
        $stmt_update_pedido_estado->execute();
        $stmt_update_pedido_estado->close();
    }

    $conexion->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    $conexion->rollback();
    error_log('Error en checkout_process: ' . $e->getMessage()); // Guardar error real en logs
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Ocurrió un error en el servidor. Por favor, inténtelo más tarde.']);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conexion)) $conexion->close();
}
