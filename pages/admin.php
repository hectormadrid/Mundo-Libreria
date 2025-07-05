        <?php
        session_start();
        ?>
        <!DOCTYPE html>
        <html lang="es">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="icon" href="../../componentes/logo pestaña.ico">
            <title>Mundo Libreria</title>

            <!-- Tailwind CSS -->
            <link href="https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

            <!-- DataTables CSS -->
            <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.7/css/jquery.dataTables.min.css">
            <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/2.4.2/css/buttons.dataTables.min.css">
            <!-- DataTables Tailwind CSS -->

            <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/dt/dt-1.13.7/datatables.min.css" />
            <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.7/css/dataTables.tailwindcss.min.css">



            <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/dt/dt-1.13.7/datatables.min.css" />
            <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.7/css/dataTables.tailwindcss.min.css">

            <!-- Tu CSS personalizado -->
            <link rel="stylesheet" href="../style/Menu.css">
            <link href='https://unpkg.com/boxicons@2.1.1/css/boxicons.min.css' rel='stylesheet'>
            <!-- jQuery -->
            <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
            <script src="https://unpkg.com/boxicons@2.1.3/dist/boxicons.js"></script>

        </head>

        <body class="bg-gray-100 text-gray-900 tracking-wider leading-normal overflow-hidden">

            <div class="sidebar close">
                <div class="logo-details">
                    <box-icon name='user-circle' color="#ffffff" class="mr-3 ml-2"></box-icon>
                    <span class="logo_name text-center" style='color:#ffffff'>Administrador</span>
                </div>
                <ul class="nav-links">
                    <li>
                        <a href="admin.php">
                            <i class='bx bx-grid-alt'></i>
                            <span class="link_name">Inicio</span>
                        </a>
                    </li>

                    <li>
                        <div class="iocn-link">
                            <a href="Mensajes.php">
                                <i class='bx bx-comment-dots'></i>
                                <span class="link_name">Mensajes</span>
                            </a>
                        </div>
                    </li>


                    <li>
                        <div class="profile-details">
                            <div class="name-job  text-wrap overflow-hidden ">
                                <div class="profile_name  ">

                                </div>
                                <a href="login_admin.php" class='inline-block bg-[#3664E4] hover:bg-red-800 text-white font-bold py-2 px-4 rounded mb-4  bx bx-log-out '> </a>
                            </div>
                    </li>
                </ul>
            </div>
            <section class="home-section  overflow-y-auto ">
                <div class="home-content fixed">
                    <i class='bx bx-menu '></i>
                    <span class="text">Menu</span>
                </div>

                <div class="container mx-auto px-4">
                    <h1 class="  text-4xl md:text-5xl text-center font-serif font-bold text-black-500 mb-6 mt-6">
                        Bienvenido Administrador
                    </h1>
                    <!-- Botón Agregar Productos -->
                    <div class="mb-4">
                        <button id="btnAgregarProducto" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Agregar Productos
                        </button>
                    </div>

                    <!-- Contenedor de la Tabla -->
                    <div class="bg-white shadow-md rounded my-6">
                        <table id="productosTable" class="min-w-max w-full table-auto">
                            <thead>
                                <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                    <th class="py-3 px-6 text-left">ID</th>
                                    <th class="py-3 px-6 text-left">Nombre</th>
                                    <th class="py-3 px-6 text-center">Precio</th>
                                    <th class="py-3 px-6 text-center">Descripción</th>
                                    <th class="py-3 px-6 text-center">Estado</th>
                                    <th class="py-3 px-6 text-center">Fecha de Creación</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>

            </section>


            <script src="../js/menu_admin.js"></script>
            <script src="../js/agregar_productos.js"></script>

            <!-- DataTables JS -->
            <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
            <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/2.4.2/js/dataTables.buttons.min.js"></script>
            <script type="text/javascript" charset="utf8" src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
            <script type="text/javascript" charset="utf8" src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script>
            <script type="text/javascript" charset="utf8" src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script>
            <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.html5.min.js"></script>
            <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.print.min.js"></script>
            <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.13.7/js/dataTables.tailwindcss.min.js"></script>

            <script>
                $(document).ready(function() {
                    $('#productosTable').DataTable({
                        ajax: {
                            url: 'obtener_productos.php', // Ruta al archivo PHP
                            dataSrc: '' // Indica que los datos están en el array raíz del JSON
                        },
                        columns: [{
                                data: 'id'
                            }, // Asegúrate de que coincidan con los nombres de tus columnas en la BD
                            {
                                data: 'nombre'
                            },
                            {
                                data: 'precio'
                            },
                            {
                                data: 'descripcion',
                            },
                            {
                                data: 'estado',
                                render: function(data, type, row) {
                                    const color = data === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                                    return `<span class="px-2 py-1 rounded-full ${color}">${data}</span>`;
                                }
                            },
                            {
                                data: 'fecha_creacion'
                            }
                        ],
                        responsive: true, // Opcional: Para dispositivos pequeños
                        language: {
                            "decimal": "",
                            "emptyTable": "No hay información",
                            "info": "Mostrando _START_ a _END_ de _TOTAL_ Entradas",
                            "infoEmpty": "Mostrando 0 to 0 of 0 Entradas",
                            "infoFiltered": "(Filtrado de _MAX_ total entradas)",
                            "infoPostFix": "",
                            "thousands": ",",
                            "lengthMenu": "Mostrar _MENU_ Entradas",
                            "loadingRecords": "Cargando...",
                            "processing": "Procesando...",
                            "search": "Buscar:",
                            "zeroRecords": "Sin resultados encontrados",
                            "paginate": {
                                "first": "Primero",
                                "last": "Ultimo",
                                "next": "Siguiente",
                                "previous": "Anterior"
                            }
                        },
                    });

                });
            </script>


            <!-- Modal para agregar productos (oculto por defecto) -->
            <div id="modalAgregar" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center p-4">
                <div class="bg-white rounded-lg shadow-lg w-full max-w-md">
                    <div class="p-6">
                        <h2 class="text-2xl font-bold mb-4">Agregar Producto</h2>
                        <form id="formAgregarProducto">
                            <div class="mb-4">
                                <label class="block text-gray-700 mb-2">Nombre</label>
                                <input type="text" name="nombre" class="w-full px-3 py-2 border rounded">
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 mb-2">Precio</label>
                                <input type="number" name="precio" class="w-full px-3 py-2 border rounded">
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 mb-2">Descripción</label>
                                <textarea name="descripcion" class="w-full px-3 py-2 border rounded"></textarea>
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 mb-2">Estado</label>
                                <select name="estado" class="w-full px-3 py-2 border rounded">
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                            <div class="flex justify-end gap-2">
                                <button type="button" id="btnCancelar" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
                                    Cancelar
                                </button>
                                <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </body>

        </html>