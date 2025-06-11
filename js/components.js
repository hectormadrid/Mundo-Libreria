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
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
    headerPlaceholder.innerHTML = loadHeader();
    
    // Agregar event listeners después de cargar el header
    setTimeout(() => {
      // Event listener para el botón de iniciar sesión
      const loginBtn = document.querySelector('button[class*="bg-lib-yellow"]');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          // Aquí puedes agregar la lógica para iniciar sesión
          alert('Función de iniciar sesión - Por implementar');
          // window.location.href = '../pages/login.html';
        });
      }
      
      // Event listener para el botón del carrito
      const cartBtn = document.querySelector('button[class*="bg-lib-red"]:last-of-type');
      if (cartBtn) {
        cartBtn.addEventListener('click', () => {
          // Aquí puedes agregar la lógica del carrito
          alert('Carrito de compras - Por implementar');
          // window.location.href = '../pages/cart.html';
        });
      }
    }, 100);
  }

  // Insertar Footer
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = loadFooter();
  }
});
