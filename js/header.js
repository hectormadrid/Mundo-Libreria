const loadHeader = () => {
  return `
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
              class="px-4 py-2 rounded-l-full text-sm focus:outline-none text-gray-800 w-48 md:w-64"
            >
            <button class="bg-lib-red px-4 py-1.5 rounded-r-full hover:bg-red-700 transition">
              🔍
            </button>
          </div>
          
          
    </header>

   <nav class="bg-lib-yellow border-b border-lib-blue">
  <div class="container mx-auto px-4 py-2">
    <div class="flex flex-wrap justify-center gap-4 text-sm">
      <!-- Inicio -->
      <a href="../pages/index.html" class="px-3 py-1 rounded-full hover:bg-blue-50  text-lib-blue font-medium">Inicio</a>
      
      <!-- Catálogo con dropdown -->
      <div class="relative group" x-data="{ open: false }" @mouseenter="open = true" @mouseleave="open = false">
        <button class="px-3 py-1 hover:bg-white hover:text-lib-blue rounded-full transition flex items-center gap-1">
          Catálogo
          <svg class="w-4 h-4 transition-transform transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
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
  `;
};
