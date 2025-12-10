document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('forgot-password-form');
    const messageContainer = document.getElementById('message-container');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(form);
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
                
                // Construir el HTML dinámicamente en el frontend
                const successHtml = `
                    <strong>¡Enlace generado!</strong><br>
                    <p class='mt-2 text-sm'>En una aplicación real, este enlace se enviaría a tu correo.</p>
                    <p class='mt-4 text-xs'>Para continuar, por favor, haz clic en el siguiente enlace:</p>
                    <div class='mt-2'>
                        <a href='${data.reset_link}' class='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>Restablecer Contraseña</a>
                    </div>
                `;
                messageContainer.innerHTML = successHtml;
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
