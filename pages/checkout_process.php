<?php
require_once __DIR__ . '/../db/SessionHelper.php';
SessionHelper::start();
header('Content-Type: application/json');
require_once __DIR__.'/../db/Conexion.php';
require_once __DIR__.'/../db/SecurityHelper.php';
require_once __DIR__.'/../db/EmailHelper.php';

// 1. Verificar sesión y CSRF
if (!isset($_SESSION['ID'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado.']);
    exit;
}

if (empty($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Error de seguridad (CSRF). Inténtelo de nuevo.']);
    exit;
}

$id_usuario = $_SESSION['ID'];

// 2. Recibir y sanitizar datos del formulario
$nombre = SecurityHelper::sanitize($_POST['nombre'] ?? '');
$correo = SecurityHelper::sanitize($_POST['correo'] ?? '');
$metodo_pago = SecurityHelper::sanitize($_POST['metodo_pago'] ?? '');

if (empty($nombre) || empty($correo) || empty($metodo_pago)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Por favor completa todos los campos correctamente.']);
    exit;
}

if (!SecurityHelper::validateEmail($correo)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El formato de correo no es válido.']);
    exit;
}

try {
    $conexion->begin_transaction();

    // 3. Verificar stock con BLOQUEO de filas (FOR UPDATE)
    $sql = "SELECT p.id, p.nombre, p.precio, c.cantidad, p.stock
            FROM carrito c
            JOIN productos p ON c.id_producto = p.id
            WHERE c.id_usuario = ? FOR UPDATE";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $result = $stmt->get_result();

    $items = [];
    $total = 0;
    while ($row = $result->fetch_assoc()) {
        if ($row['cantidad'] > $row['stock']) {
            throw new Exception('No hay suficiente stock para: ' . $row['nombre']);
        }
        $items[] = $row;
        $total += $row['precio'] * $row['cantidad'];
    }

    if (empty($items)) {
        throw new Exception('Tu carrito está vacío.');
    }

    // 4. Crear pedido (Incluyendo método de pago)
    $sql_pedido = "INSERT INTO pedido (id_usuario, total, metodo_pago, estado) VALUES (?, ?, ?, 'pendiente')";
    $stmt_pedido = $conexion->prepare($sql_pedido);
    $stmt_pedido->bind_param("ids", $id_usuario, $total, $metodo_pago);
    $stmt_pedido->execute();
    $id_pedido = $stmt_pedido->insert_id;
    $stmt_pedido->close();

    // 5. Insertar detalle y actualizar stock
    $sql_detalle = "INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio) VALUES (?, ?, ?, ?)";
    $stmt_detalle = $conexion->prepare($sql_detalle);
    
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

    // 6. Vaciar carrito
    $stmt_delete_cart = $conexion->prepare("DELETE FROM carrito WHERE id_usuario = ?");
    $stmt_delete_cart->bind_param("i", $id_usuario);
    $stmt_delete_cart->execute();
    $stmt_delete_cart->close();

    // Simulación de pago
    if ($metodo_pago === 'tarjeta' || $metodo_pago === 'transferencia') {
        $stmt_update_pedido_estado = $conexion->prepare("UPDATE pedido SET estado='pagado' WHERE id=?");
        $stmt_update_pedido_estado->bind_param("i", $id_pedido);
        $stmt_update_pedido_estado->execute();
        $stmt_update_pedido_estado->close();
    }

    $conexion->commit();

    // ENVIAR CORREO DE CONFIRMACIÓN DE PEDIDO DETALLADO
    try {
        $asunto = "Confirmación de Pedido #$id_pedido - Mundo Librería";
        $cuerpo = EmailHelper::getOrderTemplate($nombre, $id_pedido, $total, $items);
        EmailHelper::send($correo, $asunto, $cuerpo);
    } catch (Exception $e_mail) {
        error_log("Error al enviar email de confirmación: " . $e_mail->getMessage());
        // No detenemos el proceso si falla el correo, el pedido ya está creado
    }

    echo json_encode(['success' => true, 'id_pedido' => $id_pedido]);

} catch (Exception $e) {
    if (isset($conexion) && $conexion->connect_errno == 0) {
        $conexion->rollback();
    }
    error_log('CRITICAL ERROR en checkout_process: ' . $e->getMessage());
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conexion)) $conexion->close();
}
?>