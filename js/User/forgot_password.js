document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('forgot-password-form');
    const messageContainer = document.getElementById('message-container');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        
        // Asegurarnos de que el token esté presente (depuración)
        if (!formData.has('csrf_token')) {
            const tokenInput = form.querySelector('input[name="csrf_token"]');
            if (tokenInput) formData.append('csrf_token', tokenInput.value);
        }

        const submitButton = form.querySelector('button[type="submit"]');

        // Deshabilitar botón y mostrar carga
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        // Limpiar mensajes anteriores
        messageContainer.innerHTML = '';
        messageContainer.classList.add('hidden');

        fetch('logic/request_reset.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            messageContainer.classList.remove('hidden');
            
            if (data.success) {
                messageContainer.className = 'p-4 text-center rounded-lg bg-green-100 text-green-800';
                messageContainer.innerHTML = `
                    <div class="flex flex-col items-center">
                        <i class="fas fa-check-circle text-3xl mb-2"></i>
                        <strong>¡Solicitud enviada!</strong>
                        <p class="mt-2 text-sm">${data.message}</p>
                    </div>
                `;
                form.classList.add('hidden'); // Ocultar formulario en caso de éxito
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
            // Rehabilitar botón
            submitButton.disabled = false;
            submitButton.innerHTML = 'Enviar Enlace de Recuperación';
        });
    });
});
