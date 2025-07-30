document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const btnAgregar = document.getElementById('btnAgregarProducto');
    const btnCancelar = document.getElementById('btnCancelar');
    const formProducto = document.getElementById('formAgregarProducto');
    const modal = document.getElementById('modalAgregar');
    const fileInput = document.querySelector('input[name="imagen"]');
    const submitBtn = formProducto.querySelector('button[type="submit"]');

    // Verificar elementos
    if (!btnAgregar || !btnCancelar || !formProducto || !modal || !fileInput) {
        console.error('Error: Elementos del formulario no encontrados');
        return;
    }

    // Abrir modal
    btnAgregar.addEventListener('click', () => modal.classList.remove('hidden'));

    // Cerrar modal
    btnCancelar.addEventListener('click', () => {
        modal.classList.add('hidden');
        formProducto.reset();
    });

    // Validar imagen antes de enviar
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            const maxSize = 2 * 1024 * 1024; // 2MB
            
            if (!validTypes.includes(file.type)) {
                alert('Formato no válido. Use JPG, PNG o WEBP');
                this.value = '';
            } else if (file.size > maxSize) {
                alert('La imagen es demasiado grande (Máx. 2MB)');
                this.value = '';
            }
        }
    });

    // Enviar formulario
    formProducto.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validación adicional
        const estado = document.querySelector('select[name="estado"]').value;
        if (!['Activo', 'Inactivo'].includes(estado)) {
            alert('Selecciona un estado válido');
            return;
        }

        // Deshabilitar botón durante el envío
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Enviando... <i class="bx bx-loader-alt animate-spin"></i>';

        try {
            const formData = new FormData(this);
            
            const response = await fetch('agregar_productos.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Error en el servidor');

            if (data.success) {
                alert('Producto agregado correctamente');
                $('#productosTable').DataTable().ajax.reload();
                modal.classList.add('hidden');
                formProducto.reset();
            } else {
                throw new Error(data.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Guardar';
        }
    });
});