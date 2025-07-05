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
                $('#productosTable').DataTable({
                    // Configuración adicional de DataTables puede ir aquí
                    // Por ejemplo, para habilitar la integración con Tailwind:
                    // "renderer": "tailwindcss" // Esto puede variar según la versión y el adaptador
                    // Sin embargo, al incluir dataTables.tailwindcss.min.js y su CSS,
                    // DataTables debería usar estilos de Tailwind automáticamente.
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



    </body>

    </html>