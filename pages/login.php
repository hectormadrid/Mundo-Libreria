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

                header("Location: /");
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
    <title>Mundo Libreria</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="/style/login.css">
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

<body class="geometric-bg min-h-screen flex items-center justify-center relative">
    <!-- Formas flotantes de fondo -->
    <div class="floating-shapes">
        <div class="shape w-32 h-32 bg-lib-yellow rounded-full"></div>
        <div class="shape w-24 h-24 bg-lib-red rounded-lg"></div>
        <div class="shape w-40 h-40 bg-lib-blue rounded-full"></div>
    </div>

    <div class="slide-up w-full max-w-lg px-6">
        <!-- Tarjeta principal -->
        <div class="bg-white/95 backdrop-blur-xl rounded-3xl card-glow overflow-hidden">
            <!-- Header con gradiente -->
            <div class="bg-gradient-to-r from-lib-blue via-lib-yellow to-lib-red p-8 text-center relative">
                <div class="absolute inset-0 bg-black/10"></div>
                <div class="relative z-10">
                   
                    <h1 class="text-3xl font-bold text-white mb-2">
                        ¡Hola de nuevo!
                    </h1>
                    <p class="text-white/90 font-medium">
                        Accede a tu Cuenta de Usuario
                    </p>
                </div>
            </div>

            <!-- Formulario -->
            <div class="p-8">
                <form action="/pages/login.php" method="post" class="space-y-6">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">

                    <!-- Campo de email -->
                    <div class="space-y-3">
                        <label for="email" class="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                            <i class="fas fa-envelope text-lib-blue mr-2"></i>
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="usuario@ejemplo.com"
                            class="input-glow w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-lib-yellow focus:bg-white outline-none text-gray-800 placeholder-gray-500 font-medium transition-all duration-300">
                    </div>

                    <!-- Campo de contraseña -->
                    <div class="space-y-3">
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
                                placeholder="••••••••"
                                class="input-glow w-full px-6 py-4 pr-14 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-lib-yellow focus:bg-white outline-none text-gray-800 placeholder-gray-500 font-medium transition-all duration-300">
                            <button 
                                type="button" 
                                onclick="togglePassword()" 
                                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-lib-blue transition-colors duration-200">
                                <i id="eye-icon" class="fas fa-eye text-lg"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Opciones adicionales -->
                    <div class="flex items-center justify-between text-sm">
                        <a href="/pages/forgot_password.php" class="text-lib-red hover:text-red-700 font-semibold transition-colors">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                    <!-- Botón de envío -->
                    <button
                        type="submit" class="w-full btn-gradient text-white py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 focus:ring-4 focus:ring-lib-yellow/50 focus:outline-none transition-all duration-300 uppercase tracking-wider">
                        Iniciar Sesión
                    </button>
                </form>
                <div class="space-y-4 p-6">
                    <a href="/" class="admin-hover flex items-center justify-center w-full py-3 px-6 bg-gray-100 border-2 border-gray-300 rounded-2xl font-bold text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-all duration-300">
                        <i class="fas fa-arrow-left mr-3 text-lib-blue"></i>
                        Volver al Sitio Principal
                    </a>
                </div>
       

                <!-- Divisor -->
                <div class="flex items-center my-8">
                    <div class="flex-1 h-px bg-gradient-to-r from-lib-blue to-lib-red opacity-30"></div>
                    <span class="px-4 text-gray-500 font-medium">O</span>
                    <div class="flex-1 h-px bg-gradient-to-l from-lib-blue to-lib-red opacity-30"></div>
                </div>

                <!-- Registro -->
                <div class="text-center space-y-4">
                    <p class="text-gray-600 font-medium">
                        ¿Primera vez aquí?
                    </p>
                    <a href="/pages/registrar.php" class="inline-flex items-center justify-center w-full py-3 px-6 neon-border rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all duration-300">
                        <i class="fas fa-user-plus mr-2 text-lib-blue"></i>
                        Crear cuenta nueva
                    </a>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-8 text-white/80 text-sm">
            <p class="font-medium">&copy; 2025 Mundo Libreria</p>
            
        </div>
    </div>

   <script src="/js/login.js"></script>
   <?php if (!empty($error)): ?>
    <script>
        Swal.fire({
            title: 'Atención',
            text: '<?php echo $error; ?>',
            confirmButtonColor: '#3182CE'
        })
    </script>
    <?php endif; ?>
</body>

</html>