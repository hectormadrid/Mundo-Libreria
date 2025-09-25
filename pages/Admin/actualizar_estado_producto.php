<?php
header('Content-Type: application/json');

try {
    // Incluir la conexión a la base de datos
    require_once __DIR__ . '/../../db/Conexion.php';
    
    // Verificar que sea una petición POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }
    
    // Obtener los datos del cuerpo de la petición
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validar que los datos necesarios estén presentes
    if (!isset($input['id']) || !isset($input['estado'])) {
        throw new Exception('Datos incompletos: id y estado son requeridos');
    }
    
    $id = intval($input['id']);
    $estado = $input['estado'];
    
    // Validar que el estado sea válido
    if (!in_array($estado, ['activo', 'inactivo'])) {
        throw new Exception('Estado no válido. Debe ser "activo" o "inactivo"');
    }
    
    // Preparar y ejecutar la consulta de actualización
    $query = "UPDATE productos SET estado = ? WHERE id = ?";
    $stmt = $conexion->prepare($query);
    
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta: ' . $conexion->error);
    }
    
    $stmt->bind_param("si", $estado, $id);
    $success = $stmt->execute();
    
    if (!$success) {
        throw new Exception('Error al ejecutar la consulta: ' . $stmt->error);
    }
    
    // Verificar si se actualizó alguna fila
    if ($stmt->affected_rows === 0) {
        throw new Exception('No se encontró el producto con ID: ' . $id);
    }
    
    // Éxito
    echo json_encode([
        "success" => true,
        "message" => "Estado actualizado correctamente",
        "debug" => [
            "id" => $id,
            "nuevo_estado" => $estado,
            "affected_rows" => $stmt->affected_rows
        ]
    ]);
    
    $stmt->close();
    $conexion->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage(),
        "debug" => [
            "request_method" => $_SERVER['REQUEST_METHOD'],
            "request_data" => file_get_contents('php://input')
        ]
    ]);
}
?>