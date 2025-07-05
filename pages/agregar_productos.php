<?php
header('Content-Type: application/json'); // Esta línea es CRUCIAL

try {
    include("../db/Conexion.php");
    
    // Validar datos recibidos
    if (!isset($_POST['nombre'], $_POST['precio'], $_POST['descripcion'], $_POST['estado'])) {
        throw new Exception('Faltan campos obligatorios');
    }

    $nombre = $_POST['nombre'];
    $precio = $_POST['precio'];
    $descripcion = $_POST['descripcion'];
    $estado = $_POST['estado'];

    // Validar estado
    if (!in_array($estado, ['Activo', 'Inactivo'])) {
        throw new Exception('Estado no válido');
    }

    $query = "INSERT INTO productos (nombre, precio, descripcion, estado) VALUES (?, ?, ?, ?)";
    $stmt = $conexion->prepare($query);
    
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta: ' . $conexion->error);
    }

    $stmt->bind_param("sdss", $nombre, $precio, $descripcion, $estado);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Producto agregado correctamente'
        ]);
    } else {
        throw new Exception('Error al ejecutar: ' . $stmt->error);
    }
} catch (Exception $e) {
    http_response_code(400); // Bad Request
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conexion)) $conexion->close();
}
?>