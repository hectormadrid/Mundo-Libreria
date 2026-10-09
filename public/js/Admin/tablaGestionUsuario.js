// tablaGestionUsuario.js - Versión con Edición
class UserManager {
    constructor() {
        this.table = null;
        this.selectedUserId = null;
        this.selectedUserName = null;
        this.init();
    }

    init() {
        this.initDataTable();
        this.initEventListeners();
    }

    initDataTable() {
        const self = this;
        
        this.table = $('#usuariosTable').DataTable({
            ajax: {
                url: 'obtener_usuarios.php',
                dataSrc: 'data',
                error: function(xhr, error, thrown) {
                    console.error('Error loading data:', error);
                    Swal.fire({ title: 'Error', text: 'No se pudieron cargar los usuarios', icon: 'error' });
                }
            },
            columns: [
                { data: 'id' },
                { data: 'rut' },
                { data: 'nombre' },
                { data: 'correo' },
                { data: 'telefono' },
                { data: 'direccion' },
                {
                    data: null,
                    render: function(data, type, row) {
                        return `
                            <div class="flex gap-2">
                                <button class="btn-editar bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors" data-id="${row.id}">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                                <button class="btn-eliminar bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors" data-id="${row.id}" data-nombre="${row.nombre}">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                        `;
                    }
                }
            ],
            language: { /* ... lenguajes ... */ },
            responsive: true,
            order: [[0, 'desc']],
            pageLength: 10,
            drawCallback: function() {
                self.bindActionButtons();
            }
        });
    }

    initEventListeners() {
        const self = this;

        // Botón confirmar eliminar
        $('#btnConfirmarEliminar').click(() => this.eliminarUsuario());

        // Submit del formulario de edición
        $('#formEditarUsuario').submit(function(e) {
            e.preventDefault();
            self.guardarCambiosUsuario();
        });

        // Cerrar modales con ESC
        $(document).keydown((e) => {
            if (e.key === 'Escape') {
                self.cerrarModal('modalEliminarUsuario');
                self.cerrarModal('modalEditarUsuario');
            }
        });
    }

    bindActionButtons() {
        const self = this;

        // Botones eliminar
        $('.btn-eliminar').off('click').on('click', function() {
            self.selectedUserId = $(this).data('id');
            self.selectedUserName = $(this).data('nombre');
            self.mostrarModalEliminar();
        });

        // Botones editar
        $('.btn-editar').off('click').on('click', function() {
            const userId = $(this).data('id');
            self.mostrarModalEditar(userId);
        });
    }

    // --- Métodos de Edición ---
    async mostrarModalEditar(userId) {
        try {
            const response = await fetch(`obtener_usuario_detalle.php?id=${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (result.success) {
                const userData = result.data;
                $('#editUsuarioId').val(userData.id);
                $('#editRut').val(userData.rut);
                $('#editNombre').val(userData.nombre);
                $('#editCorreo').val(userData.correo);
                $('#editTelefono').val(userData.telefono);
                $('#editDireccion').val(userData.direccion);
                abrirModal('modalEditarUsuario');
            } else {
                Swal.fire('Error', result.error || 'No se pudieron cargar los datos del usuario.', 'error');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            Swal.fire('Error', 'No se pudo conectar con el servidor para obtener los detalles del usuario.', 'error');
        }
    }

    async guardarCambiosUsuario() {
        const formData = {
            id: $('#editUsuarioId').val(),
            rut: $('#editRut').val(),
            nombre: $('#editNombre').val(),
            correo: $('#editCorreo').val(),
            telefono: $('#editTelefono').val(),
            direccion: $('#editDireccion').val(),
        };

        try {
            const response = await fetch('editar_usuario.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                this.cerrarModal('modalEditarUsuario');
                Swal.fire('¡Actualizado!', result.message, 'success');
                this.refreshTable();
            } else {
                Swal.fire('Error', result.error || 'Ocurrió un problema al actualizar.', 'error');
            }
        } catch (error) {
            console.error('Error saving user changes:', error);
            Swal.fire('Error', 'No se pudo conectar con el servidor para guardar los cambios.', 'error');
        }
    }


    // --- Métodos de Eliminación ---
    mostrarModalEliminar() {
        $('#usuarioNombre').text(this.selectedUserName);
        abrirModal('modalEliminarUsuario');
    }

    async eliminarUsuario() {
        try {
            const response = await fetch('eliminar_usuario.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: this.selectedUserId })
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire('¡Eliminado!', result.message, 'success');
                this.refreshTable();
            } else {
                Swal.fire('Error', result.error, 'error');
            }

            this.cerrarModal('modalEliminarUsuario');
        } catch (error) {
            Swal.fire('Error', 'Error de conexión: ' + error.message, 'error');
        }
    }

    // --- Métodos Auxiliares ---
    cerrarModal(modalId) {
        $(`#${modalId}`).addClass('hidden');
    }

    refreshTable() {
        if (this.table) {
            this.table.ajax.reload(null, false); // false para no resetear la paginación
        }
    }
}

// Inicializar cuando el DOM esté listo
$(document).ready(function() {
    window.userManager = new UserManager();
});

// Funciones globales para modales (pueden ser llamadas desde el HTML)
function cerrarModal(modalId) {
    $(`#${modalId}`).addClass('hidden');
}

function abrirModal(modalId) {
    $(`#${modalId}`).removeClass('hidden');
}
