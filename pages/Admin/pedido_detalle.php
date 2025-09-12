<?php
require_once __DIR__ . '/../../db/Conexion.php';

if (!isset($_GET['id'])) {
    echo "<p class='text-red-500 text-center'>ID de pedido no válido.</p>";
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
    echo "<p class='text-gray-500 text-center'>No hay productos en este pedido.</p>";
    exit;
}

$total = 0;
?>

<div class="overflow-x-auto">
    <table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
        <thead class="bg-gray-100 border-b">
            <tr>
                <th class="py-3 px-4 text-left text-gray-600 font-semibold">Producto</th>
                <th class="py-3 px-4 text-center text-gray-600 font-semibold">Cantidad</th>
                <th class="py-3 px-4 text-center text-gray-600 font-semibold">Precio</th>
            </tr>
        </thead>
        <tbody>
            <?php while ($row = $result->fetch_assoc()): 
                $subtotal = $row['cantidad'] * $row['precio'];
                $total += $subtotal;
            ?>
                <tr class="border-b hover:bg-gray-50 transition">
                    <td class="py-2 px-4"><?= htmlspecialchars($row['nombre']) ?></td>
                    <td class="py-2 px-4 text-center"><?= $row['cantidad'] ?></td>
                    <td class="py-2 px-4 text-center text-blue-600 font-medium">
                        $<?= number_format($row['precio'], 0) ?>
                    </td>
                </tr>
            <?php endwhile; ?>
        </tbody>
    </table>
</div>

<!-- Total -->
<div class="mt-4 text-right">
    <span class="text-gray-700 text-lg font-semibold">Total del Pedido:</span>
    <span class="text-2xl font-bold text-green-700 ml-2">
        $<?= number_format($total, 0) ?>
    </span>
</div>
