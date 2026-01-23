<?php
header('Content-Type: application/json');
session_start();

// 1. Verificación de seguridad: solo administradores
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    http_response_code(403); // Forbidden
    echo json_encode(['success' => false, 'error' => 'Acceso no autorizado.']);
    exit;
}

// 2. Validar que se recibió un ID de usuario
if (!isset($_GET['id']) || !filter_var($_GET['id'], FILTER_VALIDATE_INT)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'error' => 'ID de usuario no válido.']);
    exit;
}

require_once __DIR__ . '/../../db/Conexion.php';

$usuario_id = (int)$_GET['id'];
$response = ['success' => false];

try {
    // 3. Usar sentencias preparadas para obtener los datos
    $stmt = $conexion->prepare("SELECT id, rut, nombre, correo, telefono, direccion FROM usuario WHERE id = ?");
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta: ' . $conexion->error);
    }
    
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $usuario = $result->fetch_assoc();
        $response['success'] = true;
        $response['data'] = $usuario;
    } else {
        http_response_code(404); // Not Found
        $response['error'] = 'Usuario no encontrado.';
    }

    $stmt->close();
    $conexion->close();

} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    $response['error'] = 'Error del servidor: ' . $e->getMessage();
}

echo json_encode($response);
?>
