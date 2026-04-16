$(document).ready(function () {
    const table = $('#pedidosTable').DataTable({
        responsive: true,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
        },
        dom: 'Bfrtip',
        buttons: [
            { extend: 'copy', text: '📋 Copiar' },
            { extend: 'excel', text: '📊 Excel' },
            { extend: 'pdf', text: '📄 PDF' },
            { extend: 'print', text: '🖨️ Imprimir' }
        ],
        pageLength: 10,
        order: [[6, 'desc']] // Ajustado al nuevo índice de la fecha
    });

    // Cambiar estado del pedido
    $(document).on('change', '.status-select', async function() {
        const select = $(this);
        const idPedido = select.data('id');
        const nuevoEstado = select.val();
        const csrfToken = document.body.dataset.csrf;

        // Deshabilitar temporalmente
        select.prop('disabled', true);

        try {
            const response = await fetch('actualizar_estado_pedido.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: idPedido,
                    estado: nuevoEstado,
                    csrf_token: csrfToken
                })
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: data.message,
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                throw new Error(data.error || 'Error al actualizar');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            });
            // Revertir cambio visual (recargando o guardando estado anterior)
            location.reload(); 
        } finally {
            select.prop('disabled', false);
        }
    });
});