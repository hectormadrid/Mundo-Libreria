<?php
session_start();
require_once '../db/Conexion.php';

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (
        empty($_POST["email"]) ||
        empty($_POST["password"]) ||
        empty($_POST['csrf_token']) ||
        $_POST['csrf_token'] !== $_SESSION['csrf_token']
    ) {
        $error = "Por favor, completa todos los campos correctamente.";
    } else {
        $email = trim($_POST["email"]);
        $password = $_POST["password"];

        $stmt = $conexion->prepare("SELECT * FROM usuario WHERE correo = ? LIMIT 1");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows === 1) {
            $usuario = $resultado->fetch_assoc();

            if (password_verify($password, $usuario['password'])) {
                $_SESSION['nombre'] = $usuario['nombre'];
                $_SESSION['ID'] = $usuario['id'];
                $_SESSION['correo'] = $usuario['correo'];

                header("Location: index.php");
                exit();
            } else {
                $error = "Contraseña incorrecta.";
            }
        } else {
            $error = "Correo no registrado.";
        }

        $stmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>

<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h1>
        <form action="login.php" method="post" class="space-y-4">
            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">

            <div>
                <label for="email" class="block text-gray-700 mb-2">Correo electrónico</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none">
            </div>

            <div>
                <label for="password" class="block text-gray-700 mb-2">Contraseña</label>
                <div class="relative">
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none">
                    <button type="button" onclick="togglePassword()" class="absolute right-3 top-3 text-gray-500">
                        <i id="eye-icon" class="fas fa-eye"></i>
                    </button>
                </div>
            </div>

            <button
                type="submit"
                class="w-full bg-yellow-400 text-gray-800 py-2 rounded-lg font-bold hover:bg-yellow-500 transition">
                Ingresar
            </button>
        </form>

        <?php if (!empty($error)): ?>
            <p class="mt-4 text-red-500 text-center"><?php echo htmlspecialchars($error); ?></p>
        <?php endif; ?>

        <p class="mt-4 text-center text-gray-600">
            ¿No tienes cuenta?
            <a href="registrar.php" class="text-blue-400 hover:underline">Regístrate aquí</a>
        </p>
    </div>

    <script>
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const eyeIcon = document.getElementById('eye-icon');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        }
    </script>
</body>

</html>