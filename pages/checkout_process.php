<?php
session_start();
require_once __DIR__.'/../db/Conexion.php';

// Verificar sesión
if (!isset($_SESSION['ID'])) {
    header('Location: login.php');
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
        die("No hay suficiente stock para el producto: " . htmlspecialchars($row['nombre']));
    }
    $items[] = $row;
    $total += $row['precio'] * $row['cantidad'];
}

if (empty($items)) {
    die("Tu carrito está vacío.");
}

// Recibir datos del formulario
$nombre = $_POST['nombre'] ?? '';
$correo = $_POST['correo'] ?? '';
$metodo_pago = $_POST['metodo_pago'] ?? '';

// Validaciones simples
if (empty($nombre) || empty($correo) || empty($metodo_pago)) {
    die("Por favor completa todos los campos.");
}

// Crear pedido
$sql = "INSERT INTO pedido (id_usuario, total, estado) VALUES (?, ?, 'pendiente')";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("id", $id_usuario, $total);
$stmt->execute();
$id_pedido = $stmt->insert_id;

// Insertar detalle_pedido
$sql = "INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio) VALUES (?, ?, ?, ?)";
$stmt = $conexion->prepare($sql);
foreach ($items as $item) {
    $stmt->bind_param("iiid", $id_pedido, $item['id'], $item['cantidad'], $item['precio']);
    $stmt->execute();

    // Descontar stock
    $update = $conexion->prepare("UPDATE productos SET stock = stock - ? WHERE id = ?");
    $update->bind_param("ii", $item['cantidad'], $item['id']);
    $update->execute();
}

// Vaciar carrito
$conexion->query("DELETE FROM carrito WHERE id_usuario = $id_usuario");

// Simulación de pago (aquí integrarías Stripe/PayPal si lo deseas)
if ($metodo_pago === 'contra_entrega' || $metodo_pago === 'transferencia') {
    $conexion->query("UPDATE pedido SET estado='pagado' WHERE id=$id_pedido");
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Compra Exitosa - Mundo Librería</title>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
<script>
Swal.fire({
    title: '¡Compra exitosa!',
    text: 'Tu pedido  ha sido procesado correctamente.',
    icon: 'success',
    confirmButtonText: 'Ir al inicio'
}).then(() => {
    window.location.href = 'index.php?success=1';
});
</script>
</body>
</html>