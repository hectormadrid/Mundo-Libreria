// ===== FUNCIONES DEL CARRITO =====
const updateCartCount = (count) => {
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = count;
  }
};

// ===== CARGAR COMPONENTES =====
document.addEventListener('DOMContentLoaded', () => {
  // Insertar Header
 

  // Insertar Footer
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = loadFooter();
  }
});
