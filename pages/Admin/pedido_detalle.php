<?php
require_once __DIR__ . '/../../db/Conexion.php';

if (!isset($_GET['id'])) {
    echo "<p class='text-red-500'>ID de pedido no válido.</p>";
    exit;
}

$id_pedido = intval($_GET['id']);

$sql = "SELECT dp.cantidad, dp.precio, pr.nombre 
        FROM detalle_pedido dp
        JOIN productos pr ON dp.id_producto = pr.id
        WHERE dp.id_pedido = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $id_pedido);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "<p class='text-gray-500'>No hay productos en este pedido.</p>";
    exit;
}

echo "<table class='w-full text-left border-collapse'>
        <thead>
            <tr class='border-b'>
                <th class='py-2'>Producto</th>
                <th class='py-2 text-center'>Cantidad</th>
                <th class='py-2 text-center'>Precio</th>
            </tr>
        </thead>
        <tbody>";

while ($row = $result->fetch_assoc()) {
    $subtotal = $row['cantidad'] * $row['precio'];
    echo "<tr class='border-b'>
            <td class='py-2'>" . htmlspecialchars($row['nombre']) . "</td>
            <td class='py-2 text-center'>" . $row['cantidad'] . "</td>
            <td class='py-2 text-center'>$" . number_format($row['precio'], 0) . "</td>
          </tr>";
}

echo "</tbody></table>";
