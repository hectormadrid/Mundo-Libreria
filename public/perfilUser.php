<?php require_once __DIR__.'/logic/perfil_logic.php'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="assets/MUNDO-WEB.ico">
    <title>Mi Perfil - Mundo Librería</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="css/perfil.css">
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
            <div class="inline-block relative mb-6">
                <div class="w-32 h-32 dual-gradient rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-2xl border-4 border-white">
                    <?= strtoupper(substr($usuario['nombre'] ?? 'U', 0, 1)) ?>
                </div>
                <div class="absolute bottom-0 right-0 bg-green-500 w-8 h-8 rounded-full border-4 border-white shadow-lg"></div>
            </div>
            <h1 class="text-5xl font-bold mb-4">
                <span class="text-dual-gradient">¡Hola, <?= htmlspecialchars(explode(' ', $usuario['nombre'] ?? 'Usuario')[0]) ?>!</span>
            </h1>
            <p class="text-gray-600 text-lg">Bienvenido a tu panel de control personal</p>
        </div>

        <!-- Mensajes con SweetAlert2 -->
        <?php if (!empty($mensaje)): ?>
            <?php 
            $tipo = explode(':', $mensaje)[0];
            $texto = explode(':', $mensaje)[1];
            ?>
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    Swal.fire({
                        icon: '<?= $tipo ?>',
                        title: '<?= $tipo === 'success' ? 'Éxito' : 'Error' ?>',
                        text: '<?= htmlspecialchars($texto) ?>',
                        confirmButtonColor: '#3182CE'
                    });
                });
            </script>
        <?php endif; ?>

        <div class="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            <!-- Información del Perfil - Tarjeta Principal -->
            <div class="lg:col-span-2 space-y-8 fade-in">
                <div class="glass-effect rounded-3xl shadow-2xl overflow-hidden card-hover gradient-border bg-white/80">
                    <div class="dual-gradient p-6">
                        <h3 class="text-2xl font-bold text-white flex items-center">
                            <i class="fas fa-user-edit mr-3"></i> Mis Datos
                        </h3>
                    </div>
                    <div class="p-8">
                        <form action="perfilUser.php" method="POST" class="space-y-6">
                            <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                                        <i class="fas fa-id-card mr-2 icon-red"></i>RUT
                                    </label>
                                    <input type="text" 
                                           class="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                           value="<?= isset($usuario['rut']) ? htmlspecialchars($usuario['rut']) : '' ?>"
                                           readonly>
                                    <p class="text-xs text-gray-400 mt-1">El RUT no puede ser modificado.</p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                                        <i class="fas fa-envelope mr-2 icon-blue"></i>Correo Electrónico
                                    </label>
                                    <input type="email" 
                                           class="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                           value="<?= isset($usuario['correo']) ? htmlspecialchars($usuario['correo']) : '' ?>"
                                           readonly>
                                    <p class="text-xs text-gray-400 mt-1">Para cambiar tu correo, contacta a soporte.</p>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">
                                    <i class="fas fa-user mr-2 text-dual-gradient"></i>Nombre Completo *
                                </label>
                                <input type="text" name="nombre" required 
                                       class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lib-blue focus:border-transparent transition-all outline-none"
                                       placeholder="Tu nombre completo"
                                       value="<?= isset($usuario['nombre']) ? htmlspecialchars($usuario['nombre']) : '' ?>">
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                                        <i class="fas fa-phone mr-2 icon-red"></i>Teléfono
                                    </label>
                                    <input type="tel" name="telefono" 
                                           class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lib-red focus:border-transparent transition-all outline-none"
                                           placeholder="+56 9 1234 5678"
                                           value="<?= isset($usuario['telefono']) ? htmlspecialchars($usuario['telefono']) : '' ?>">
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                                        <i class="fas fa-map-marker-alt mr-2 icon-blue"></i>Dirección
                                    </label>
                                    <input type="text" name="direccion" 
                                           class="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lib-blue focus:border-transparent transition-all outline-none"
                                           placeholder="Av. Principal #123"
                                           value="<?= isset($usuario['direccion']) ? htmlspecialchars($usuario['direccion']) : '' ?>">
                                </div>
                            </div>

                            <div class="flex justify-end space-x-4 pt-6">
                                <button type="submit" 
                                        class="dual-gradient text-white px-10 py-4 rounded-xl font-bold flex items-center transition-all duration-300 hover:scale-105 shadow-xl">
                                    <i class="fas fa-save mr-2"></i>Actualizar Perfil
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Pedidos Recientes -->
                <div class="glass-effect rounded-3xl shadow-2xl overflow-hidden card-hover gradient-border bg-white/80">
                    <div class="bg-gray-800 p-6 flex justify-between items-center">
                        <h3 class="text-xl font-bold text-white flex items-center">
                            <i class="fas fa-shopping-bag mr-3"></i> Pedidos Recientes
                        </h3>
                        <a href="historial_pedidos.php" class="text-blue-400 hover:text-white transition-colors text-sm font-semibold">
                            Ver historial <i class="fas fa-chevron-right ml-1"></i>
                        </a>
                    </div>
                    <div class="p-6">
                        <?php if (empty($pedidos_recientes)): ?>
                            <div class="text-center py-8">
                                <p class="text-gray-500 italic">Aún no has realizado pedidos.</p>
                                <a href="index.php" class="text-lib-blue font-bold hover:underline mt-2 inline-block">¡Empieza a comprar ahora!</a>
                            </div>
                        <?php else: ?>
                            <div class="space-y-4">
                                <?php foreach ($pedidos_recientes as $pedido): ?>
                                    <div class="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-white border border-transparent hover:border-blue-100 transition-all">
                                        <div class="flex items-center space-x-4 mb-3 md:mb-0">
                                            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                                <i class="fas fa-box"></i>
                                            </div>
                                            <div>
                                                <p class="font-bold text-gray-800">Pedido #<?= $pedido['id'] ?></p>
                                                <p class="text-xs text-gray-500"><?= date('d/m/Y', strtotime($pedido['fecha'])) ?></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center space-x-6">
                                            <div class="text-right">
                                                <p class="text-xs text-gray-500">Total</p>
                                                <p class="font-bold text-lib-blue">$<?= number_format($pedido['total'], 0, ',', '.') ?></p>
                                            </div>
                                            <div>
                                                <?php 
                                                $estado_color = $pedido['estado'] === 'pagado' ? 'bg-green-100 text-green-700' : ($pedido['estado'] === 'cancelado' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700');
                                                ?>
                                                <span class="px-3 py-1 rounded-full text-xs font-bold <?= $estado_color ?>">
                                                    <?= ucfirst($pedido['estado']) ?>
                                                </span>
                                            </div>
                                            <a href="pedido_detalle_user.php?id=<?= $pedido['id'] ?>" class="p-2 text-gray-400 hover:text-lib-blue transition-colors">
                                                <i class="fas fa-chevron-right"></i>
                                            </a>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>

            <!-- Panel Lateral -->
            <div class="lg:col-span-1 space-y-8 fade-in">
                <!-- Tarjeta de Seguridad -->
                <div class="glass-effect rounded-3xl shadow-2xl overflow-hidden card-hover gradient-border bg-white/80">
                    <div class="dual-gradient p-6">
                        <h3 class="text-xl font-bold text-white flex items-center">
                            <i class="fas fa-shield-alt mr-3"></i> Seguridad
                        </h3>
                    </div>
                    <div class="p-8">
                        <div class="text-center">
                            <i class="fas fa-key text-5xl text-lib-yellow mb-4"></i>
                            <h4 class="font-bold text-gray-800 mb-2">Tu Contraseña</h4>
                            <p class="text-sm text-gray-500 mb-6">Mantén tu cuenta segura cambiando tu clave regularmente.</p>
                            <a href="forgot_password.php" class="inline-block w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all border border-gray-200">
                                Cambiar Contraseña
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Tarjeta de Contacto / Soporte -->
                <div class="glass-effect rounded-3xl shadow-2xl overflow-hidden card-hover border border-blue-100 bg-white/80">
                    <div class="bg-blue-600 p-6">
                        <h3 class="text-xl font-bold text-white flex items-center">
                            <i class="fas fa-headset mr-3"></i> ¿Necesitas Ayuda?
                        </h3>
                    </div>
                    <div class="p-8 text-center">
                        <p class="text-gray-600 mb-6">Si tienes dudas sobre tus pedidos o productos, ¡escríbenos!</p>
                        <a href="https://wa.me/56941870729" target="_blank"
                           class="flex items-center justify-center space-x-2 w-full py-4 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-all shadow-lg hover:shadow-green-200">
                            <i class="fab fa-whatsapp text-2xl"></i>
                            <span>Contactar vía WhatsApp</span>
                        </a>
                        <p class="text-xs text-gray-400 mt-4 italic">Atención: Lun a Vie 9:00 - 20:00</p>
                    </div>
                </div>

                <!-- Cerrar Sesión -->
                <a href="../db/Cerrar_sesion.php" 
                   class="flex items-center justify-center space-x-3 w-full py-4 bg-white text-lib-red font-bold rounded-3xl border-2 border-lib-red hover:bg-lib-red hover:text-white transition-all group shadow-lg">
                    <i class="fas fa-sign-out-alt transition-transform group-hover:-translate-x-1"></i>
                    <span>Cerrar Sesión</span>
                </a>
            </div>
        </div>
    </main>

                        <h3 class="text-xl font-bold text-white flex items-center">
                            <i class="fas fa-headset mr-3"></i> Soporte
                        </h3>
                    </div>
                    <div class="p-6 text-center">
                        <p class="text-gray-600 mb-4">¿Necesitas ayuda?</p>
                        <button class="btn-primary text-white px-4 py-2 rounded-lg">
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




















