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
                    <button id="btnAbrirModalAgregarProducto" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Agregar Productos
                    </button>
                </div>

                <!-- Modal para Agregar Producto -->
                <div id="modalAgregarProducto" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden">
                    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div class="mt-3 text-center">
                            <h3 class="text-lg leading-6 font-medium text-gray-900">Agregar Nuevo Producto</h3>
                            <form id="formAgregarProducto" class="mt-2">
                                <div class="mb-4">
                                    <label for="nombre" class="block text-sm font-medium text-gray-700 text-left">Nombre</label>
                                    <input type="text" name="nombre" id="nombre" class="mt-1 p-2 w-full border-gray-300 rounded-md shadow-sm" required>
                                </div>
                                <div class="mb-4">
                                    <label for="descripcion" class="block text-sm font-medium text-gray-700 text-left">Descripción</label>
                                    <textarea name="descripcion" id="descripcion" rows="3" class="mt-1 p-2 w-full border-gray-300 rounded-md shadow-sm"></textarea>
                                </div>
                                <div class="mb-4">
                                    <label for="precio" class="block text-sm font-medium text-gray-700 text-left">Precio</label>
                                    <input type="number" name="precio" id="precio" step="0.01" class="mt-1 p-2 w-full border-gray-300 rounded-md shadow-sm" required>
                                </div>
                                <div class="mb-4">
                                    <label for="estado" class="block text-sm font-medium text-gray-700 text-left">Estado</label>
                                    <select name="estado" id="estado" class="mt-1 p-2 w-full border-gray-300 rounded-md shadow-sm">
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>
                                <div class="items-center px-4 py-3">
                                    <button id="btnGuardarProducto" type="submit" class="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700">
                                        Guardar Producto
                                    </button>
                                </div>
                            </form>
                            <div class="items-center px-4 py-3">
                                <button id="btnCerrarModal" class="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
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
                        <tbody class="text-gray-600 text-sm font-light">
                            <tr class="border-b border-gray-200 hover:bg-gray-100">
                                <td class="py-3 px-6 text-left whitespace-nowrap">1</td>
                                <td class="py-3 px-6 text-left">Cuaderno Universitario</td>
                                <td class="py-3 px-6 text-center">$2.500</td>
                                <td class="py-3 px-6 text-center">Cuaderno de 100 hojas, tapa dura.</td>
                                <td class="py-3 px-6 text-center"><span class="bg-green-200 text-green-600 py-1 px-3 rounded-full text-xs">Activo</span></td>
                                <td class="py-3 px-6 text-center">2023-10-26</td>
                            </tr>
                            <tr class="border-b border-gray-200 hover:bg-gray-100">
                                <td class="py-3 px-6 text-left whitespace-nowrap">2</td>
                                <td class="py-3 px-6 text-left">Lápiz Grafito HB</td>
                                <td class="py-3 px-6 text-center">$500</td>
                                <td class="py-3 px-6 text-center">Caja de 12 lápices grafito.</td>
                                <td class="py-3 px-6 text-center"><span class="bg-green-200 text-green-600 py-1 px-3 rounded-full text-xs">Activo</span></td>
                                <td class="py-3 px-6 text-center">2023-10-25</td>
                            </tr>
                            <tr class="border-b border-gray-200 hover:bg-gray-100">
                                <td class="py-3 px-6 text-left whitespace-nowrap">3</td>
                                <td class="py-3 px-6 text-left">Goma de Borrar</td>
                                <td class="py-3 px-6 text-center">$300</td>
                                <td class="py-3 px-6 text-center">Goma de borrar blanca, suave.</td>
                                <td class="py-3 px-6 text-center"><span class="bg-red-200 text-red-600 py-1 px-3 rounded-full text-xs">Inactivo</span></td>
                                <td class="py-3 px-6 text-center">2023-10-24</td>
                            </tr>
                        </thead>
                        <tbody class="text-gray-600 text-sm font-light">
                            <!-- Los datos se cargarán aquí por DataTables vía AJAX -->
                        </tbody>
                    </table>
                </div>
            </div> <!-- Cierre de container mx-auto px-4 -->


        </section>
        <script src="../js/menu_admin.js"></script>

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
                var table = $('#productosTable').DataTable({
                    "ajax": {
                        "url": "obtener_productos.php", // Script PHP que devuelve los datos en JSON
                        "type": "GET", // o POST, según cómo esté configurado tu script PHP
                        "dataSrc": "data" // Nombre de la propiedad en el JSON que contiene los datos de la tabla
                    },
                    "columns": [ // Definir las columnas para que DataTables sepa cómo mapear los datos
                        { "data": 0 }, // ID
                        { "data": 1 }, // Nombre
                        { "data": 2 }, // Precio
                        { "data": 3 }, // Descripción
                        { "data": 4 }, // Estado
                        { "data": 5 }  // Fecha de Creación
                    ],
                    language: {
                        "decimal": "",
                        "emptyTable": "No hay productos registrados o no se pudieron cargar.",
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

                // Manejo del modal
                const modal = $('#modalAgregarProducto');
                const btnAbrirModal = $('#btnAbrirModalAgregarProducto');
                const btnCerrarModal = $('#btnCerrarModal');
                const formAgregarProducto = $('#formAgregarProducto');

                btnAbrirModal.click(function() {
                    modal.removeClass('hidden');
                });

                btnCerrarModal.click(function() {
                    modal.addClass('hidden');
                    formAgregarProducto[0].reset(); // Resetea el formulario al cerrar
                });

                // Cierra el modal si se hace clic fuera de él
                $(window).click(function(event) {
                    if (modal.length && event.target == modal[0]) { // Asegurarse que el modal existe
                        modal.addClass('hidden');
                        formAgregarProducto[0].reset(); // Resetea el formulario al cerrar
                    }
                });

                // Enviar formulario de agregar producto con AJAX
                formAgregarProducto.submit(function(e) {
                    e.preventDefault(); // Evitar el envío tradicional del formulario

                    $.ajax({
                        url: 'guardar_producto.php', // Ruta al script PHP que guarda en BD
                        type: 'POST',
                        data: $(this).serialize(), // Envía los datos del formulario
                        dataType: 'json', // Espera una respuesta JSON del servidor
                        success: function(response) {
                            if (response.success) {
                                modal.addClass('hidden'); // Ocultar el modal
                                formAgregarProducto[0].reset(); // Limpiar el formulario
                                alert(response.message); // Mostrar mensaje de éxito (o usar una notificación más elegante)

                                // Actualizar DataTables:
                                // Si estás cargando datos vía AJAX desde el servidor, simplemente recarga:
                                table.ajax.reload();
                                // Si los datos de ejemplo están hardcodeados y quieres añadir dinámicamente (menos común con BD):
                                // table.row.add([
                                //    response.id_producto, // Suponiendo que tu script PHP devuelve el nuevo ID
                                //    $('#nombre').val(),
                                //    $('#precio').val(),
                                //    $('#descripcion').val(),
                                //    $('#estado').val(),
                                //    new Date().toISOString().slice(0, 10) // Fecha actual como ejemplo
                                // ]).draw(false);

                            } else {
                                alert('Error: ' + response.message); // Mostrar mensaje de error
                            }
                        },
                        error: function(xhr, status, error) {
                            // Manejar errores de conexión o del servidor
                            alert('Error al conectar con el servidor: ' + error + '\nRespuesta: ' + xhr.responseText);
                        }
                    });
                });
            });
        </script>



    </body>

    </html>