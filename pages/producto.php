<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link rel="icon" href="../assets/logo.ico">
  <title>Mundo Libreria</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <!-- Configuración personalizada de Tailwind -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'lib-red': '#E53E3E',    // Rojo vibrante
            'lib-yellow': '#F6E05E', // Amarillo claro
            'lib-blue': '#3182CE',    // Azul sólido
          }
        }
      }
    }
  </script>
</head>
<body class="bg-gray-50 text-gray-800 font-sans">
  
  <!-- Header se cargará aquí -->
  <div id="header-placeholder"></div>
  <!-- Productos Destacados -->
  <main class="mt-12 container mx-auto px-4">
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-3xl font-bold text-lib-blue">Productos</h2>
      <a href="#" class="text-lib-red hover:underline font-medium">Ver todos →</a>
    </div>
    
    <!-- Grid de Productos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      
      <!-- Producto 1 -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
        <div class="relative overflow-hidden">
          <div class="aspect-[4/5] bg-gray-100">
            <img src="../assets/lapices/lapiz-graficto-faber-castel.webp" 
                 alt="Lápiz Grafito Faber Castel" 
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          </div>
          <!-- Botón de favoritos -->
          <button class="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
            <svg class="w-4 h-4 text-gray-600 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        </div>
        
        <div class="p-5">
          <div class="mb-3">
            <h3 class="font-bold text-lg text-gray-900 mb-1 line-clamp-2">Lápiz Grafito HB</h3>
            <p class="text-gray-600 text-sm">Faber Castel</p>
          </div>
          
          <!-- Rating -->
          <div class="flex items-center mb-3">
            <div class="flex text-yellow-400">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            </div>
            <span class="text-gray-500 text-xs ml-2">(24)</span>
          </div>
          
          <!-- Precio y botón -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-bold text-lib-blue">$850</p>
            </div>
            <button class="bg-lib-yellow text-lib-blue px-4 py-2 rounded-full hover:bg-yellow-400 transition-colors font-medium flex items-center space-x-2 shadow-md hover:shadow-lg">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"></path>
              </svg>
              <span class="hidden sm:inline">Agregar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Producto 2 -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
        <div class="relative overflow-hidden">
          <div class="aspect-[4/5] bg-gray-100">
            <img src="../assets/lapices/lapiz-pasta-azul.webp" 
                 alt="Lápiz Pasta Azul" 
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          </div>
          <!-- Badge de oferta 
          <span class="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            OFERTA
          </span>-->
          <!-- Botón de favoritos -->
          <button class="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
            <svg class="w-4 h-4 text-gray-600 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        </div>
        
        <div class="p-5">
          <div class="mb-3">
            <h3 class="font-bold text-lg text-gray-900 mb-1">Lápiz Pasta Azul</h3>
            <p class="text-gray-600 text-sm">Marca Premium</p>
          </div>
          
          <!-- Rating -->
          <div class="flex items-center mb-3">
            <div class="flex text-yellow-400">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            </div>
            <span class="text-gray-500 text-xs ml-2">(18)</span>
          </div>
          
          <!-- Precio y botón -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-2xl font-bold text-lib-blue">$1.200</p>
            </div>
            <button class="bg-lib-yellow text-lib-blue px-4 py-2 rounded-full hover:bg-yellow-400 transition-colors font-medium flex items-center space-x-2 shadow-md hover:shadow-lg">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"></path>
              </svg>
              <span class="hidden sm:inline">Agregar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Puedes agregar más productos copiando la estructura anterior -->
      
    </div>
  </main>

  <!-- Footer se cargará aquí -->
  <div id="footer-placeholder"></div>

  <!-- Scripts -->
  <script src="../js/components.js"></script>
  <script src="../js/footer.js"></script>
  <script src="../js/header.js"></script>

</body>
</html>
