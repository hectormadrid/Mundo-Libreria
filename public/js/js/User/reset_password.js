document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('reset-password-form');
    const messageContainer = document.getElementById('message-container-reset');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(form);
            const submitButton = form.querySelector('button[type="submit"]');

            // Validar que las contraseñas coinciden
            if (formData.get('password') !== formData.get('password_confirm')) {
                messageContainer.classList.remove('hidden');
                messageContainer.className = 'p-4 text-center rounded-lg bg-red-100 text-red-800';
                messageContainer.innerHTML = 'Las contraseñas no coinciden.';
                return;
            }

            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            
            messageContainer.innerHTML = '';
            messageContainer.classList.add('hidden');

            fetch('logic/update_password.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                messageContainer.classList.remove('hidden');
                
                if (data.success) {
                    messageContainer.className = 'p-4 text-center rounded-lg bg-green-100 text-green-800';
                    messageContainer.innerHTML = data.message + 
                        '<div class="mt-4"><a href="login.php" class="font-bold text-blue-600 hover:underline">Ir a Iniciar Sesión</a></div>';
                    form.classList.add('hidden');
                } else {
                    messageContainer.className = 'p-4 text-center rounded-lg bg-red-100 text-red-800';
                    messageContainer.innerHTML = data.error;
                }
            })
            .catch(error => {
                messageContainer.classList.remove('hidden');
                messageContainer.className = 'p-4 text-center rounded-lg bg-red-100 text-red-800';
                messageContainer.innerHTML = 'Ocurrió un error de red. Por favor, inténtalo de nuevo.';
                console.error('Fetch Error:', error);
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Guardar Nueva Contraseña';
            });
        });
    }
});
