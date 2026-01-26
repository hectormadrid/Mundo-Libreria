<?php require_once __DIR__.'/logic/perfil_logic.php'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="../assets/MUNDO-WEB.ico">
    <title>Mi Perfil - Mundo Librería</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="../style/perfil.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'lib-red': '#E53E3E',
                        'lib-yellow': '#F6E05E',
                        'lib-blue': '#3182CE',
                        'lib-gradient': 'linear-gradient(135deg, #E53E3E 0%, #3182CE 100%)'
                    }
                }
            }
        }
    </script>
    <style>
        .dual-gradient {
            background: linear-gradient(135deg, #E53E3E 0%, #3182CE 100%);
        }
        .text-dual-gradient {
            background: linear-gradient(135deg, #E53E3E, #3182CE);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-red-50 via-white to-blue-50 min-h-screen">

    <!-- Header con gradiente rojo-azul -->
    <header class="gradient-header shadow-2xl sticky top-0 z-50">
        <div class="container mx-auto px-6 py-4">
            <div class="flex justify-between items-center">
                <a href="/" class="flex items-center group pulse">
                    <div class="ml-4">
                        <h1 class="text-3xl font-bold text-white">Mundo <span class="text-lib-yellow">Librería</span></h1>
                        <p class="text-blue-100 text-sm">Gestión de tu perfil personal</p>
                    </div>
                </a>
                <nav class="flex items-center space-x-6">
                    <a href="index.php" class="text-white hover:text-lib-yellow transition-colors duration-300 flex items-center">
                        <i class="fas fa-home mr-2"></i>
                        Inicio
                    </a>
                    <a href="carrito.php" class="text-white hover:text-lib-yellow transition-colors duration-300 flex items-center">
                        <i class="fas fa-shopping-cart mr-2"></i>
                        Carrito
                    </a>
                    <a href="../db/Cerrar_sesion.php" class="text-white hover:text-lib-yellow transition-colors duration-300 flex items-center">
                        <i class="fas fa-sign-out-alt mr-2"></i>
                        Salir
                    </a>
                </nav>
            </div>
        </div>
    </header>

    <main class="container mx-auto px-6 py-12">

        <!-- Breadcrumb -->
        <div class="flex items-center space-x-2 text-gray-600 mb-8">
            <i class="fas fa-home text-lib-blue"></i>
            <a href="index.php" class="hover:text-lib-red transition-colors">Inicio</a>
            <i class="fas fa-chevron-right text-xs text-lib-red"></i>
            <span class="text-dual-gradient font-semibold">Mi Perfil</span>
        </div>

        <div class="text-center mb-12 fade-in">
            <h1 class="text-5xl font-bold mb-4">
                <i class="fas fa-user-circle dual-gradient" style="-webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
                <span class="text-dual-gradient">Mi Perfil</span>
            </h1>
            <p class="text-gray-600 text-lg">Gestiona tu información personal con estilo</p>
        </div>

        <!-- Mensajes -->
        <?php if (!empty($mensaje)): ?>
            <?php 
            $tipo = explode(':', $mensaje)[0];
            $texto = explode(':', $mensaje)[1];
            $color = $tipo === 'success' ? 'green' : 'red';
            ?>
            <div class="mb-6 p-4 rounded-2xl border-l-4 border-<?= $color ?>-500 bg-<?= $color ?>-50 text-<?= $color ?>-800">
                <i class="fas <?= $tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?> mr-2"></i>
                <?= htmlspecialchars($texto) ?>
            </div>
        <?php endif; ?>

        <div class="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            <!-- Información del Perfil - Tarjeta Principal -->
            <div class="lg:col-span-2 fade-in">
                <div class="glass-effect rounded-3xl shadow-2xl overflow-hidden card-hover gradient-border">
                    <div class="dual-gradient p-6">
                        <h3 class="text-2xl font-bold text-white flex items-center">
                            <i class="fas fa-user-edit mr-3"></i> Información Personal
                        </h3>
                    </div>
                    <div class="p-6">
                        <form action="perfilUser.php" method="POST" class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                                        <i class="fas fa-id-card mr-2 icon-red"></i>RUT
                                    </label>
                                    <input type="text" 
                                           class="w-full p-3 border border-gray-300 rounded-xl bg-gradient-to-r from-red-50 to-blue-50"
                                           value="<?= isset($usuario['rut']) ? htmlspecialchars($usuario['rut']) : '' ?>"
                                           readonly>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                                        <i class="fas fa-envelope mr-2 icon-blue"></i>Correo Electrónico
                                    </label>
                                    <input type="email" 
                                           class="w-full p-3 border border-gray-300 rounded-xl bg-gradient-to-r from-blue-50 to-red-50"
                                           value="<?= isset($usuario['correo']) ? htmlspecialchars($usuario['correo']) : '' ?>"
                                           readonly>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    <i class="fas fa-user mr-2 text-dual-gradient"></i>Nombre Completo *
                                </label>
                                <input type="text" name="nombre" required 
                                       class="w-full p-3 border border-gray-300 rounded-xl input-focus focus:outline-none bg-gradient-to-r from-red-50 to-blue-50"
                                       placeholder="Tu nombre completo"
                                       value="<?= isset($usuario['nombre']) ? htmlspecialchars($usuario['nombre']) : '' ?>">
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                                        <i class="fas fa-phone mr-2 icon-red"></i>Teléfono
                                    </label>
                                    <input type="tel" name="telefono" 
                                           class="w-full p-3 border border-gray-300 rounded-xl input-focus focus:outline-none bg-gradient-to-r from-red-50 to-white"
                                           placeholder="+56 9 1234 5678"
                                           value="<?= isset($usuario['telefono']) ? htmlspecialchars($usuario['telefono']) : '' ?>">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                                        <i class="fas fa-map-marker-alt mr-2 icon-blue"></i>Dirección
                                    </label>
                                    <input type="text" name="direccion" 
                                           class="w-full p-3 border border-gray-300 rounded-xl input-focus focus:outline-none bg-gradient-to-r from-white to-blue-50"
                                           placeholder="Av. Principal #123"
                                           value="<?= isset($usuario['direccion']) ? htmlspecialchars($usuario['direccion']) : '' ?>">
                                </div>
                            </div>

                            <div class="flex justify-end space-x-4 pt-4">
                                <a href="/" 
                                   class="btn-secondary text-white px-6 py-3 rounded-xl font-semibold flex items-center transition-all duration-300">
                                    <i class="fas fa-arrow-left mr-2"></i>Volver al Inicio
                                </a>
                                <button type="submit" 
                                        class="btn-primary text-white px-6 py-3 rounded-xl font-semibold flex items-center transition-all duration-300 pulse">
                                    <i class="fas fa-save mr-2"></i>Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Panel Lateral -->
            <div class="lg:col-span-1 space-y-6 fade-in">
                <!-- Resumen de Cuenta - Tarjeta Azul-Rojo -->
                <div class="glass-effect rounded-3xl shadow-2xl overflow-hidden card-hover">
                    <div class="gradient-bg-reverse p-6">
                        <h3 class="text-xl font-bold text-white flex items-center">
                            <i class="fas fa-user-circle mr-3"></i> Mi Cuenta
                        </h3>
                    </div>
                    <div class="p-6">
                        <div class="space-y-4">
                            <div class="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-blue-50 rounded-lg">
                                <span class="text-gray-600 flex items-center">
                                    <i class="fas fa-calendar-alt mr-2 icon-red"></i>Miembro desde:
                                </span>
                                <span class="font-semibold text-lib-blue"><?= date('Y') ?></span>
                            </div>
                            <div class="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg">
                                <span class="text-gray-600 flex items-center">
                                    <i class="fas fa-check-circle mr-2 icon-blue"></i>Estado:
                                </span>
                                <span class="status-badge font-semibold">Activo</span>
                            </div>
                            <div class="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-blue-50 rounded-lg">
                                <span class="text-gray-600 flex items-center">
                                    <i class="fas fa-hashtag mr-2 icon-red"></i>Usuario ID:
                                </span>
                                <span class="font-semibold text-lib-blue">#<?= isset($usuario['id']) ? htmlspecialchars($usuario['id']) : '' ?></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Acciones Rápidas - Tarjeta con degradado mixto -->
                <div class="glass-effect rounded-3xl shadow-2xl overflow-hidden card-hover">
                    <div class="dual-gradient p-6">
                        <h3 class="text-xl font-bold text-white flex items-center">
                            <i class="fas fa-bolt mr-3"></i> Acciones Rápidas
                        </h3>
                    </div>
                    <div class="p-6">
                        <div class="space-y-3">
                            <a href="carrito.php" 
                               class="flex items-center p-3 bg-gradient-to-r from-blue-50 to-red-50 text-gray-800 rounded-xl quick-action transition-all duration-300 hover:shadow-lg border-l-4 border-lib-blue">
                                <i class="fas fa-shopping-cart mr-3 text-lg text-lib-blue"></i>
                                <span>Ver Carrito</span>
                                <i class="fas fa-arrow-right ml-auto text-lib-red"></i>
                            </a>
                            
                            <a href="historial_pedidos.php" 
                               class="flex items-center p-3 bg-gradient-to-r from-red-50 to-blue-50 text-gray-800 rounded-xl quick-action transition-all duration-300 hover:shadow-lg border-l-4 border-lib-red">
                                <i class="fas fa-history mr-3 text-lg text-lib-red"></i>
                                <span>Historial de Pedidos</span>
                                <i class="fas fa-arrow-right ml-auto text-lib-blue"></i>
                            </a>
                            
                            <a href="../db/Cerrar_sesion.php" 
                               class="flex items-center p-3 bg-gradient-to-r from-blue-50 to-red-50 text-gray-800 rounded-xl quick-action transition-all duration-300 hover:shadow-lg border-l-4 border-lib-blue">
                                <i class="fas fa-sign-out-alt mr-3 text-lg text-lib-blue"></i>
                                <span>Cerrar Sesión</span>
                                <i class="fas fa-arrow-right ml-auto text-lib-red"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Tarjeta de Contacto -->
                <div class="glass-effect rounded-3xl shadow-2xl overflow-hidden card-hover">
                    <div class="gradient-bg p-6">
                        <h3 class="text-xl font-bold text-white flex items-center">
                            <i class="fas fa-headset mr-3"></i> Soporte
                        </h3>
                    </div>
                    <div class="p-6 text-center">
                        <p class="text-gray-600 mb-4">¿Necesitas ayuda?</p>
                        <button class="btn-primary text-white px-4 py-2 rounded-lg w-full">
                            <i class="fas fa-envelope mr-2"></i>Contactar Soporte
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer con gradiente -->
    <footer class="dual-gradient text-white py-8 mt-12">
        <div class="container mx-auto px-4 text-center">
            <p>&copy; 2025 Mundo Librería. Todos los derechos reservados.</p>
            <div class="flex justify-center space-x-4 mt-4">
                <a href="#" class="hover:text-lib-yellow transition-colors transform hover:scale-110">
                    <i class="fab fa-facebook text-xl"></i>
                </a>
                <a href="#" class="hover:text-lib-yellow transition-colors transform hover:scale-110">
                    <i class="fab fa-instagram text-xl"></i>
                </a>
                <a href="#" class="hover:text-lib-yellow transition-colors transform hover:scale-110">
                    <i class="fab fa-twitter text-xl"></i>
                </a>
            </div>
        </div>
    </footer>

    <!-- Script para efectos interactivos -->
    <script>
        // Efectos de hover mejorados
        document.querySelectorAll('.card-hover').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Validación del formulario
        document.querySelector('form').addEventListener('submit', function(e) {
            const nombre = document.querySelector('input[name="nombre"]').value;
            if (!nombre.trim()) {
                e.preventDefault();
                Swal.fire({
                    title: 'Campo requerido',
                    text: 'El nombre completo es obligatorio',
                    icon: 'warning',
                    confirmButtonColor: '#E53E3E',
                    confirmButtonText: 'Entendido',
                    background: 'linear-gradient(135deg, #E53E3E 0%, #3182CE 100%)',
                    color: 'white'
                });
            }
        });

        // Efecto de pulso en botones
        document.querySelectorAll('.pulse').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.animation = 'pulse 1s infinite';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.animation = 'none';
            });
        });
    </script>

</body>
</html>




















