const formatPrice = (price) => {
  return (
    "$" +
    parseFloat(price)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  );
};

// Función para generar el HTML de cada producto
const createProductCard = (producto) => {
  return `
    <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <a href="producto_detalle.php?id=${producto.id}" class="block">
            <div class="relative overflow-hidden">
                <div class="aspect-[4/5] flex items-center justify-center">
                    <img src="${producto.imagen_url}"
                        alt="${producto.nombre}"
                        class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy">
                </div>
            </div>
        </a>
        <div class="p-4 border-t border-gray-100">
            <div class="mb-3">
                <h3 class="font-bold text-gray-900 line-clamp-1">
                    <a href="producto_detalle.php?id=${producto.id}" class="hover:text-lib-blue">${producto.nombre}</a>
                </h3>
                <p class="text-gray-600 text-sm mt-1 line-clamp-2">${
                  producto.descripcion || ""
                }</p>
            </div>

            <div class="flex items-center mb-3">
                <div class="flex text-amber-400">
                    ${'<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>'.repeat(
                      4
                    )}
                    <svg class="w-4 h-4 fill-current text-gray-300" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div> 
            </div>

            <div class="flex items-center justify-between">
                <div>
                    <p class="text-lg font-bold text-lib-blue">${formatPrice(
                      producto.precio
                    )}</p>
                    <p class="text-lg font-bold text-lib-blue">Disponibles: ${
                      producto.stock
                    } Unidades</p>
                </div>
                <button data-id-producto="${
                  producto.id
                }" class="agregar-carrito-btn bg-lib-yellow hover:bg-yellow-500 text-lib-blue px-3 py-2 rounded-lg font-medium flex items-center gap-1 transition-colors shadow-sm hover:shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span class="text-sm">Agregar</span>
                </button>
            </div>
        </div>
    </div>
    `;
};
const attachEventListeners = () => {
    document.querySelectorAll('.agregar-carrito-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const id_producto = e.currentTarget.getAttribute('data-id-producto');
            const originalText = button.innerHTML;
            
            // Loading state
            button.innerHTML = '<span class="loading">Agregando...</span>';
            button.disabled = true;

            try {
                const response = await fetch('agregar_al_carrito.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id_producto })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Feedback visual en el botón
                    button.innerHTML = '✅ <span class="text-xs">¡Listo!</span>';
                    button.classList.remove('bg-lib-yellow');
                    button.classList.add('bg-green-500', 'text-white');
                    
                    // Mostrar notificación flotante personalizada
                    showNotification('Producto añadido correctamente', 'success');
                    
                    // Abrir el drawer para mostrar el carrito actualizado
                    if (typeof openCartDrawer === 'function') {
                        openCartDrawer();
                    }
                    
                    // Revertir el botón después de un momento
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.classList.remove('bg-green-500', 'text-white');
                        button.classList.add('bg-lib-yellow');
                        button.disabled = false;
                    }, 2000);
                    
                } else {
                    let errorMsg = 'Error al agregar producto';
                    if (result.error) errorMsg = result.error;
                    
                    showNotification(errorMsg, 'error');
                    
                    if (response.status === 401) {
                        setTimeout(() => {
                            window.location.href = 'login.php';
                        }, 1500);
                    }
                    button.innerHTML = originalText;
                    button.disabled = false;
                }
            } catch (error) {
                console.error('Error de red:', error);
                showNotification('Error de conexión', 'error');
                button.innerHTML = originalText;
                button.disabled = false;
            }
        });
    });
};

// Función de notificación mejorada
function showNotification(message, type = "success") {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notification-text');
    
    if (!notification || !text) return;
    
    text.textContent = message;
    
    // Cambiar color según tipo
    notification.classList.remove('bg-green-500', 'bg-red-500', 'bg-yellow-500');
    if (type === 'success') notification.classList.add('bg-green-500');
    else if (type === 'error') notification.classList.add('bg-red-500');
    else notification.classList.add('bg-yellow-500');
    
    // Mostrar
    notification.classList.remove('opacity-0', 'translate-x-full');
    notification.classList.add('opacity-100', 'translate-x-0');
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.add('opacity-0', 'translate-x-full');
        notification.classList.remove('opacity-100', 'translate-x-0');
    }, 3000);
}

// Función para obtener el conteo inicial al cargar la página
const loadCartCount = async () => {
  try {
    const response = await fetch("contador_carrito.php");
    const result = await response.json();

    if (result.success) {
      updateCartCount(result.cartCount);
    }
  } catch (error) {
    console.error("Error al cargar contador del carrito:", error);
  }
};

// Variables de estado para los filtros
let activeCategory = "";
let activeFamily = "";

// Función Debounce
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

// Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    // Resaltar Inicio por defecto
    const inicioLink = document.querySelector('.category-link[data-category="all"]');
    if (inicioLink) inicioLink.classList.add('active-filter');

    loadProducts(); // Carga inicial de productos
    loadCartCount(); // Carga inicial del contador del carrito

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    const performSearch = () => {
        const searchTerm = searchInput.value.trim();
        // Al buscar, limpiamos los filtros de categoría y familia para buscar en todo el catálogo
        activeCategory = "";
        activeFamily = "";
        document.querySelectorAll('.category-link, .family-link').forEach(l => l.classList.remove('active-filter'));
        // Ocultar filtros de familia si estaban visibles
        document.getElementById('familia-filters-container').classList.add('hidden');

        loadProducts("", "", searchTerm);
    };

    // Búsqueda en tiempo real con debounce
    const debouncedSearch = debounce(performSearch, 500);
    searchInput.addEventListener('input', (e) => {
        if (e.target.value.trim() === "") {
            // Si borra todo, volvemos al inicio
            activeCategory = "";
            activeFamily = "";
            const startLink = document.querySelector('.category-link[data-category="all"]');
            if(startLink) startLink.classList.add('active-filter');
            loadProducts();
        } else {
            debouncedSearch();
        }
    });

    // Búsqueda al hacer clic en el botón
    searchButton?.addEventListener('click', performSearch);

    // Búsqueda al presionar Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Manejador para los links de categoría
    document.querySelectorAll(".category-link").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const categoryName = link.getAttribute("data-category");
            
            // Limpiar búsqueda
            searchInput.value = "";
            
            // Actualizar estado
            activeCategory = categoryName === "all" ? "" : categoryName;
            activeFamily = ""; // Resetear familia al cambiar de categoría

            // Resaltar categoría activa
            document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active-filter'));
            link.classList.add('active-filter');

            // Cargar productos y luego actualizar filtros de familia
            loadProducts(activeCategory, activeFamily);
            updateFamilyFilters(activeCategory);
        });
    });

    // Manejador para los links de familia (usando delegación de eventos)
    document.getElementById('familia-filters-container').addEventListener('click', function(e) {
        if (e.target.classList.contains('family-link')) {
            e.preventDefault();
            const familyId = e.target.getAttribute('data-family');
            
            // Limpiar búsqueda
            searchInput.value = "";

            activeFamily = familyId === 'all' ? '' : familyId;

            // Resaltar familia activa
            document.querySelectorAll('.family-link').forEach(l => l.classList.remove('active-filter'));
            e.target.classList.add('active-filter');

            loadProducts(activeCategory, activeFamily);
        }
    });
});

// NUEVA: Función para actualizar los filtros de familia
const updateFamilyFilters = async (categoryName) => {
    const container = document.getElementById('familia-filters-container');
    if (!categoryName) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    try {
        const response = await fetch(`obtener_familias_por_categoria.php?categoria_nombre=${categoryName}`);
        const familias = await response.json();

        if (familias.length > 0) {
            let filtersHtml = `
                <a href="#" data-family="all" class="family-link active-filter bg-white/80 text-gray-700 font-semibold px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 shadow-md">
                    Todos
                </a>
            `;
            familias.forEach(familia => {
                const urlFamilia = `obtener_prductos_user.php?familia_id=${familia.id}`;
                filtersHtml += `
                    <a href="#" data-family="${familia.id}" class="family-link bg-white/80 text-gray-700 font-semibold px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 shadow-md">
                        ${familia.nombre}
                    </a>
                `;
            });
            container.innerHTML = `<div class="flex flex-wrap justify-center gap-3 text-sm">${filtersHtml}</div>`;
            container.classList.remove('hidden');
        } else {
            container.innerHTML = '';
            container.classList.add('hidden');
        }
    } catch (error) {
        console.error("Error al cargar familias:", error);
        container.innerHTML = '';
        container.classList.add('hidden');
    }
};

// Función para mostrar skeletons de carga
const showSkeletons = () => {
    const container = document.getElementById("productos-container");
    container.innerHTML = "";
    for (let i = 0; i < 10; i++) {
        container.innerHTML += `
            <div class="skeleton-card skeleton overflow-hidden shadow-sm"></div>
        `;
    }
};

// Función principal para cargar productos (MODIFICADA)
const loadProducts = async (categoria = "", familiaId = "", searchTerm = "") => {
  console.log(`Cargando: Categoria='${categoria}', Familia='${familiaId}', Busqueda='${searchTerm}'`);
  const container = document.getElementById("productos-container");
  
  // Mostrar skeletons antes de la petición
  showSkeletons();

  try {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (familiaId) params.append('familia_id', familiaId);
    if (searchTerm) params.append('search', searchTerm);

    const url = `obtener_prductos_user.php?${params.toString()}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok)
      throw new Error(data.error || "Error al cargar productos");

    if (data.success && data.data.length > 0) {
      container.innerHTML = data.data.map((producto, index) => {
          // Añadimos una clase de fade-in con un pequeño retraso escalonado
          const cardHtml = createProductCard(producto);
          return `<div class="product-fade-in" style="animation-delay: ${index * 50}ms">${cardHtml}</div>`;
      }).join("");
      attachEventListeners();
    } else {
      // Estado vacío mejorado
      container.innerHTML = `
                <div class="col-span-full text-center py-20 flex flex-col items-center justify-center animate-fade-in">
                    <div class="text-6xl mb-6">🔍</div>
                    <h3 class="text-2xl font-bold text-gray-700 mb-2">No encontramos lo que buscas</h3>
                    <p class="text-gray-500 mb-8 max-w-md mx-auto">Prueba ajustando tus términos de búsqueda o seleccionando una categoría diferente.</p>
                    <button id="clear-filters-btn" class="bg-lib-blue text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg">
                        Ver todos los productos
                    </button>
                </div>
            `;
      
      document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
          const searchInput = document.getElementById('search-input');
          if(searchInput) searchInput.value = "";
          activeCategory = "";
          activeFamily = "";
          document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active-filter'));
          const startLink = document.querySelector('.category-link[data-category="all"]');
          if(startLink) startLink.classList.add('active-filter');
          document.getElementById('familia-filters-container').classList.add('hidden');
          loadProducts();
      });
    }
  } catch (error) {
    console.error("Error:", error);
    container.innerHTML = `
            <div class="col-span-full text-center py-10">
                <div class="text-5xl mb-4">⚠️</div>
                <p class="text-red-500 font-bold">Error al cargar productos</p>
                <button onclick="location.reload()" class="mt-4 text-lib-blue underline">Reintentar</button>
            </div>
        `;
  }
};
