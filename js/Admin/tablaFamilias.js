class FamiliasManager {
    constructor() {
        this.dataTable = null;
        this.modal = document.getElementById('modalFamilia');
        this.form = document.getElementById('formFamilia');
        this.title = document.getElementById('modalFamiliaTitulo');
        this.idInput = document.getElementById('familiaId');
        this.nameInput = document.getElementById('familiaNombre');
        this.categoryInput = document.getElementById('familiaCategoria');
        
        this.initDataTable();
        this.initEventListeners();
    }

    initDataTable() {
        this.dataTable = $('#familiasTable').DataTable({
            ajax: {
                url: 'obtener_familias.php', // Endpoint para obtener familias
                dataSrc: 'data'
            },
            columns: [
                { data: 'id' },
                { data: 'nombre' },
                { data: 'categoria_nombre' }, // Nombre de la categoría padre
                {
                    data: 'id',
                    render: (data, type, row) => `
                        <button onclick="familiasManager.openModal(true, ${data}, '${row.nombre}', ${row.id_categoria})" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Editar</button>
                        <button onclick="familiasManager.deleteFamily(${data})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Eliminar</button>
                    `,
                    orderable: false
                }
            ],
            language: {
                decimal: "",
                emptyTable: "No hay familias registradas",
                info: "Mostrando _START_ a _END_ de _TOTAL_ familias",
                infoEmpty: "Mostrando 0 a 0 de 0 familias",
                infoFiltered: "(filtrado de _MAX_ familias totales)",
                lengthMenu: "Mostrar _MENU_ familias",
                loadingRecords: "Cargando...",
                search: "Buscar:",
                zeroRecords: "No se encontraron familias",
                paginate: {
                    first: "Primero",
                    last: "Último",
                    next: "Siguiente",
                    previous: "Anterior",
                },
            }
        });
    }

    initEventListeners() {
        document.getElementById('btnNuevaFamilia').addEventListener('click', () => this.openModal(false));
        document.getElementById('btnCancelarFamilia').addEventListener('click', () => this.closeModal());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    openModal(isEdit, id = null, name = '', categoryId = '') {
        this.form.reset();
        if (isEdit) {
            this.title.textContent = 'Editar Familia';
            this.idInput.value = id;
            this.nameInput.value = name;
            this.categoryInput.value = categoryId;
        } else {
            this.title.textContent = 'Nueva Familia';
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
        const url = id ? 'editar_familia.php' : 'agregar_familia.php';
        const formData = new FormData(this.form);

        // Simple validation
        if (!formData.get('nombre').trim() || !formData.get('id_categoria')) {
            Swal.fire('Error', 'Por favor, complete todos los campos.', 'warning');
            return;
        }

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

    deleteFamily(id) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto! Se eliminará la familia.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch('eliminar_familia.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: id })
                    });
                    const res = await response.json();
                    if (res.success) {
                        Swal.fire('¡Eliminada!', 'La familia ha sido eliminada.', 'success');
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

// Iniciar el manejador de familias cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.familiasManager = new FamiliasManager();

});


