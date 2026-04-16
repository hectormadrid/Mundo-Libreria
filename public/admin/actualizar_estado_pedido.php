<?php
require_once __DIR__ . '/../../vendor/autoload.php';
use App\Helpers\SessionHelper;
use App\Database\Conexion;

SessionHelper::start();
header('Content-Type: application/json');
$conexion = Conexion::getConnection();

// Verificar que sea administrador
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso no autorizado.']);
    exit;
}

// Obtener datos de la petición (JSON)
$data = json_decode(file_get_contents('php://input'), true);

$id_pedido = $data['id'] ?? null;
$nuevo_estado = $data['estado'] ?? null;
$csrf_token = $data['csrf_token'] ?? null;

// Verificar CSRF
if (!$csrf_token || $csrf_token !== $_SESSION['csrf_token']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Error de seguridad (CSRF).']);
    exit;
}

if (!$id_pedido || !$nuevo_estado) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos incompletos.']);
    exit;
}

// Estados permitidos
$estados_permitidos = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];
if (!in_array($nuevo_estado, $estados_permitidos)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Estado no válido.']);
    exit;
}

try {
    $stmt = $conexion->prepare("UPDATE pedido SET estado = ? WHERE id = ?");
    $stmt->bind_param("si", $nuevo_estado, $id_pedido);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Estado actualizado correctamente.']);
    } else {
        throw new Exception("Error al actualizar la base de datos.");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conexion)) $conexion->close();
}
