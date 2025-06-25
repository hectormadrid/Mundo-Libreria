<?php
session_start();
if (isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registrar - Mundo Librería</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Registrarse</h1>
        
        <?php if (isset($_GET['error'])): ?>
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                El correo ya está registrado.
            </div>
        <?php endif; ?>

        <form action="processes/register_process.php" method="POST" class="space-y-4">
            <div>
                <label for="name" class="block text-gray-700 mb-2">Nombre completo</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                >
            </div>
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
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                >
            </div>
            <button
                type="submit"
                class="w-full bg-yellow-400 text-gray-800 py-2 rounded-lg font-bold hover:bg-yellow-500 transition"
            >
                Crear cuenta
            </button>
        </form>
        <p class="mt-4 text-center text-gray-600">
            ¿Ya tienes cuenta? 
            <a href="login.php" class="text-yellow-600 hover:underline">Inicia sesión aquí</a>
        </p>
    </div>
</body>
</html>