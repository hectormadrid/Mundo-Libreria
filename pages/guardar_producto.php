<?php
session_start();
// Simulación de retardo para pruebas de UI (opcional)
// sleep(1);

// Incluir archivo de conexión
require_once '../db/Conexion.php';

header('Content-Type: application/json');

$response = array('success' => false, 'message' => 'Error desconocido.');

// Verificar que la solicitud sea POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Obtener y sanitizar los datos del formulario
    $nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
    $descripcion = isset($_POST['descripcion']) ? trim($_POST['descripcion']) : '';
    $precio = isset($_POST['precio']) ? filter_var($_POST['precio'], FILTER_VALIDATE_FLOAT) : null;
    $estado = isset($_POST['estado']) && in_array($_POST['estado'], ['activo', 'inactivo']) ? $_POST['estado'] : 'activo';

    // Validaciones básicas
    if (empty($nombre)) {
        $response['message'] = 'El nombre del producto es obligatorio.';
    } elseif ($precio === null || $precio === false || $precio < 0) {
        $response['message'] = 'El precio no es válido.';
    } else {
        try {
            $conexion = new Conexion();
            $db = $conexion->conectar();

            $sql = "INSERT INTO productos (nombre, descripcion, precio, estado) VALUES (:nombre, :descripcion, :precio, :estado)";
            $stmt = $db->prepare($sql);

            $stmt->bindParam(':nombre', $nombre, PDO::PARAM_STR);
            $stmt->bindParam(':descripcion', $descripcion, PDO::PARAM_STR);
            $stmt->bindParam(':precio', $precio, PDO::PARAM_STR); // PDO maneja decimales como strings
            $stmt->bindParam(':estado', $estado, PDO::PARAM_STR);

            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = 'Producto guardado exitosamente.';
                $response['id_producto'] = $db->lastInsertId(); // Devolver el ID del producto insertado
            } else {
                $response['message'] = 'Error al guardar el producto en la base de datos.';
                // $response['errorInfo'] = $stmt->errorInfo(); // Para depuración
            }
        } catch (PDOException $e) {
            $response['message'] = 'Error de conexión o consulta: ' . $e->getMessage();
        } catch (Exception $e) {
            $response['message'] = 'Error general: ' . $e->getMessage();
        } finally {
            if (isset($db)) {
                $db = null; // Cerrar la conexión
            }
        }
    }
} else {
    $response['message'] = 'Método de solicitud no permitido.';
}

echo json_encode($response);
?>
