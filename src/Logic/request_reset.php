<?php
require_once __DIR__ . '/../../db/SessionHelper.php';
SessionHelper::start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../db/Conexion.php';
require_once __DIR__ . '/../../db/EmailHelper.php';

// 1. Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido.']);
    exit;
}

// 2. Verificar CSRF con depuración interna
$token_recibido = $_POST['csrf_token'] ?? '';
$token_sesion = $_SESSION['csrf_token'] ?? '';

if (empty($token_recibido) || $token_recibido !== $token_sesion) {
    http_response_code(403);
    // Mensaje detallado para desarrollo, luego lo cambiaremos a uno genérico
    echo json_encode([
        'success' => false, 
        'error' => 'Error de validación de seguridad (CSRF).',
        'debug_info' => 'Sesión activa: ' . (isset($_SESSION['csrf_token']) ? 'SI' : 'NO')
    ]);
    exit;
}

try {
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);

    if (!$email) {
        throw new Exception('Por favor, ingresa una dirección de correo electrónico válida.');
    }

    // Buscar usuario
    $stmt = $conexion->prepare("SELECT id, nombre FROM usuario WHERE correo = ? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    $msg_exito = 'Si tu correo está en nuestra base de datos, recibirás un enlace de recuperación en unos minutos.';

    if ($result->num_rows === 0) {
        echo json_encode(['success' => true, 'message' => $msg_exito]);
        exit;
    }
    
    $user = $result->fetch_assoc();
    $user_id = $user['id'];
    $nombre = $user['nombre'];

    $token = bin2hex(random_bytes(32)); 
    $token_hash = hash('sha256', $token); 
    $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    $update_stmt = $conexion->prepare("UPDATE usuario SET reset_token_hash = ?, reset_token_expires_at = ? WHERE id = ?");
    $update_stmt->bind_param("ssi", $token_hash, $expires_at, $user_id);
    $update_stmt->execute();
    
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $path = rtrim(dirname(dirname($_SERVER['PHP_SELF'])), '/\\'); 
    $reset_link = "{$protocol}://{$host}{$path}/reset_password.php?token={$token}";

    $asunto = "Recuperación de Contraseña - Mundo Librería";
    $cuerpo = EmailHelper::getPasswordResetTemplate($reset_link);
    
    if (EmailHelper::send($email, $asunto, $cuerpo)) {
        echo json_encode(['success' => true, 'message' => $msg_exito]);
    } else {
        throw new Exception('Error al enviar el correo.');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
