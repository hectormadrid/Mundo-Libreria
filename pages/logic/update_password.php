<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../db/Conexion.php';

// 1. Verificar CSRF y método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Solicitud no válida.']);
    exit;
}

try {
    $token = $_POST['token'] ?? '';
    $password = $_POST['password'] ?? '';
    $password_confirm = $_POST['password_confirm'] ?? '';

    // 2. Validar entradas
    if (empty($token) || empty($password) || empty($password_confirm)) {
        throw new Exception('Todos los campos son obligatorios.');
    }
    if ($password !== $password_confirm) {
        throw new Exception('Las contraseñas no coinciden.');
    }
    if (strlen($password) < 4) { // Misma regla que en el registro
        throw new Exception('La contraseña debe tener al menos 4 caracteres.');
    }

    // 3. Buscar usuario por hash del token
    $token_hash = hash('sha256', $token);
    $stmt = $conexion->prepare("SELECT id, reset_token_expires_at FROM usuario WHERE reset_token_hash = ? LIMIT 1");
    $stmt->bind_param("s", $token_hash);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Token no válido o ya utilizado.');
    }

    $user = $result->fetch_assoc();
    
    // 4. Verificar expiración del token
    $expires_at = new DateTime($user['reset_token_expires_at']);
    $now = new DateTime();
    if ($now > $expires_at) {
        throw new Exception('El token de recuperación ha expirado. Por favor, solicita uno nuevo.');
    }
    
    // 5. Hashear la nueva contraseña y actualizar la BD
    $new_password_hash = password_hash($password, PASSWORD_BCRYPT);
    
    $update_stmt = $conexion->prepare(
        "UPDATE usuario SET password = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?"
    );
    $update_stmt->bind_param("si", $new_password_hash, $user['id']);
    
    if ($update_stmt->execute()) {
        echo json_encode(['success' => true, 'message' => '¡Tu contraseña ha sido actualizada con éxito!']);
    } else {
        throw new Exception('Ocurrió un error al actualizar tu contraseña. Por favor, inténtalo de nuevo.');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($update_stmt)) $update_stmt->close();
    if (isset($conexion)) $conexion->close();
}
?>
