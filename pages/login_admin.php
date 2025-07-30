<?php
session_start();
require_once '../db/Conexion.php';

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (
        empty($_POST["name"]) ||
        empty($_POST["password"]) ||
        empty($_POST['csrf_token']) ||
        $_POST['csrf_token'] !== $_SESSION['csrf_token']
    ) {
        $error = "Por favor, completa todos los campos correctamente.";
    } else {
        $name = trim($_POST["name"]);
        $password = $_POST["password"];

        $stmt = $conexion->prepare("SELECT * FROM Administrador WHERE nombre = ? LIMIT 1");
        $stmt->bind_param("s", $name);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows === 1) {
            $usuario = $resultado->fetch_assoc();

            if (password_verify($password, $usuario['password'])) {
                $_SESSION['nombre'] = $usuario['nombre'];
                $_SESSION['ID'] = $usuario['id'];
                 $_SESSION['password'] = $usuario['password'];
            

                header("Location: Admin/admin.php");
                exit();
            } else {
                $error = "Contraseña incorrecta.";
            }
        } else {
            $error = "Administrador no registrado.";
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
        <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión De Administrador</h1>
        <form action="login_admin.php" method="post" class="space-y-4">
            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">

            <div>
                <label for="name" class="block text-gray-700 mb-2">Nombre de Usuario</label>
                <input
                    type="name"
                    id="name"
                    name="name"
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
            <div class="mt-6">
    <a href="index.php" 
       class="flex items-center justify-center w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-bold hover:bg-gray-300 transition">
        <i class="fas fa-arrow-left mr-2"></i>
        Volver al Inicio
    </a>
</div>
        </form>
        

        <?php if (!empty($error)): ?>
            <p class="mt-4 text-red-500 text-center"><?php echo htmlspecialchars($error); ?></p>
        <?php endif; ?>

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