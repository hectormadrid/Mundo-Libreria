// tablaGestionUsuario.js - Versión corregida
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
        const self = this; // Guardar referencia al contexto
        
        this.table = $('#usuariosTable').DataTable({
            ajax: {
                url: '/pages/Admin/obtener_usuarios.php',
                dataSrc: 'data',
                error: function(xhr, error, thrown) {
                    console.error('Error loading data:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudieron cargar los usuarios',
                        icon: 'error'
                    });
                }
            },
            columns: [
                { data: 'id' },
                { data: 'rut' },
                { data: 'nombre' },
                { data: 'correo' },
                {
                    data: null,
                    render: function(data, type, row) {
                        return `
                            <div class="flex gap-2">
                                <button class="btn-editar bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
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
            language: {
                lengthMenu: "Mostrar _MENU_ usuarios por página",
                zeroRecords: "No se encontraron usuarios",
                info: "Mostrando página _PAGE_ de _PAGES_",
                infoEmpty: "No hay usuarios disponibles",
                infoFiltered: "(filtrado de _MAX_ usuarios totales)",
                search: "Buscar:",
                paginate: {
                    first: "Primero",
                    last: "Último",
                    next: "Siguiente",
                    previous: "Anterior"
                }
            },
            responsive: true,
            order: [[0, 'desc']],
            pageLength: 10,
            drawCallback: function(settings) {
                // Usar la referencia guardada
                if (self.table) {
                    self.updateUserCount();
                    self.bindActionButtons();
                }
            },
            initComplete: function(settings, json) {
                if (self.table) {
                    self.updateUserCount();
                }
            }
        });
    }

    initEventListeners() {
        const self = this;

        // Botón actualizar
        $('#btnActualizar').click(() => {
            this.refreshTable();
        });

        // Botón confirmar eliminar
        $('#btnConfirmarEliminar').click(() => {
            this.eliminarUsuario();
        });

        // Cerrar modal con ESC
        $(document).keydown((e) => {
            if (e.key === 'Escape') {
                this.cerrarModal('modalEliminarUsuario');
            }
        });

        // Cerrar modal haciendo click fuera
        $('#modalEliminarUsuario').click((e) => {
            if (e.target === e.currentTarget) {
                this.cerrarModal('modalEliminarUsuario');
            }
        });
    }

    bindActionButtons() {
        const self = this;

        // Botones eliminar
        $(document).off('click', '.btn-eliminar').on('click', '.btn-eliminar', function(e) {
            const button = $(this);
            self.selectedUserId = button.data('id');
            self.selectedUserName = button.data('nombre');
            self.mostrarModalEliminar();
        });

        // Botones editar
        $(document).off('click', '.btn-editar').on('click', '.btn-editar', function(e) {
            Swal.fire({
                title: 'Función en desarrollo',
                text: 'La edición de usuarios estará disponible pronto',
                icon: 'info',
                confirmButtonText: 'Entendido'
            });
        });
    }

    mostrarModalEliminar() {
        $('#usuarioNombre').text(this.selectedUserName);
        $('#modalEliminarUsuario').removeClass('hidden');
    }

    cerrarModal(modalId) {
        $(`#${modalId}`).addClass('hidden');
    }

    async eliminarUsuario() {
        try {
            const response = await fetch('/pages/Admin/eliminar_usuario.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: this.selectedUserId })
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    title: '¡Eliminado!',
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
                this.refreshTable();
            } else {
                Swal.fire({
                    title: 'Error',
                    text: result.error,
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }

            this.cerrarModal('modalEliminarUsuario');
            this.selectedUserId = null;
            this.selectedUserName = null;

        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Error de conexión: ' + error.message,
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }

    refreshTable() {
        if (this.table) {
            this.table.ajax.reload(() => {
                this.updateUserCount();
            }, false);
            
            Swal.fire({
                title: 'Actualizando',
                text: 'Cargando datos de usuarios...',
                icon: 'info',
                timer: 1000,
                showConfirmButton: false
            });
        }
    }

    updateUserCount() {
        try {
            if (!this.table) {
                console.warn('Table not initialized yet');
                $('#total-usuarios').text('0');
                return;
            }

            // Método más confiable para obtener el count
            const count = this.table.rows({ search: 'applied' }).count();
            $('#total-usuarios').text(count);
            
        } catch (error) {
            console.error('Error updating user count:', error);
            $('#total-usuarios').text('0');
        }
    }
}

// Inicializar cuando el DOM esté listo
$(document).ready(function() {
    window.userManager = new UserManager();
});

// Funciones globales para modales
function cerrarModal(modalId) {
    $(`#${modalId}`).addClass('hidden');
}

function abrirModal(modalId) {
    $(`#${modalId}`).removeClass('hidden');
}