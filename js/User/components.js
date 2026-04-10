// ===== FUNCIONES DEL CARRITO =====

// Actualizar el contador del carrito con animación de rebote
const updateCartCount = (count) => {
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = count;
    // Animación de rebote
    cartCountElement.classList.add('scale-125', 'bg-yellow-400');
    setTimeout(() => {
      cartCountElement.classList.remove('scale-125', 'bg-yellow-400');
    }, 300);
  }
};

// Formatear precio chileno
const formatCLP = (number) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(number);
};

// Abrir el Drawer del Carrito
const openCartDrawer = async () => {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    const content = document.getElementById('cart-content');
    
    drawer.classList.remove('invisible');
    setTimeout(() => {
        overlay.classList.add('opacity-100');
        content.classList.remove('translate-x-full');
    }, 10);
    
    await refreshCartDrawer();
};

// Cerrar el Drawer del Carrito
const closeCartDrawer = () => {
    const overlay = document.getElementById('cart-overlay');
    const content = document.getElementById('cart-content');
    const drawer = document.getElementById('cart-drawer');
    
    overlay.classList.remove('opacity-100');
    content.classList.add('translate-x-full');
    
    setTimeout(() => {
        drawer.classList.add('invisible');
    }, 300);
};

// Refrescar el contenido del Drawer
const refreshCartDrawer = async () => {
    const itemsContainer = document.getElementById('cart-drawer-items');
    const footer = document.getElementById('cart-drawer-footer');
    const subtotalElement = document.getElementById('cart-drawer-subtotal');
    
    try {
        const response = await fetch('obtener_carrito_json.php');
        const data = await response.json();
        
        if (data.success && data.items.length > 0) {
            itemsContainer.innerHTML = data.items.map(item => `
                <div class="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                    <img src="${item.imagen}" alt="${item.nombre}" class="w-16 h-16 object-contain bg-white rounded-lg p-1">
                    <div class="flex-1">
                        <h4 class="text-sm font-bold text-gray-800 line-clamp-1">${item.nombre}</h4>
                        <div class="flex justify-between items-center mt-1">
                            <span class="text-xs text-gray-500">${item.cantidad} x ${formatCLP(item.precio)}</span>
                            <span class="text-sm font-bold text-lib-blue">${formatCLP(item.subtotal)}</span>
                        </div>
                    </div>
                </div>
            `).join('');
            
            subtotalElement.textContent = formatCLP(data.total);
            footer.classList.remove('hidden');
            updateCartCount(data.cartCount);
        } else {
            itemsContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                    <svg class="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 11-8 0m-4 8a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z" />
                    </svg>
                    <p class="font-medium">Tu carrito está vacío</p>
                    <button onclick="closeCartDrawer()" class="mt-4 text-lib-blue text-sm hover:underline">Continuar comprando</button>
                </div>
            `;
            footer.classList.add('hidden');
            updateCartCount(0);
        }
    } catch (error) {
        console.error("Error al refrescar carrito:", error);
    }
};

// Configurar eventos del DOM
document.addEventListener('DOMContentLoaded', () => {
    // Eventos para abrir/cerrar carrito
    const cartToggle = document.querySelector('a[href="Carrito.php"]');
    if (cartToggle) {
        cartToggle.addEventListener('click', (e) => {
            // En móvil o si prefiere la página completa, dejamos que navegue
            // Pero en desktop es mejor el drawer
            if (window.innerWidth > 768) {
                e.preventDefault();
                openCartDrawer();
            }
        });
    }
    
    document.getElementById('close-cart')?.addEventListener('click', closeCartDrawer);
    document.getElementById('cart-overlay')?.addEventListener('click', closeCartDrawer);
    
    // Escuchar tecla ESC para cerrar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCartDrawer();
    });
});
