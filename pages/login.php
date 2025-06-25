<?php
require_once'../db/Conexcion.php';

session_start();
$errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 1) Recoger y sanitizar inputs
    $email    = filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';

    // 2) Validaciones básicas
    if (!$email) {
        $errors[] = "El correo no tiene un formato válido.";
    }
    if (strlen($password) < 6) {
        $errors[] = "La contraseña debe tener al menos 6 caracteres.";
    }

    // 3) Si no hay errores, consultamos al usuario
    if (empty($errors)) {
        $stmt = $pdo->prepare("SELECT id, nombre, password FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Login OK: creamos sesión y redirigimos
            $_SESSION['user_id']   = $user['id'];
            $_SESSION['user_name'] = $user['nombre'];
            header('Location: dashboard.php');
            exit;
        } else {
            $errors[] = "Credenciales inválidas.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Mundo Librería</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h1>
        <form action="../processes/login_process.php" method="POST" class="space-y-4">
            <div>
                <label for="email" class="block text-gray-700 mb-2">Correo electrónico</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                >
            </div>
            <div>
                <label for="password" class="block text-gray-700 mb-2">Contraseña</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none">
            </div>
            <button
                type="submit"
                class="w-full bg-yellow-400 text-gray-800 py-2 rounded-lg font-bold hover:bg-yellow-500 transition">
                Ingresar
            </button>
        </form>
         <?php if (isset($error)) { ?>
                <p class="text-red-500 text-center"><?php echo $error; ?></p>
            <?php } ?>
        <p class="mt-4 text-center text-gray-600">
            ¿No tienes cuenta? 
            <a href="registrar.php" class="text-blue-400 hover:underline">Regístrate aquí</a>
        </p>
    </div>
</body>
</html>