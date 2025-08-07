<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="../assets/MUNDO-WEB.ico">
  <title>Mundo Libreria</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <!-- Configuración personalizada de Tailwind -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'lib-red': '#E53E3E', // Rojo vibrante
            'lib-yellow': '#F6E05E', // Amarillo claro
            'lib-blue': '#3182CE', // Azul sólido
          }
        }
      }
    }
  </script>
</head>

<body class="bg-gray-50 text-gray-800 font-sans">

  <!-- Header se cargará aquí -->
  <header class="bg-lib-blue text-white shadow-md">
    <div class="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center">
      <div class="flex items-center mb-4 md:mb-0">
        <img src="../assets/logo.ico" alt="Logo" class="h-10 mr-3">
        <h1 class="text-2xl font-bold">Mundo <span class="text-lib-yellow">Librería</span></h1>
      </div>
      <!-- Barra de búsqueda y botones de usuario -->
      <div class="flex items-center space-x-4">
        <!-- Búsqueda -->
        <div class="flex items-center">
          <input
            type="text"
            placeholder="Buscar Producto..."
            class="px-4 py-2 rounded-l-full text-sm focus:outline-none text-gray-800 w-48 md:w-64">
          <button class="bg-lib-yellow px-4 py-1.5 rounded-r-full hover:bg-yellow-300 transition">
            🔍
          </button>
        </div>
        <!-- Botón Iniciar Sesión -->
        <?php session_start(); ?>
        <?php if (isset($_SESSION['nombre'])): ?>
          <div class="flex items-center space-x-2">
            <span class="text-white font-semibold hidden md:inline">Hola, <?= htmlspecialchars($_SESSION['nombre']) ?></span>
            <a href="../db/Cerrar_sesion.php" class="bg-red-600 px-4 py-2 rounded-full text-white hover:bg-red-700 transition">
              Cerrar sesión
            </a>
          </div>
        <?php else: ?>
          <a href="login.php" class="bg-lib-yellow text-lib-blue px-4 py-2 rounded-full hover:bg-yellow-400 transition font-medium flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="hidden md:inline">Iniciar Sesión</span>
          </a>
        <?php endif; ?>
        <a href="Carrito.php" class="relative text-white p-2 rounded-full hover:bg-white/20 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </a>
      </div>
    </div>  
  </header>

  <nav class="bg-lib-yellow border-b border-lib-blue">
    <div class="container mx-auto px-4 py-2">
      <div class="flex flex-wrap justify-center gap-4 text-sm">
        <!-- Inicio -->
        <a href="../pages/index.php" data-category="all" class=" category-link px-3 py-1 rounded-full hover:bg-blue-50  text-lib-blue font-medium">Inicio</a>
        <a data-category="libreria" class="category-link px-3 py-1 hover:bg-white hover:text-lib-blue rounded-full transition">Librería</a>
        <a data-category="papeleria" class="category-link px-3 py-1 hover:bg-white hover:text-lib-blue rounded-full transition">Papelería</a>
        <a data-category="oficina" class="category-link px-3 py-1 hover:bg-white hover:text-lib-blue rounded-full transition">Oficina</a>
        <a id="contacto-link" class="px-3 py-1 hover:bg-white hover:text-lib-blue rounded-full transition">Contacto</a>
      </div>
    </div>
  </nav>

  <!-- Banner Principal -->
  <section class="mt-2 container mx-auto px-4">
    <!-- Contenedor del Carousel -->
    <div class="relative h-72 rounded-lg overflow-hidden">
      <!-- Slides Container -->
      <div id="slides-container" class="flex h-full transition-transform duration-500 ease-in-out">
        <!-- Slide 1 -->
        <div class="min-w-full h-full relative">
          <div class="bg-gradient-to-r from-lib-blue to-lib-red h-full flex items-center justify-center text-center">
            <div class="absolute inset-0 bg-black opacity-20"></div>
            <div class="relative z-10 px-4 text-white">
              <img src="assets/banner2.jpg" alt="Oferta especial" class="w-full h-full object-cover">
            </div>
          </div>
        </div>

        <!-- Slide 2 (Ejemplo con imagen) -->
        <div class="min-w-full h-full relative">

          <img src="assets/banner2.jpg" alt="Oferta especial" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black opacity-30"></div>
          <div class="relative z-10 h-full flex items-center justify-center text-center text-white px-4">
            <div>
              <h2 class="text-4xl font-bold mb-4">Ofertas <span class="text-lib-yellow">Exclusivas</span></h2>
              <p class="text-xl mb-6">Hasta 50% de descuento en libros seleccionados</p>
              <button class="bg-lib-yellow text-lib-blue px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                Ver Ofertas
              </button>
            </div>
          </div>
        </div>

        <!-- Slide 3 (Otro ejemplo) -->
        <div class="min-w-full h-full relative">
          <img src="assets/banner3.jpg" alt="Nueva colección" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black opacity-30"></div>
          <div class="relative z-10 h-full flex items-center justify-center text-center text-white px-4">
            <div>
              <h2 class="text-4xl font-bold mb-4">Nueva <span class="text-lib-yellow">Colección</span></h2>
              <p class="text-xl mb-6">Descubre los lanzamientos de este mes</p>
              <button class="bg-lib-yellow text-lib-blue px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                Ver Colección
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Controles de navegación -->
      <button id="prev-slide" class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 text-white p-2 rounded-full hover:bg-white/50 z-20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button id="next-slide" class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 text-white p-2 rounded-full hover:bg-white/50 z-20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Indicadores de paginación -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        <button class="slide-indicator w-3 h-3 rounded-full bg-white/50 hover:bg-white"></button>
        <button class="slide-indicator w-3 h-3 rounded-full bg-white/50 hover:bg-white"></button>
        <button class="slide-indicator w-3 h-3 rounded-full bg-white/50 hover:bg-white"></button>
      </div>
    </div>
  </section>


  <main class="mt-12 container mx-auto px-4">
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-3xl font-bold text-lib-blue">Productos</h2>

    </div>

    <!-- Grid de Productos -->
    <div id="productos-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <!-- Los productos se cargarán aquí dinámicamente -->
    </div>

  </main>
  <div id="productos-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <!-- productos aquí -->
  </div>

  <!-- Footer se cargará aquí -->
  <footer class="bg-lib-blue text-white mt-16 py-10">
    <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 class="font-bold text-xl mb-4 flex items-center">
          <img src="../assets/logo.ico" alt="Logo" class="h-6 mr-2"> Mundo Librería
        </h3>
      </div>
      <div>
        <h3 class="font-bold text-lg mb-4">Horario</h3>
        <p>Lunes a Viernes: 9:00 - 20:00</p>
        <p>Sábados: 10:00 - 18:00</p>
      </div>
      <div>
        <h3 class="font-bold text-lg mb-4">Síguenos</h3>
        <div class="flex space-x-4">
          <a href="#" class="bg-white text-lib-blue p-2 rounded-full hover:bg-lib-yellow">📘</a>
          <a href="#" class="bg-white text-lib-blue p-2 rounded-full hover:bg-lib-yellow">📸</a>
          <a href="#" class="bg-white text-lib-blue p-2 rounded-full hover:bg-lib-yellow">🐦</a>
        </div>
      </div>
    </div>
    <div class="border-t border-blue-300 mt-8 pt-6 text-center text-sm">
      <p>© 2025 Mundo Librería. Todos los derechos reservados.</p>
    </div>
  </footer>

  <!-- Scripts -->
  <script src="../js/carousel.js"></script>
  <script src="../js/components.js"></script>
  <script src="../js/cargarProductosUser.js"></script>
  <script src="../js/contacto.js"></script>



</body>

</html>