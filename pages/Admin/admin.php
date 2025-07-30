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
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <!-- Tailwind CSS -->
            <link href="https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

            <!-- DataTables CSS -->
            <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.7/css/jquery.dataTables.min.css">
            <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/2.4.2/css/buttons.dataTables.min.css">
            <!-- DataTables Tailwind CSS -->

            <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/dt/dt-1.13.7/datatables.min.css" />
            <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.7/css/dataTables.tailwindcss.min.css">

            <!-- 2. jQuery y DataTables -->
            <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
            <script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>

            <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/dt/dt-1.13.7/datatables.min.css" />
            <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.7/css/dataTables.tailwindcss.min.css">

            <!-- Tu CSS personalizado -->
            <link rel="stylesheet" href="../../style/Menu.css">
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
                            <div class="name-job text-wrap overflow-hidden">
                                <div class="profile_name">
                                    <?php echo isset($_SESSION['nombre']) ? htmlspecialchars($_SESSION['nombre']) : 'Administrador'; ?>
                                </div>
                                <a href="../../db/cerrar_sesion.php"
                                    class="inline-block bg-[#3664E4] hover:bg-red-800 text-white font-bold py-2 px-4 rounded mb-4 bx bx-log-out">
                                </a>
                            </div>
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
                                    <th class="py-3 px-6 text-center">Imagen</th>
                                    <th class="py-3 px-6 text-center">Precio</th>
                                    <th class="py-3 px-6 text-center">Descripción</th>
                                    <th class="py-3 px-6 text-center">Categoria</th>
                                    <th class="py-3 px-6 text-center">Estado</th>
                                    <th class="py-3 px-6 text-center">Fecha de Creación</th>
                                    <th class="py-3 px-6 text-center">Acciones</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>

            </section>


            <script src="../../js/menu_admin.js"></script>
            <script src="../../js/agregarProductos.js"></script>
            <script src="../../js/tablaAdmin.js"></script>
            <script src="../../js/editarProductos.js"></script>

            <!-- DataTables JS -->
            <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
            <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/2.4.2/js/dataTables.buttons.min.js"></script>
            <script type="text/javascript" charset="utf8" src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
            <script type="text/javascript" charset="utf8" src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script>
            <script type="text/javascript" charset="utf8" src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script>
            <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.html5.min.js"></script>
            <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.print.min.js"></script>
            <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.13.7/js/dataTables.tailwindcss.min.js"></script>



            <!-- Modal para agregar productos (oculto por defecto) -->
            <div id="modalAgregar" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center p-4">
                <div class="bg-white rounded-lg shadow-lg w-full max-w-md">
                    <div class="p-6">
                        <h2 class="text-2xl font-bold mb-4">Agregar Producto</h2>
                        <form id="formAgregarProducto" enctype="multipart/form-data" method="POST">
                            <div class="mb-4">
                                <label class="block text-gray-700 mb-2">Nombre</label>
                                <input type="text" name="nombre" class="w-full px-3 py-2 border rounded">
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 mb-2">Imagen del producto</label>
                                <input type="file" name="imagen" accept="image/*" class="w-full px-3 py-2 border rounded">
                                <p class="text-xs text-gray-500">Formatos: JPG, PNG, WEBP (Máx. 2MB)</p>
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
                                <label class="block text-gray-700 mb-2">Categoria</label>
                                <select name="categoria" class="w-full px-3 py-2 border rounded">
                                    <option value="Libreria">Libreria</option>
                                    <option value="Oficina">Oficina</option>
                                    <option value="Papeleria">Papeleria</option>
                                </select>
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
            <!-- Modal Editar Producto -->
            <div id="modalEditar" class="fixed inset-0 z-50 hidden overflow-y-auto bg-black bg-opacity-50">
                <div class="flex items-center justify-center min-h-screen">
                    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                        <form id="formEditarProducto" class="p-6">
                            <input type="hidden" id="editarId" name="id">

                            <h2 class="text-2xl font-bold mb-4">Editar Producto</h2>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label for="editarNombre" class="block mb-2">Nombre</label>
                                    <input type="text" id="editarNombre" name="nombre" class="w-full p-2 border rounded" required>
                                </div>

                                <div>
                                    <label for="editarPrecio" class="block mb-2">Precio</label>
                                    <input type="number" step="0.01" id="editarPrecio" name="precio" class="w-full p-2 border rounded" required>
                                </div>

                                <div class="mb-4">
                                    <label for="editarCategoria" class="block mb-2">Categoría</label>
                                    <select id="editarCategoria" name="categoria" class="w-full p-2 border rounded" required>
                                        <option value="">Seleccione una categoría</option>
                                        <option value="Libreria">Librería</option>
                                        <option value="Oficina">Oficina</option>
                                        <option value="Papeleria">Papelería</option>
                                    </select>1
                                </div>
                                <div>
                                    <label for="editarEstado" class="block mb-2">Estado</label>
                                    <select id="editarEstado" name="estado" class="w-full p-2 border rounded">
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label for="editarDescripcion" class="block mb-2">Descripción</label>
                                <textarea id="editarDescripcion" name="descripcion" rows="3" class="w-full p-2 border rounded"></textarea>
                            </div>

                            <div class="mb-4">
                                <label for="editarImagen" class="block mb-2">Imagen (opcional)</label>
                                <input type="file" id="editarImagen" name="imagen" accept="image/jpeg,image/png,image/webp" class="w-full p-2 border rounded">
                                <small class="text-gray-500">Formatos aceptados: JPG, PNG, WEBP (Máx. 2MB)</small>
                                <div id="imagenActualContainer" class="mt-2">
                                    <p class="text-sm font-medium">Imagen actual:</p>
                                    <img id="imagenActual" src="" class="mt-1 h-20 object-contain">
                                </div>
                            </div>

                            <div class="flex justify-end space-x-3">
                                <button type="button" id="btnCancelarEdicion" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                                    Cancelar
                                </button>
                                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </body>

        </html>