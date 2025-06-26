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
          <button class="bg-lib-red px-4 py-1.5 rounded-r-full hover:bg-red-700 transition">
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

  </header>

  <nav class="bg-lib-yellow border-b border-lib-blue">
    <div class="container mx-auto px-4 py-2">
      <div class="flex flex-wrap justify-center gap-4 text-sm">
        <!-- Inicio -->
        <a href="../pages/index.php" class="px-3 py-1 rounded-full hover:bg-blue-50  text-lib-blue font-medium">Inicio</a>

        <!-- Catálogo con dropdown -->
        <div class="relative group" x-data="{ open: false }" @mouseenter="open = true" @mouseleave="open = false">
          <button class="px-3 py-1 hover:bg-white hover:text-lib-blue rounded-full transition flex items-center gap-1">
            Catálogo
            <svg class="w-4 h-4 transition-transform transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Submenú -->
          <div x-show="open"
            x-transition:enter="transition ease-out duration-200"
            x-transition:enter-start="opacity-0 scale-95"
            x-transition:enter-end="opacity-100 scale-100"
            x-transition:leave="transition ease-in duration-150"
            x-transition:leave-start="opacity-100 scale-100"
            x-transition:leave-end="opacity-0 scale-95"
            class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
            <a href="../pages/producto.html" class="block px-4 py-2 text-lib-blue font-medium hover:bg-blue-50">Ver todo</a>
            <a href="../pages/categoria.html?cat=papeleria" class="block px-4 py-2 text-gray-800 hover:bg-lib-blue hover:text-white">Papelería</a>
            <a href="../pages/categoria.html?cat=oficina" class="block px-4 py-2 text-gray-800 hover:bg-lib-blue hover:text-white">Oficina</a>
            <a href="../pages/categoria.html?cat=libreria" class="block px-4 py-2 text-gray-800 hover:bg-lib-blue hover:text-white">Librería</a>
            <a href="../pages/categoria.html?cat=arte" class="block px-4 py-2 text-gray-800 hover:bg-lib-blue hover:text-white">Arte</a>

          </div>
        </div>

        <!-- Resto de enlaces -->
        <a href="#" class="px-3 py-1 hover:bg-white hover:text-lib-blue rounded-full transition">Novedades</a>
        <a href="#" class="px-3 py-1 hover:bg-white hover:text-lib-blue rounded-full transition">Ofertas</a>
        <a href="../pages/contact.html" class="px-3 py-1 hover:bg-white hover:text-lib-blue rounded-full transition">Contacto</a>
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




  <!-- Productos Destacados -->
  <main class="mt-12 container mx-auto px-4">
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-3xl font-bold text-lib-blue">Productos Destacados</h2>
      <a href="#" class="text-lib-red hover:underline font-medium">Ver todos →</a>
    </div>

    <!-- Grid de Productos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

      <!-- Producto Rediseñado -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <!-- Imagen con efectos -->
        <div class="relative overflow-hidden">
          <div class="aspect-[4/5]flex items-center justify-center">
            <img src="../assets/lapices/lapiz-pasta-azul.png"
              alt="Lápiz Grafito Faber Castel"
              class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300">
          </div>

          <!-- Botón de favoritos -->
          <button class="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-lib-red hover:text-white transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        </div>

        <!-- Contenido -->
        <div class="p-4 border-t border-gray-100">
          <!-- Información del producto -->
          <div class="mb-3">
            <h3 class="font-bold text-gray-900 line-clamp-1">Lápiz Pasta</h3>
            <p class="text-gray-600 text-sm mt-1">Faber-Castell</p>
          </div>

          <!-- Rating -->
          <div class="flex items-center mb-3">
            <div class="flex text-amber-400">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current text-gray-300" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </div>
            <span class="text-gray-500 text-xs ml-2">(24 reseñas)</span>
          </div>

          <!-- Precio y CTA -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-lg font-bold text-lib-blue">$950</p>
            </div>
            <button class="bg-lib-yellow hover:bg-yellow-500 text-lib-blue px-3 py-2 rounded-lg font-medium flex items-center gap-1 transition-colors shadow-sm hover:shadow-md">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span class="text-sm">Agregar</span>
            </button>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <!-- Imagen con efectos -->
        <div class="relative overflow-hidden">
          <div class="aspect-[4/5]flex items-center justify-center">
            <img src="../assets/lapices/lapiz-grafito.png"
              alt="Lápiz Grafito Faber Castel"
              class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300">
          </div>

          <!-- Botón de favoritos -->
          <button class="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-lib-red hover:text-white transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        </div>

        <!-- Contenido -->
        <div class="p-4 border-t border-gray-100">
          <!-- Información del producto -->
          <div class="mb-3">
            <h3 class="font-bold text-gray-900 line-clamp-1">Lápiz Grafito HB Profesional</h3>
            <p class="text-gray-600 text-sm mt-1">Faber-Castell</p>
          </div>

          <!-- Rating -->
          <div class="flex items-center mb-3">
            <div class="flex text-amber-400">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current text-gray-300" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </div>
            <span class="text-gray-500 text-xs ml-2">(24 reseñas)</span>
          </div>

          <!-- Precio y CTA -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-lg font-bold text-lib-blue">$850</p>
            </div>
            <button class="bg-lib-yellow hover:bg-yellow-500 text-lib-blue px-3 py-2 rounded-lg font-medium flex items-center gap-1 transition-colors shadow-sm hover:shadow-md">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span class="text-sm">Agregar</span>
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <!-- Imagen con efectos -->
        <div class="relative overflow-hidden">
          <div class="aspect-[4/5]flex items-center justify-center">
            <img src="../assets/oficina/corchetera.jpg"
              alt="Lápiz Grafito Faber Castel"
              class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300">
          </div>

          <!-- Botón de favoritos -->
          <button class="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-lib-red hover:text-white transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        </div>

        <!-- Contenido -->
        <div class="p-4 border-t border-gray-100">
          <!-- Información del producto -->
          <div class="mb-3">
            <h3 class="font-bold text-gray-900 line-clamp-1">Corchetera 50cm</h3>
            <p class="text-gray-600 text-sm mt-1"></p>
          </div>

          <!-- Rating -->
          <div class="flex items-center mb-3">
            <div class="flex text-amber-400">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current text-gray-300" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </div>
            <span class="text-gray-500 text-xs ml-2">(24 reseñas)</span>
          </div>

          <!-- Precio y CTA -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-lg font-bold text-lib-blue">$2500</p>
            </div>
            <button class="bg-lib-yellow hover:bg-yellow-500 text-lib-blue px-3 py-2 rounded-lg font-medium flex items-center gap-1 transition-colors shadow-sm hover:shadow-md">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span class="text-sm">Agregar</span>
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <!-- Imagen con efectos -->
        <div class="relative overflow-hidden">
          <div class="aspect-[4/5]flex items-center justify-center">
            <img src="../assets/papeleria/cartulina-simple-colores.jpg"
              alt="Lápiz Grafito Faber Castel"
              class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300">
          </div>

          <!-- Botón de favoritos -->
          <button class="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-lib-red hover:text-white transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        </div>

        <!-- Contenido -->
        <div class="p-4 border-t border-gray-100">
          <!-- Información del producto -->
          <div class="mb-3 min-h-[3rem]">
            <h3 class="font-bold text-gray-900 break-words leading-tight">
              CARTULINA SIMPLE DE COLORES PLIEGO 50 x 70 cm.
            </h3>
          </div>

          <!-- Rating -->
          <div class="flex items-center mb-3">
            <div class="flex text-amber-400">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <svg class="w-4 h-4 fill-current text-gray-300" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </div>
            <span class="text-gray-500 text-xs ml-2">(24 reseñas)</span>
          </div>

          <!-- Precio y CTA -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-lg font-bold text-lib-blue">$1500</p>
            </div>
            <button class="bg-lib-yellow hover:bg-yellow-500 text-lib-blue px-3 py-2 rounded-lg font-medium flex items-center gap-1 transition-colors shadow-sm hover:shadow-md">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span class="text-sm">Agregar</span>
            </button>
          </div>
        </div>
      </div>

  </main>

  <!-- Footer se cargará aquí -->
  <div id="footer-placeholder"></div>

  <!-- Scripts -->
  <script src="../js/carousel.js"></script>
  <script src="../js/components.js"></script>
  <script src="../js/footer.js"></script>


</body>

</html>