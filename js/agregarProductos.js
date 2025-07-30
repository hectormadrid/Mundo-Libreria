document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const btnAgregar = document.getElementById('btnAgregarProducto');
    const btnCancelar = document.getElementById('btnCancelar');
    const formProducto = document.getElementById('formAgregarProducto');
    const modal = document.getElementById('modalAgregar');
    const fileInput = document.querySelector('input[name="imagen"]');
    const submitBtn = formProducto.querySelector('button[type="submit"]');

    if (!btnAgregar || !btnCancelar || !formProducto || !modal || !fileInput) {
        console.error('Error: Elementos del formulario no encontrados');
        return;
    }

    btnAgregar.addEventListener('click', () => modal.classList.remove('hidden'));

    btnCancelar.addEventListener('click', () => {
        modal.classList.add('hidden');
        formProducto.reset();
    });

    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            const maxSize = 2 * 1024 * 1024;

            if (!validTypes.includes(file.type)) {
                alert('Formato no válido. Use JPG, PNG o WEBP');
                this.value = '';
            } else if (file.size > maxSize) {
                alert('La imagen es demasiado grande (Máx. 2MB)');
                this.value = '';
            }
        }
    });

    formProducto.addEventListener('submit', async function(e) {
        e.preventDefault();

        const requiredFields = formProducto.querySelectorAll('input[required], textarea[required], select[required]');
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Campo requerido',
                    text: `Por favor completa el campo: ${field.name}`,
                    confirmButtonColor: '#d33'
                });
                field.focus();
                return;
            }
        }

        const estado = document.querySelector('select[name="estado"]').value;
        if (!['Activo', 'Inactivo'].includes(estado)) {
            await Swal.fire({
                icon: 'warning',
                title: 'Estado inválido',
                text: 'Selecciona un estado válido',
                confirmButtonColor: '#d33'
            });
            return;
        }

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
                await Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Producto agregado correctamente',
                    confirmButtonColor: '#3085d6'
                });
                $('#productosTable').DataTable().ajax.reload();
                modal.classList.add('hidden');
                formProducto.reset();
            } else {
                throw new Error(data.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Complete todos los campos correctamente',
                confirmButtonColor: '#d33'
            });
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Guardar';
        }
    });
});
