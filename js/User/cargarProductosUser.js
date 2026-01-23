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
        <div class="relative overflow-hidden">
            <div class="aspect-[4/5] flex items-center justify-center">
                <img src="${producto.imagen_url}"
                    alt="${producto.nombre}"
                    class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    loading="lazy">
            </div>
        </div>

        <div class="p-4 border-t border-gray-100">
            <div class="mb-3">
                <h3 class="font-bold text-gray-900 line-clamp-1">${
                  producto.nombre
                }</h3>
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
                    showNotification('✅ Producto agregado al carrito', 'success');
                    
                    // Actualizar el contador del carrito flotante
                    updateCartCount(result.cartCount);
                    
                } else {
                    let errorMsg = 'Error al agregar producto';
                    if (result.error) errorMsg = result.error;
                    
                    showNotification(`❌ ${errorMsg}`, 'error');
                    
                    if (response.status === 401) {
                        showNotification('🔐 Inicia sesión para continuar', 'warning');
                        setTimeout(() => {
                            window.location.href = 'login.php';
                        }, 2000);
                    }
                }
            } catch (error) {
                console.error('Error de red:', error);
                showNotification('❌ Error de conexión', 'error');
            } finally {
                button.innerHTML = originalText;
                button.disabled = false;
            }
        });
    });
};

// Función de notificación con SweetAlert2
function showNotification(message, type = "info") {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: type,
    title: message,
  });
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
    loadProducts(); // Carga inicial de productos
    loadCartCount(); // Carga inicial del contador del carrito

    const searchInput = document.getElementById('search-input');
    
    const performSearch = () => {
        const searchTerm = searchInput.value;
        // Al buscar, limpiamos los filtros de categoría y familia para buscar en todo el catálogo
        activeCategory = "";
        activeFamily = "";
        document.querySelectorAll('.category-link, .family-link').forEach(l => l.classList.remove('active-filter'));
        // Ocultar filtros de familia si estaban visibles
        document.getElementById('familia-filters-container').classList.add('hidden');

        loadProducts("", "", searchTerm);
    };

    // Búsqueda en tiempo real con debounce
    const debouncedSearch = debounce(performSearch, 400);
    searchInput.addEventListener('input', debouncedSearch);

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

// Función principal para cargar productos (MODIFICADA)
const loadProducts = async (categoria = "", familiaId = "", searchTerm = "") => {
  console.log(`Cargando: Categoria='${categoria}', Familia='${familiaId}', Busqueda='${searchTerm}'`);
  const container = document.getElementById("productos-container");
  container.innerHTML = `<div class="col-span-full text-center py-10"><p class="text-500">Cargando productos...</p></div>`;

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
      container.innerHTML = data.data.map(createProductCard).join("");
      attachEventListeners();
    } else {
      container.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <p class="text-gray-500">No se encontraron productos con estos filtros.</p>
                </div>
            `;
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("productos-container").innerHTML = `
            <div class="col-span-full text-center py-10">
                <p class="text-red-500">Error al cargar productos. Por favor intenta más tarde.</p>
            </div>
        `;
  }
};
