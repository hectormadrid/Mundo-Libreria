<?php
session_start();
require_once '../db/Conexion.php';

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$error = "";
$success = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (
        empty($_POST['nombre']) ||
        empty($_POST['rut']) ||
        empty($_POST['correo']) ||
        empty($_POST['password']) ||
        empty($_POST['csrf_token']) ||
        $_POST['csrf_token'] !== $_SESSION['csrf_token']
    ) {
        $error = "Por favor, completa todos los campos correctamente.";
    } else {
        $nombre = trim($_POST['nombre']);
        $rut = trim($_POST['rut']);
        $correo = trim($_POST['correo']);
        $password = $_POST['password'];

        $stmt = $conexion->prepare("SELECT id, rut FROM usuario WHERE correo = ? or rut = ?");
        $stmt->bind_param("ss", $correo,$rut);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $error = "El usuario ya está registrado.";
        } else {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $insert = $conexion->prepare("INSERT INTO usuario (rut,nombre, correo, password) VALUES (?,?, ?, ?)");
            $insert->bind_param("ssss",$rut, $nombre, $correo, $hashed_password);
            if ($insert->execute()) {
                $success = "Registro exitoso. Puedes iniciar sesión.";
                header("Refresh: 2; URL=login.php");
            } else {
                $error = "Error al registrar usuario.";
            }
            $insert->close();
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
    <title>Registrarse - Mundo Librería</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Crear cuenta</h1>
        <form action="registrar.php" method="post" class="space-y-4">
            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">

            <div>
                <label for="nombre" class="block text-gray-700 mb-2">Nombre Completo</label>
                <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none">
            </div>

            <div>
                <label for="rut" class="block text-gray-700 mb-2">Rut</label>
                <input
                    type="text"
                    id="rut"
                    name="rut"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none">
            </div>
            <div>
                <label for="correo" class="block text-gray-700 mb-2">Correo electrónico</label>
                <input
                    type="email"
                    id="correo"
                    name="correo"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none">
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
                Registrarse
            </button>
        </form>

        <?php if (!empty($error)): ?>
            <p class="mt-4 text-red-500 text-center"><?php echo htmlspecialchars($error); ?></p>
        <?php elseif (!empty($success)): ?>
            <p class="mt-4 text-green-500 text-center"><?php echo htmlspecialchars($success); ?></p>
        <?php endif; ?>

        <p class="mt-4 text-center text-gray-600">
            ¿Ya tienes cuenta?
            <a href="login.php" class="text-blue-400 hover:underline">Inicia sesión aquí</a>
        </p>
    </div>
</body>

</html>