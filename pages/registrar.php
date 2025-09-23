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
        empty($_POST['telefono'])||
        empty($_POST['password']) ||
        empty($_POST['csrf_token']) ||
        $_POST['csrf_token'] !== $_SESSION['csrf_token']
    ) {
        $error = "Por favor, completa todos los campos correctamente.";
    } else {
        $nombre = trim($_POST['nombre']);
        $rut = trim($_POST['rut']);
        $correo = trim($_POST['correo']);
        $telefono = trim($_POST['telefono']);
        $password = $_POST['password'];

        $stmt = $conexion->prepare("SELECT id, rut FROM usuario WHERE correo = ? or rut = ?");
        $stmt->bind_param("ss", $correo,$rut);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $error = "El usuario ya está registrado.";
        } else {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $insert = $conexion->prepare("INSERT INTO usuario (rut,nombre, correo,telefono, password) VALUES (?,?, ?, ?,?)");
            $insert->bind_param("sssss",$rut, $nombre, $correo,$telefono, $hashed_password);
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="../style/registrar.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'lib-red': '#E53E3E',
                        'lib-yellow': '#F6E05E',
                        'lib-blue': '#3182CE'
                    }
                }
            }
        }
    </script>
</head>

<body class="geometric-bg min-h-screen flex items-center justify-center relative py-8">
    <!-- Formas flotantes de fondo -->
    <div class="floating-shapes">
        <div class="shape w-28 h-28 bg-lib-blue rounded-lg"></div>
        <div class="shape w-36 h-36 bg-lib-yellow rounded-full"></div>
        <div class="shape w-24 h-24 bg-lib-red rounded-full"></div>
        <div class="shape w-32 h-32 bg-lib-blue rounded-lg"></div>
    </div>

    <div class="slide-up w-full max-w-2xl px-6">
        <!-- Tarjeta principal -->
        <div class="bg-white/95 backdrop-blur-xl rounded-3xl card-glow overflow-hidden">
            <!-- Header con gradiente -->
            <div class="bg-gradient-to-r from-lib-red via-lib-yellow to-lib-blue p-8 text-center relative">
                <div class="absolute inset-0 bg-black/10"></div>
                <div class="relative z-10">
                    <div class="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4 pulse-neon icon-rotate">
                        <i class="fas fa-user-plus text-3xl text-white"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-white mb-2">
                        ¡Únete a nosotros!
                    </h1>
                    <p class="text-white/90 font-medium">
                        Crea tu cuenta
                    </p>
                </div>
            </div>

            <!-- Formulario -->
            <div class="p-8">
                <form action="registrar.php" method="post" class="space-y-6">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">

                    <!-- Grid de campos -->
                    <div class="grid md:grid-cols-2 gap-6">
                        <!-- Campo de nombre -->
                        <div class="input-container space-y-3">
                            <label for="nombre" class="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <i class="fas fa-user text-lib-blue mr-2"></i>
                                Nombre Completo
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                required
                                placeholder="Tu nombre completo"
                                class="input-glow w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-lib-yellow focus:bg-white outline-none text-gray-800 placeholder-gray-500 font-medium transition-all duration-300">
                        </div>

                        <!-- Campo de RUT -->
                        <div class="input-container space-y-3">
                            <label for="rut" class="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <i class="fas fa-id-card text-lib-red mr-2"></i>
                                RUT
                            </label>
                            <input
                                type="text"
                                id="rut"
                                name="rut"
                                required
                                placeholder="12.345.678-9"
                                maxlength="12"
                                class="input-glow w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-lib-yellow focus:bg-white outline-none text-gray-800 placeholder-gray-500 font-medium transition-all duration-300">
                        </div>
                         <div class="input-container space-y-3">
                            <label for="telefono" class="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <i class="fas fa-id-card text-lib-red mr-2"></i>
                                RUT
                            </label>
                            <input
                                type="text"
                                id="telefono"
                                name="telefono"
                                required
                                placeholder="+569 1234 5678"
                                maxlength="12"
                                class="input-glow w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-lib-yellow focus:bg-white outline-none text-gray-800 placeholder-gray-500 font-medium transition-all duration-300">
                        </div>
                        <div class="input-container space-y-3">

                        <label for="correo" class="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                            <i class="fas fa-envelope text-lib-blue mr-2"></i>
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="correo"
                            name="correo"
                            required
                            placeholder="tu@email.com"
                            class="input-glow w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-lib-yellow focus:bg-white outline-none text-gray-800 placeholder-gray-500 font-medium transition-all duration-300">
                            
                    </div>
                    </div>
                    

                    <!-- Campo de email -->
                    

                    <!-- Campo de contraseña -->
                    <div class="input-container space-y-3">
                        <label for="password" class="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                            <i class="fas fa-shield-alt text-lib-red mr-2"></i>
                            Contraseña
                        </label>
                        <div class="relative">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                placeholder="Crea una contraseña segura"
                                minlength="6"
                                class="input-glow w-full px-6 py-4 pr-14 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-lib-yellow focus:bg-white outline-none text-gray-800 placeholder-gray-500 font-medium transition-all duration-300">
                            <button 
                                type="button" 
                                onclick="togglePassword()" 
                                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-lib-blue transition-colors duration-200">
                                <i id="eye-icon" class="fas fa-eye text-lg"></i>
                            </button>
                        </div>
                        <!-- Indicador de fortaleza de contraseña -->
                        <div class="flex space-x-2 mt-2">
                            <div id="strength-1" class="h-2 flex-1 bg-gray-200 rounded-full transition-colors duration-300"></div>
                            <div id="strength-2" class="h-2 flex-1 bg-gray-200 rounded-full transition-colors duration-300"></div>
                            <div id="strength-3" class="h-2 flex-1 bg-gray-200 rounded-full transition-colors duration-300"></div>
                            <div id="strength-4" class="h-2 flex-1 bg-gray-200 rounded-full transition-colors duration-300"></div>
                        </div>
                        <p id="strength-text" class="text-xs text-gray-500 mt-1">Ingresa una contraseña</p>
                        <p class="text-xs text-gray-500 mt-1"> Por Favor Asegurece de que su contraseña contenga una letra en mayuscula, un numero y un caracter especial </p>
                    </div>


                

                    <!-- Botón de envío -->
                    <button
                        type="submit"
                        class="w-full btn-gradient text-white py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 focus:ring-4 focus:ring-lib-yellow/50 focus:outline-none transition-all duration-300 uppercase tracking-wider">
                        
                        Crear Mi Cuenta
                    </button>
                </form>
                     <?php if (!empty($error)): ?>
            <p class="mt-4 text-red-500 text-center"><?php echo htmlspecialchars($error); ?></p>
        <?php elseif (!empty($success)): ?>
            <p class="mt-4 text-green-500 text-center"><?php echo htmlspecialchars($success); ?></p>
        <?php endif; ?>

                <!-- Mensajes de estado -->
                <div id="success-message" class="hidden mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg success-animation">
                    <div class="flex items-center">
                        <i class="fas fa-check-circle text-green-500 mr-3 text-lg"></i>
                        <p class="text-green-800 font-medium">¡Registro exitoso! Redirigiendo al login...</p>
                    </div>
                </div>

                <div id="error-message" class="hidden mt-6 p-4 bg-red-50 border-l-4 border-lib-red rounded-lg error-shake">
                    <div class="flex items-center">
                        <i class="fas fa-exclamation-triangle text-lib-red mr-3 text-lg"></i>
                        <p class="text-red-800 font-medium">Por favor, completa todos los campos correctamente.</p>
                    </div>
                </div>

                <!-- Divisor -->
                <div class="flex items-center my-8">
                    <div class="flex-1 h-px bg-gradient-to-r from-lib-red to-lib-blue opacity-30"></div>
                    <span class="px-4 text-gray-500 font-medium">Ya tienes cuenta?</span>
                    <div class="flex-1 h-px bg-gradient-to-l from-lib-red to-lib-blue opacity-30"></div>
                </div>

                <!-- Login -->
                <div class="text-center">
                    <a href="login.php" class="inline-flex items-center justify-center w-full py-3 px-6 neon-border rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all duration-300">
                        <i class="fas fa-sign-in-alt mr-2 text-lib-red"></i>
                        Iniciar Sesión
                    </a>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-8 text-white/80 text-sm">
            <p class="font-medium">&copy; 2025 Mundo Librería</p>
           
        </div>
    </div>
<script src="../js/registrar.js"></script>

</body>

</html>