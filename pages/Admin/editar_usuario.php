<?php
header('Content-Type: application/json');
session_start();

// 1. Verificación de seguridad: solo administradores y método POST
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso no autorizado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido.']);
    exit;
}

require_once __DIR__ . '/../../db/Conexion.php';

// 2. Obtener y validar los datos del formulario
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id']) || !filter_var($data['id'], FILTER_VALIDATE_INT)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos inválidos o ID de usuario faltante.']);
    exit;
}

$id = (int)$data['id'];
$rut = trim($data['rut'] ?? '');
$nombre = trim($data['nombre'] ?? '');
$correo = trim($data['correo'] ?? '');
$telefono = trim($data['telefono'] ?? '');
$direccion = trim($data['direccion'] ?? '');

// Validación básica
if (empty($nombre) || empty($correo) || empty($rut)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'RUT, Nombre y Correo son campos obligatorios.']);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'El formato del correo electrónico no es válido.']);
    exit;
}

$response = ['success' => false];

try {
    // 3. Sentencia preparada para actualizar
    $query = "UPDATE usuario SET rut = ?, nombre = ?, correo = ?, telefono = ?, direccion = ? WHERE id = ?";
    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta: ' . $conexion->error);
    }
    
    $stmt->bind_param("sssssi", $rut, $nombre, $correo, $telefono, $direccion, $id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            $response['success'] = true;
            $response['message'] = 'Usuario actualizado correctamente.';
        } else {
            $response['success'] = true; // Se considera éxito aunque no haya cambios
            $response['message'] = 'No se realizaron cambios en los datos del usuario.';
        }
    } else {
        throw new Exception('Error al ejecutar la actualización: ' . $stmt->error);
    }

    $stmt->close();
    $conexion->close();

} catch (Exception $e) {
    http_response_code(500);
    $response['error'] = 'Error del servidor: ' . $e->getMessage();
}

echo json_encode($response);
?>
