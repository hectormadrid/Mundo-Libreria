<?php
session_start();
require_once __DIR__ . '/../db/Conexion.php';

// Generar un token CSRF si no existe
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$token_is_valid = false;
$error_message = '';
$token_from_url = $_GET['token'] ?? '';

if (!empty($token_from_url)) {
    $token_hash = hash('sha256', $token_from_url);

    // Buscar el hash del token en la base de datos
    $stmt = $conexion->prepare("SELECT id, reset_token_expires_at FROM usuario WHERE reset_token_hash = ? LIMIT 1");
    $stmt->bind_param("s", $token_hash);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        $expires_at = new DateTime($user['reset_token_expires_at']);
        $now = new DateTime();

        if ($now < $expires_at) {
            // El token es válido y no ha expirado
            $token_is_valid = true;
        } else {
            $error_message = 'El enlace de recuperación ha expirado. Por favor, solicita uno nuevo.';
        }
    } else {
        $error_message = 'El enlace de recuperación no es válido o ya ha sido utilizado.';
    }
    $stmt->close();
} else {
    $error_message = 'No se proporcionó un token de recuperación.';
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer Contraseña - Mundo Librería</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="../style/login.css">
</head>

<body class="bg-gray-100 flex items-center justify-center min-h-screen">

    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        
        <?php if ($token_is_valid): ?>
            <!-- Formulario para restablecer contraseña -->
            <div class="text-center">
                <h1 class="text-3xl font-bold text-gray-800">Crea tu Nueva Contraseña</h1>
                <p class="mt-2 text-gray-600">Por favor, introduce tu nueva contraseña a continuación.</p>
            </div>

            <div id="message-container-reset" class="p-4 text-center rounded-lg hidden"></div>

            <form id="reset-password-form" method="post">
                <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token']); ?>">
                <input type="hidden" name="token" value="<?php echo htmlspecialchars($token_from_url); ?>">
                
                <div class="space-y-4">
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                        <input id="password" name="password" type="password" required class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm">
                    </div>
                    <div>
                        <label for="password_confirm" class="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                        <input id="password_confirm" name="password_confirm" type="password" required class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm">
                    </div>
                    <div>
                        <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                            Guardar Nueva Contraseña
                        </button>
                    </div>
                </div>
            </form>

        <?php else: ?>
            <!-- Mensaje de error -->
            <div class="text-center">
                <i class="fas fa-exclamation-triangle text-5xl text-red-500"></i>
                <h1 class="mt-4 text-2xl font-bold text-gray-800">Enlace no Válido</h1>
                <p class="mt-2 text-gray-600"><?php echo htmlspecialchars($error_message); ?></p>
                <div class="mt-6">
                    <a href="forgot_password.php" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        <i class="fas fa-arrow-left mr-1"></i>
                        Volver a solicitar
                    </a>
                </div>
            </div>
        <?php endif; ?>

    </div>
    
    <?php if ($token_is_valid): ?>
        <script src="../js/User/reset_password.js"></script>
    <?php endif; ?>

</body>
</html>


