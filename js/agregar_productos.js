// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // 1. Elementos del DOM
    const btnAgregar = document.getElementById('btnAgregarProducto');
    const btnCancelar = document.getElementById('btnCancelar');
    const formProducto = document.getElementById('formAgregarProducto');
    const modal = document.getElementById('modalAgregar');

    // 2. Verificar que todos los elementos existan
    if (!btnAgregar || !btnCancelar || !formProducto || !modal) {
        console.error('Error: Uno o más elementos no se encontraron en el DOM');
        return;
    }

    // 3. Manejador para abrir modal
    btnAgregar.addEventListener('click', function() {
        modal.classList.remove('hidden');
    });

    // 4. Manejador para cerrar modal
    btnCancelar.addEventListener('click', function() {
        modal.classList.add('hidden');
        formProducto.reset(); // Limpiar el formulario al cancelar
    });

    // 5. Manejador para enviar formulario
    formProducto.addEventListener('submit', function(e) {
        e.preventDefault(); // Solo debe aparecer una vez
        
        const estado = document.querySelector('select[name="estado"]').value;
        
        // Validación del estado
        if (!['Activo', 'Inactivo'].includes(estado)) {
            alert('Selecciona un estado válido');
            return;
        }

        const formData = new FormData(this);

        fetch('../pages/agregar_productos.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Producto agregado correctamente');
                $('#productosTable').DataTable().ajax.reload();
                modal.classList.add('hidden');
                formProducto.reset();
            } else {
                alert('Error: ' + (data.error || 'Error desconocido'));
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
            alert('Ocurrió un error al enviar el formulario');
        });
    });
});