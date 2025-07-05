<?php
require_once '../db/Conexion.php';
header('Content-Type: application/json');

$response = array('data' => []); // DataTables espera un objeto con una propiedad 'data' que sea un array

try {
    $conexion = new Conexion();
    $db = $conexion->conectar();

    $sql = "SELECT id, nombre, precio, descripcion, estado, fecha_creacion FROM productos ORDER BY id DESC";
    $stmt = $db->prepare($sql);
    $stmt->execute();

    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($productos) {
        foreach ($productos as $producto) {
            // Asegurarse de que el precio tenga el formato adecuado si es necesario, aunque DataTables puede manejarlo.
            // Formatear la fecha si es necesario, ej: date("d-m-Y H:i:s", strtotime($producto['fecha_creacion']))
            // Crear un array para cada fila en el orden que espera DataTables
            $response['data'][] = [
                $producto['id'],
                htmlspecialchars($producto['nombre']), // Sanitizar para evitar XSS
                '$' . number_format($producto['precio'], 0, ',', '.'), // Formato de moneda
                htmlspecialchars($producto['descripcion']),
                ucfirst($producto['estado']), // Primera letra en mayúscula
                date("Y-m-d", strtotime($producto['fecha_creacion'])) // Formato de fecha
            ];
        }
    }

} catch (PDOException $e) {
    // En un entorno de producción, registrar el error en lugar de mostrarlo directamente
    // Para DataTables, en caso de error, es mejor devolver un array 'data' vacío
    // o una estructura de error que DataTables pueda entender, si se configura.
    // $response['error'] = 'Error de base de datos: ' . $e->getMessage();
} catch (Exception $e) {
    // $response['error'] = 'Error general: ' . $e->getMessage();
} finally {
    if (isset($db)) {
        $db = null; // Cerrar la conexión
    }
}

echo json_encode($response);
?>
