class CategoriasManager {
    constructor() {
        this.dataTable = null;
        this.modal = document.getElementById('modalCategoria');
        this.form = document.getElementById('formCategoria');
        this.title = document.getElementById('modalCategoriaTitulo');
        this.idInput = document.getElementById('categoriaId');
        this.nameInput = document.getElementById('categoriaNombre');
        
        this.initDataTable();
        this.initEventListeners();
    }

    initDataTable() {
        this.dataTable = $('#categoriasTable').DataTable({
            ajax: {
                url: '/pages/Admin/obtener_categorias.php',
                dataSrc: 'data'
            },
            columns: [
                { data: 'id' },
                { data: 'nombre' },
                { data: 'fecha_creacion', render: data => data ? new Date(data).toLocaleDateString() : '' },
                {
                    data: 'id',
                    render: (data, type, row) => `
                        <button onclick="categoriasManager.openModal(true, ${data}, '${row.nombre}')" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Editar</button>
                        <button onclick="categoriasManager.deleteCategory(${data})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Eliminar</button>
                    `,
                    orderable: false
                }
            ],
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
            }
        });
    }

    initEventListeners() {
        document.getElementById('btnNuevaCategoria').addEventListener('click', () => this.openModal(false));
        document.getElementById('btnCancelarCategoria').addEventListener('click', () => this.closeModal());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    openModal(isEdit, id = null, name = '') {
        this.form.reset();
        if (isEdit) {
            this.title.textContent = 'Editar Categoría';
            this.idInput.value = id;
            this.nameInput.value = name;
        } else {
            this.title.textContent = 'Nueva Categoría';
            this.idInput.value = '';
        }
        this.modal.classList.remove('hidden');
    }

    closeModal() {
        this.modal.classList.add('hidden');
    }

    async handleSubmit(e) {
        e.preventDefault();
        const id = this.idInput.value;
        const url = id ? '/pages/Admin/editar_categoria.php' : '/pages/Admin/agregar_categoria.php';
        const formData = new FormData(this.form);

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                Swal.fire('¡Éxito!', result.message, 'success');
                this.closeModal();
                this.dataTable.ajax.reload();
            } else {
                Swal.fire('Error', result.error, 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Ocurrió un error de conexión.', 'error');
        }
    }

    deleteCategory(id) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch('/pages/Admin/eliminar_categoria.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `id=${id}`
                    });
                    const res = await response.json();
                    if (res.success) {
                        Swal.fire('¡Eliminada!', 'La categoría ha sido eliminada.', 'success');
                        this.dataTable.ajax.reload();
                    } else {
                        Swal.fire('Error', res.error, 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Ocurrió un error de conexión.', 'error');
                }
            }
        });
    }
}

const categoriasManager = new CategoriasManager();