<?php session_start(); ?>
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
            'lib-red': '#E53E3E',
            'lib-yellow': '#F6E05E',
            'lib-blue': '#3182CE',
          },
          animation: {
            'float': 'float 6s ease-in-out infinite',
            'pulse-slow': 'pulse 3s infinite',
            'bounce-slow': 'bounce 2s infinite',
          }
        }
      }
    }
  </script>
  <style>
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    .glass-effect {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .gradient-text {
      background: linear-gradient(135deg, #3182CE, #F6E05E);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .book-shadow {
      box-shadow: 0 10px 25px rgba(49, 130, 206, 0.2);
    }
    
    .hover-lift {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .hover-lift:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }
    
    .pattern-dots {
      background-image: radial-gradient(circle, rgba(49, 130, 206, 0.1) 1px, transparent 1px);
      background-size: 20px 20px;
    }
  </style>
</head>

<body class="bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800 font-sans overflow-x-hidden">

  <!-- Header mejorado -->
  <header class="bg-gradient-to-r from-lib-blue via-lib-blue to-blue-600 text-white shadow-2xl relative overflow-hidden">
    <!-- Decorative elements -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 left-0 w-64 h-64 bg-lib-yellow rounded-full -translate-x-32 -translate-y-32 animate-pulse-slow"></div>
      <div class="absolute bottom-0 right-0 w-48 h-48 bg-lib-red rounded-full translate-x-24 translate-y-24 animate-float"></div>
    </div>
    
    <div class="container mx-auto px-4 py-4 relative z-10">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <!-- Logo mejorado -->
        <div class="flex items-center mb-4 md:mb-0 group">
          <div class="bg-white p-2 rounded-full shadow-lg mr-3 group-hover:scale-110 transition-transform duration-300">
            <img src="../assets/MUNDO-WEB.ico" alt="Logo" class="h-8 w-8">
          </div>
          <h1 class="text-3xl font-bold">
            Mundo <span class="text-lib-yellow animate-pulse">Librería</span>
          </h1>
        </div>
        
        <!-- Sección de usuario mejorada -->
        <div class="flex items-center space-x-4">
          <!-- Búsqueda con efecto glass -->
          <div class="flex items-center glass-effect rounded-full p-1 hover:bg-white/20 transition-all duration-300">
            <input
              type="text"
              placeholder="¿Qué buscas hoy?"
              class="px-4 py-3 rounded-l-full text-sm focus:outline-none text-gray-800 w-48 md:w-64 bg-white/90 placeholder-gray-500">
            <button class="bg-lib-yellow px-4 py-3 rounded-r-full hover:bg-yellow-300 transition-all duration-300 hover:scale-105 shadow-lg">
              <svg class="w-5 h-5 text-lib-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </div>
          
          <!-- Botones de usuario con efectos -->
          
          <?php if (isset($_SESSION['nombre'])): ?>
            <div class="flex items-center space-x-3 glass-effect rounded-full px-4 py-2">
              <div class="w-8 h-8 bg-lib-yellow rounded-full flex items-center justify-center">
                <span class="text-lib-blue font-bold text-sm"><?= strtoupper(substr($_SESSION['nombre'], 0, 1)) ?></span>
              </div>
              <span class="text-white font-semibold hidden md:inline">¡Hola, <?= htmlspecialchars($_SESSION['nombre']) ?>!</span>
              <a href="../db/Cerrar_sesion.php" class="bg-lib-red px-4 py-2 rounded-full text-white hover:bg-red-600 transition-all duration-300 hover:scale-105 shadow-lg">
                Salir
              </a>
            </div>
          <?php else: ?>
            <a href="login.php" class="bg-lib-yellow text-lib-blue px-6 py-3 rounded-full hover:bg-yellow-400 transition-all duration-300 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="hidden md:inline">Iniciar Sesión</span>
            </a>
          <?php endif; ?>
          
          <!-- Carrito mejorado -->
          <a href="Carrito.php" class="relative glass-effect text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110 group">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:animate-bounce-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="absolute -top-2 -right-2 bg-lib-red text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">0</span>
          </a>
        </div>
      </div>  
    </div>
  </header>

  <!-- Navegación mejorada -->
  <nav class="bg-gradient-to-r from-lib-yellow to-yellow-300 shadow-lg relative ">

    <div class="absolute inset-0 pattern-dots opacity-30"></div>
    <div class="container mx-auto px-4 py-3 relative z-10">
      
      <div class="flex flex-wrap justify-center gap-2 text-sm">
        
        <a href="../pages/index.php" data-category="all" class="category-link bg-lib-blue text-white px-6 py-2 rounded-full hover:bg-blue-600 font-medium transition-all duration-300 hover:scale-105 shadow-lg">
          🏠 Inicio
        </a>
        <a data-category="libreria" class="category-link bg-white/80 px-6 py-2 hover:bg-white hover:text-lib-blue rounded-full transition-all duration-300 hover:scale-105 shadow-md">
          📚 Librería
        </a>
        <a data-category="papeleria" class="category-link bg-white/80 px-6 py-2 hover:bg-white hover:text-lib-blue rounded-full transition-all duration-300 hover:scale-105 shadow-md">
          ✏️ Papelería
        </a>
        <a data-category="oficina" class="category-link bg-white/80 px-6 py-2 hover:bg-white hover:text-lib-blue rounded-full transition-all duration-300 hover:scale-105 shadow-md">
          💼 Oficina
        </a>
        <a id="contacto-link" class="bg-white/80 px-6 py-2 hover:bg-white hover:text-lib-blue rounded-full transition-all duration-300 hover:scale-105 shadow-md">
          📞 Contacto
        </a>
      </div>
    </div>
  </nav>

  <!-- Banner Principal mejorado -->
  <section class="mt-6 container mx-auto px-4">
    <div class="relative h-80 rounded-3xl overflow-hidden shadow-2xl book-shadow">
      <!-- Slides Container -->
      <div id="slides-container" class="flex h-full transition-transform duration-700 ease-in-out">
        <!-- Slide 1 -->
        <div class="min-w-full h-full relative">
          <div class="bg-gradient-to-br from-lib-blue via-purple-600 to-lib-red h-full flex items-center justify-center text-center relative overflow-hidden">
            <!-- Elementos decorativos animados -->
            <div class="absolute top-10 left-10 w-20 h-20 border-4 border-white/30 rounded-full animate-bounce-slow"></div>
            <div class="absolute bottom-10 right-10 w-16 h-16 bg-lib-yellow/30 rounded-full animate-float"></div>
            <div class="absolute top-1/2 left-5 w-8 h-8 bg-white/20 transform rotate-45 animate-pulse"></div>
            
            <div class="relative z-10 px-4 text-white">
              <h2 class="text-5xl font-bold mb-4 animate-pulse">
                Bienvenido a <span class="gradient-text">Mundo Librería</span>
              </h2>
              <p class="text-xl mb-8 opacity-90">Donde cada página es una nueva aventura</p>
              <button class="bg-lib-yellow text-lib-blue px-8 py-4 rounded-full font-bold hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50">
                Explorar Ahora ✨
              </button>
            </div>
          </div>
        </div>

        <!-- Slide 2 -->
        <div class="min-w-full h-full relative">
          <div class="bg-gradient-to-tr from-lib-red via-pink-500 to-lib-yellow h-full flex items-center justify-center text-center relative overflow-hidden">
            <!-- Elementos decorativos -->
            <div class="absolute inset-0 opacity-20">
              <div class="absolute top-0 left-1/4 w-32 h-32 border-2 border-white rounded-lg transform rotate-12 animate-float"></div>
              <div class="absolute bottom-0 right-1/4 w-24 h-24 bg-white/20 rounded-full animate-bounce-slow"></div>
            </div>
            
            <div class="relative z-10 text-white px-4">
              <h2 class="text-5xl font-bold mb-4">Ofertas <span class="text-lib-yellow animate-pulse">Increíbles</span></h2>
              <p class="text-xl mb-8">Hasta 50% de descuento en libros seleccionados</p>
              <div class="flex justify-center items-center space-x-4">
                <button class="bg-white text-lib-red px-8 py-4 rounded-full font-bold hover:scale-110 transition-all duration-300 shadow-2xl">
                  Ver Ofertas 🔥
                </button>
                <div class="text-6xl animate-bounce-slow">📚</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Slide 3 -->
        <div class="min-w-full h-full relative">
          <div class="bg-gradient-to-bl from-green-400 via-lib-blue to-purple-600 h-full flex items-center justify-center text-center relative overflow-hidden">
            <!-- Elementos decorativos -->
            <div class="absolute inset-0 opacity-20">
              <div class="absolute top-10 right-10 text-8xl animate-float">📖</div>
              <div class="absolute bottom-10 left-10 text-6xl animate-pulse">✨</div>
              <div class="absolute top-1/2 right-1/4 w-16 h-16 border-4 border-white/30 rounded-full animate-bounce-slow"></div>
            </div>
            
            <div class="relative z-10 text-white px-4">
              <h2 class="text-5xl font-bold mb-4">Nueva <span class="text-lib-yellow animate-pulse">Colección</span></h2>
              <p class="text-xl mb-8">Descubre los lanzamientos más esperados</p>
              <button class="bg-lib-yellow text-lib-blue px-8 py-4 rounded-full font-bold hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50">
                Descubrir 🚀
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Controles mejorados -->
      <button id="prev-slide" class="absolute left-4 top-1/2 -translate-y-1/2 glass-effect text-white p-3 rounded-full hover:bg-white/30 z-20 transition-all duration-300 hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button id="next-slide" class="absolute right-4 top-1/2 -translate-y-1/2 glass-effect text-white p-3 rounded-full hover:bg-white/30 z-20 transition-all duration-300 hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Indicadores mejorados -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        <button class="slide-indicator w-4 h-4 rounded-full bg-white/50 hover:bg-white transition-all duration-300 hover:scale-125"></button>
        <button class="slide-indicator w-4 h-4 rounded-full bg-white/50 hover:bg-white transition-all duration-300 hover:scale-125"></button>
        <button class="slide-indicator w-4 h-4 rounded-full bg-white/50 hover:bg-white transition-all duration-300 hover:scale-125"></button>
      </div>
    </div>
  </section>

  <!-- Sección de productos mejorada -->
  <main class="mt-16 container mx-auto px-4">
    <!-- Header de productos -->
    <div class="text-center mb-12">
      <div class="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg book-shadow mb-4">
        <span class="text-3xl mr-3">📚</span>
        <h2 class="text-4xl font-bold gradient-text">Nuestros Productos</h2>
        <span class="text-3xl ml-3">✨</span>
      </div>
      <p class="text-gray-600 text-lg">Descubre una selección cuidadosamente elegida para ti</p>
    </div>

    <!-- Grid de productos -->
    
      <div id="productos-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <!-- Productos se cargarán aquí -->
      </div>
    
  </main>

  <!-- Footer mejorado -->
  <footer class="bg-gradient-to-r from-lib-blue to-blue-800 text-white mt-20 py-12 relative overflow-hidden">
    <!-- Elementos decorativos -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 right-0 w-64 h-64 bg-lib-yellow rounded-full translate-x-32 -translate-y-32 animate-pulse-slow"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-lib-red rounded-full -translate-x-24 translate-y-24 animate-float"></div>
    </div>
    
    <div class="container mx-auto px-4 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <!-- Logo y descripción -->
        <div class="md:col-span-2">
          <div class="flex items-center mb-4">
            <div class="bg-white p-2 rounded-full shadow-lg mr-3">
              <img src="../assets/MUNDO-WEB.ico" alt="Logo" class="h-8 w-8">
            </div>
            <h3 class="font-bold text-2xl">Mundo Librería</h3>
          </div>
         
          <div class="flex space-x-3">
            <a href="#" class="bg-white/20 text-white p-3 rounded-full hover:bg-lib-yellow hover:text-lib-blue transition-all duration-300 hover:scale-110">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" class="bg-white/20 text-white p-3 rounded-full hover:bg-lib-yellow hover:text-lib-blue transition-all duration-300 hover:scale-110">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
            </a>
            <a href="#" class="bg-white/20 text-white p-3 rounded-full hover:bg-lib-yellow hover:text-lib-blue transition-all duration-300 hover:scale-110">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.747 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/></svg>
            </a>
          </div>
        </div>
        
        <!-- Horarios -->
        <div>
          <h3 class="font-bold text-lg mb-4 flex items-center">
            <span class="text-lib-yellow mr-2">🕒</span> Horarios
          </h3>
          <div class="space-y-2 text-blue-100">
            <p class="flex justify-between">
              <span>Lunes - Viernes</span>
              <span class="font-semibold">9:00 - 20:00</span>
            </p>
            <p class="flex justify-between">
              <span>Sábados</span>
              <span class="font-semibold">10:00 - 18:00</span>
            </p>
            <p class="flex justify-between">
              <span>Domingos</span>
              <span class="font-semibold text-lib-yellow">Cerrado</span>
            </p>
          </div>
        </div>
        
        <!-- Contacto -->
        <div>
          <h3 class="font-bold text-lg mb-4 flex items-center">
            <span class="text-lib-yellow mr-2">📍</span> Ubicación
          </h3>
          <div class="space-y-3 text-blue-100">
            <p class="flex items-start">
              <span class="mr-2">📧</span>
              <span>info@mundolibreria.com</span>
            </p>
            <p class="flex items-start">
              <span class="mr-2">📞</span>
              <span>+56 9 1234 5678</span>
            </p>
            <p class="flex items-start">
              <span class="mr-2">🏪</span>
              <span>Graneros, O'Higgins</span>
            </p>
          </div>
        </div>
      </div>
      
      <!-- Copyright -->
      <div class="border-t border-blue-300/30 pt-8 text-center">
        <p class="text-blue-100">© 2025 Mundo Librería. Todos los derechos reservados. Hecho con ❤️ para los amantes de los libros.</p>
      </div>
    </div>
  </footer>

  <!-- Scripts -->
  <script src="../js/carousel.js"></script>
  <script src="../js/components.js"></script>
  <script src="../js/cargarProductosUser.js"></script>
  <script src="../js/contacto.js"></script>

  <script>
    // Animaciones adicionales cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
      // Efecto de aparición gradual en los elementos
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, observerOptions);

      // Aplicar animación a elementos principales
      document.querySelectorAll('main, footer').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'all 0.8s ease-out';
        observer.observe(el);
      });
    });
  </script>
</body>

</html>