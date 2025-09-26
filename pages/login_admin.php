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
                 $_SESSION['tipo'] = 'administrador'; 
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
    <title>Panel de Administración - Mundo Librería</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
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
<link rel="stylesheet" href="../style/login_admin.css">
</head>

<body class="admin-bg min-h-screen flex items-center justify-center relative">
    <!-- Partículas flotantes -->
    <div class="particles">
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
    </div>

    <div class="slide-down w-full max-w-lg px-6">
        <!-- Badge de seguridad -->
        <div class="text-center mb-6">
            <div class="inline-flex items-center px-4 py-2 security-badge rounded-full text-white text-sm font-semibold">
                <i class="fas fa-shield-check mr-2"></i>
                Acceso Seguro - Solo Administradores
            </div>
        </div>

        <!-- Tarjeta principal -->
        <div class="admin-border rounded-3xl premium-card overflow-hidden">
            <!-- Header exclusivo -->
            <div class="bg-gradient-to-r from-gray-800 via-lib-blue to-gray-900 p-8 text-center relative overflow-hidden">
                <div class="absolute inset-0 bg-black/20"></div>
                <!-- Patrón de fondo -->
                <div class="absolute inset-0 opacity-10">
                    <div class="absolute top-4 left-4 w-8 h-8 border-2 border-lib-yellow transform rotate-45"></div>
                    <div class="absolute top-4 right-4 w-6 h-6 border-2 border-lib-red rounded-full"></div>
                    <div class="absolute bottom-4 left-6 w-4 h-4 border-2 border-lib-blue"></div>
                    <div class="absolute bottom-4 right-6 w-5 h-5 border-2 border-lib-yellow transform rotate-45"></div>
                </div>
                
                <div class="relative z-10">
                    <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-lib-yellow to-lib-red rounded-3xl mb-4 crown-glow crown-rotate">
                        <i class="fas fa-crown text-4xl text-white"></i>
                    </div>
                    <h1 class="text-4xl font-bold text-white mb-2">
                        Panel <span class="exclusive-text font-black">Administrativo</span>
                    </h1>
                    <div class="mt-3 inline-flex items-center space-x-2 text-white/80 text-sm">
                        <i class="fas fa-lock text-lib-yellow"></i>
                        <span>Sistema de alta seguridad</span>
                    </div>
                </div>
            </div>

            <!-- Formulario -->
            <div class="bg-white/95 p-8">
                <form action="login_admin.php" method="post" class="space-y-6">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">

                    <!-- Campo de usuario -->
                    <div class="admin-hover space-y-3">
                        <label for="name" class="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                            <i class="fas fa-user-cog text-lib-blue mr-2"></i>
                            Nombre de Administrador
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder="admin_usuario"
                            class="admin-input w-full px-6 py-4 bg-gray-50 border-3 border-gray-300 rounded-2xl focus:border-lib-blue focus:bg-white outline-none text-gray-800 placeholder-gray-500 font-semibold transition-all duration-300">
                    </div>

                    <!-- Campo de contraseña -->
                    <div class="admin-hover space-y-3">
                        <label for="password" class="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                            <i class="fas fa-key text-lib-red mr-2"></i>
                            Contraseña de Seguridad
                        </label>
                        <div class="relative">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                placeholder="••••••••••••"
                                class="admin-input w-full px-6 py-4 pr-14 bg-gray-50 border-3 border-gray-300 rounded-2xl focus:border-lib-blue focus:bg-white outline-none text-gray-800 placeholder-gray-500 font-semibold transition-all duration-300">
                            <button 
                                type="button" 
                                onclick="togglePassword()" 
                                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-lib-blue transition-colors duration-200">
                                <i id="eye-icon" class="fas fa-eye text-lg"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Información de seguridad -->
                    <div class="bg-blue-50 border-l-4 border-lib-blue rounded-lg p-4">
                        <div class="flex items-start">
                            <i class="fas fa-info-circle text-lib-blue mr-3 mt-1"></i>
                            <div>
                                <p class="text-sm font-semibold text-blue-800">Acceso Restringido</p>
                                <p class="text-xs text-blue-600 mt-1">Solo personal autorizado puede acceder a este panel</p>
                            </div>
                        </div>
                    </div>

                    <!-- Botón de acceso -->
                    <button
                        type="submit"
                        class="w-full btn-admin text-white py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 focus:ring-4 focus:ring-lib-blue/50 focus:outline-none transition-all duration-300 uppercase tracking-wider">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        Acceder al Panel
                    </button>
                </form>

                <!-- Mensaje de error (ejemplo) -->
                <div id="error-message" class="hidden mt-6 p-4 bg-red-50 border-l-4 border-lib-red rounded-lg">
                    <div class="flex items-center">
                        <i class="fas fa-exclamation-triangle text-lib-red mr-3"></i>
                        <p class="text-red-800 font-medium">Credenciales incorrectas. Acceso denegado.</p>
                    </div>
                </div>

                <!-- Divisor -->
                <div class="flex items-center my-8">
                    <div class="flex-1 h-px bg-gradient-to-r from-lib-blue to-lib-red opacity-30"></div>
                    <span class="px-4 text-gray-500 font-medium text-sm">OPCIONES</span>
                    <div class="flex-1 h-px bg-gradient-to-l from-lib-blue to-lib-red opacity-30"></div>
                </div>

                <!-- Botón volver -->
                <div class="space-y-4">
                    <a href="index.php" class="admin-hover flex items-center justify-center w-full py-3 px-6 bg-gray-100 border-2 border-gray-300 rounded-2xl font-bold text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-all duration-300">
                        <i class="fas fa-arrow-left mr-3 text-lib-blue"></i>
                        Volver al Sitio Principal
                    </a>
                </div>

            </div>
        </div>

        <!-- Footer exclusivo -->
        <div class="text-center mt-8 text-white/60 text-sm">
            <div class="flex items-center justify-center space-x-2 mb-2">
                <i class="fas fa-server text-lib-yellow"></i>
                <span class="font-medium">Sistema de Administración </span>
            </div>
            <p>&copy; 2025 Mundo Librería - Panel de Control</p>
        </div>
    </div>
    <script src="../js/Admin/login_admin.js"></script>

    <?php if (!empty($error)): ?>
    <script>
        Swal.fire({
            icon: '<?php echo $type; ?>',
            title: 'Acceso denegado',
            text: '<?php echo $error; ?>',
            confirmButtonColor: '#3182CE'
        })
    </script>
    <?php endif; ?>
    
</body>

</html>