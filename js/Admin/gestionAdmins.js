document.addEventListener('DOMContentLoaded', function () {
    const btnGestionarAdmins = document.getElementById('btnGestionarAdmins');
    const seccionGestionAdmins = document.getElementById('seccionGestionAdmins');
    const btnCrearAdmin = document.getElementById('btnCrearAdmin');
    const modalCrearAdmin = document.getElementById('modalCrearAdmin');
    const btnCancelarAdmin = document.getElementById('btnCancelarAdmin');
    const formCrearAdmin = document.getElementById('formCrearAdmin');
    let adminsTable;

    // 1. Mostrar/ocultar sección de gestión de admins
    btnGestionarAdmins.addEventListener('click', () => {
        const isHidden = seccionGestionAdmins.classList.contains('hidden');
        if (isHidden) {
            seccionGestionAdmins.classList.remove('hidden');
            if (!adminsTable) {
                // Inicializar DataTable solo la primera vez
                adminsTable = $('#adminsTable').DataTable({
                    ajax: {
                        url: 'obtener_admins.php', // Endpoint para obtener admins
                        dataSrc: 'data'
                    },
                    columns: [
                        { data: 'id' },
                        { data: 'nombre' },
                        {
                            data: 'id',
                            render: function (data, type, row) {
                                return `<button class="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded btn-eliminar-admin" data-id="${data}" data-nombre="${row.nombre}">Eliminar</button>`;
                            }
                        }
                    ],
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
                    }
                });
            } else {
                adminsTable.ajax.reload(); // Recargar datos si la tabla ya existe
            }
        } else {
            seccionGestionAdmins.classList.add('hidden');
        }
    });

    // 2. Abrir modal para crear admin
    btnCrearAdmin.addEventListener('click', () => {
        modalCrearAdmin.classList.remove('hidden');
    });

    // 3. Cerrar modal
    btnCancelarAdmin.addEventListener('click', () => {
        modalCrearAdmin.classList.add('hidden');
        formCrearAdmin.reset();
    });

    // 4. Enviar formulario para crear nuevo admin
    formCrearAdmin.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);

        fetch('crear_administrador.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire('Éxito', data.message, 'success');
                modalCrearAdmin.classList.add('hidden');
                formCrearAdmin.reset();
                adminsTable.ajax.reload(); // Recargar la tabla
            } else {
                Swal.fire('Error', data.error, 'error');
            }
        })
        .catch(error => {
            Swal.fire('Error', 'Ocurrió un error de conexión.', 'error');
            console.error('Error:', error);
        });
    });

    // 5. Manejar eliminación de admin (delegación de eventos)
    $('#adminsTable tbody').on('click', '.btn-eliminar-admin', function () {
        const adminId = $(this).data('id');
        const adminNombre = $(this).data('nombre');

        Swal.fire({
            title: `¿Estás seguro?`,
            text: `Estás a punto de eliminar al administrador "${adminNombre}". ¡Esta acción no se puede deshacer!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('eliminar_administrador.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: adminId })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('Eliminado', data.message, 'success');
                        adminsTable.ajax.reload(); // Recargar la tabla
                    } else {
                        Swal.fire('Error', data.error, 'error');
                    }
                })
                .catch(error => {
                    Swal.fire('Error', 'Ocurrió un error de conexión.', 'error');
                    console.error('Error:', error);
                });
            }
        });
    });
});
