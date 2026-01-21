<!-- Botón toggle mejorado -->
<button class="sidebar-toggle fixed top-4 left-4 z-50 bg-blue-600 p-2 rounded-lg text-white shadow-lg md:left-4 transition-all duration-300 hover:bg-blue-700">
    <!-- Icono de hamburguesa -->
    <svg class="w-6 h-6 open-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
    <!-- Icono de X -->
    <svg class="w-6 h-6 close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: none;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
</button>

<div class="sidebar" id="sidebar">
    <div class="logo-details text-white mb-6">
        <div class="flex items-center gap-3">
            <svg class="w-8 h-8 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            </svg>
            <span class="font-bold text-lg logo-text px-3">Mundo Librería</span>
        </div>
    </div>
    <div class="nav-links space-y-2">
        <a href="/pages/Admin/admin.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
            <i class="fas fa-home text-white mr-3 w-5 text-center"></i>
            <span class="nav-text text-white">Inicio</span>
        </a>
        <a href="/pages/Admin/pedidos.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
            <i class="fas fa-box text-white mr-3 w-5 text-center"></i>
            <span class="nav-text text-white">Pedidos</span>
        </a>
        <a href="/pages/Admin/usuarios.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
            <i class="fas fa-users text-white mr-3 w-5 text-center"></i>
            <span class="nav-text text-white">Usuarios</span>
        </a>
        <a href="/pages/Admin/categorias.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
            <i class="fas fa-tags text-white mr-3 w-5 text-center"></i>
            <span class="nav-text text-white">Categorías</span>
        </a>
        <a href="/pages/Admin/familias.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
            <i class="fas fa-sitemap text-white mr-3 w-5 text-center"></i>
            <span class="nav-text text-white">Familias</span>
        </a>
        <a href="/pages/Admin/generador_codigos.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
            <i class="fas fa-barcode text-white mr-3 w-5 text-center"></i>
            <span class="nav-text text-white">Generar Códigos</span>
        </a>
    </div>

    <div class="mt-8 text-white user-section">
        <div class="font-semibold user-name"><?php echo htmlspecialchars($_SESSION['nombre'] ?? 'Administrador'); ?></div>
        <a href="/db/Cerrar_sesion.php" class="inline-block mt-3 bg-red-600 px-3 py-1 rounded text-white logout-btn">
            Cerrar sesión
        </a>
    </div>
</div>













