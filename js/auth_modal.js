// Abrir modal
function openAuthModal(tab = 'login') {
  const modal = document.getElementById('authModal');
  modal.classList.remove('hidden');
  switchAuthTab(tab);
}

// Cerrar modal (hacer clic fuera del contenido)
document.getElementById('authModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('authModal')) {
    closeAuthModal();
  }
});

// Cambiar entre pestañas
function switchAuthTab(tab) {
  document.getElementById('loginContent').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerContent').classList.toggle('hidden', tab !== 'register');
  
  document.getElementById('loginTab').classList.toggle('text-gray-500', tab !== 'login');
  document.getElementById('loginTab').classList.toggle('text-lib-blue', tab === 'login');
  document.getElementById('loginTab').classList.toggle('border-lib-yellow', tab === 'login');
  
  document.getElementById('registerTab').classList.toggle('text-gray-500', tab !== 'register');
  document.getElementById('registerTab').classList.toggle('text-lib-blue', tab === 'register');
  document.getElementById('registerTab').classList.toggle('border-lib-yellow', tab === 'register');
}

// Cerrar modal
function closeAuthModal() {
  document.getElementById('authModal').classList.add('hidden');
}