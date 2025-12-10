<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../db/Conexion.php';

// 1. Verificar CSRF token y método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Solicitud no válida.']);
    exit;
}

try {
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);

    if (!$email) {
        throw new Exception('Por favor, ingresa una dirección de correo electrónico válida.');
    }

    // 2. Buscar usuario por correo electrónico
    $stmt = $conexion->prepare("SELECT id FROM usuario WHERE correo = ? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        // No revelamos si el correo existe o no por seguridad, pero damos un mensaje amigable.
        throw new Exception('Si tu correo está en nuestra base de datos, recibirás un enlace de recuperación.');
    }
    
    $user = $result->fetch_assoc();
    $user_id = $user['id'];

    // 3. Generar token seguro
    $token = bin2hex(random_bytes(32)); // Token que se enviará al usuario
    $token_hash = hash('sha256', $token); // Hash que se guardará en la BD

    // 4. Establecer fecha de expiración (e.g., 1 hora desde ahora)
    $expires_at = new DateTime();
    $expires_at->add(new DateInterval('PT1H'));
    $expires_at_string = $expires_at->format('Y-m-d H:i:s');
    
    // 5. Guardar el token hasheado y la expiración en la base de datos
    $update_stmt = $conexion->prepare(
        "UPDATE usuario SET reset_token_hash = ?, reset_token_expires_at = ? WHERE id = ?"
    );
    $update_stmt->bind_param("ssi", $token_hash, $expires_at_string, $user_id);
    $update_stmt->execute();
    
    if ($update_stmt->affected_rows === 0) {
        throw new Exception('Hubo un error al generar el enlace. Inténtalo de nuevo.');
    }

    // 6. Construir el enlace de reseteo (Simulación de envío de correo)
    // En una aplicación real, aquí iría el código para enviar un correo electrónico.
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $path = rtrim(dirname(dirname($_SERVER['PHP_SELF'])), '/\\'); // Sube un nivel desde /logic
    $reset_link = "{$protocol}://{$host}{$path}/reset_password.php?token={$token}";

    // 7. Devolver respuesta exitosa con el enlace (para desarrollo)
    echo json_encode([
        'success' => true,
        'message' => 'Enlace de recuperación generado con éxito.',
        'reset_link' => $reset_link
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($update_stmt)) $update_stmt->close();
    if (isset($conexion)) $conexion->close();
}
?>
