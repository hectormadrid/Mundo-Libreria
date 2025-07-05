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
                            <a href="../Inicio_sesion.php" class='inline-block bg-[#3664E4] hover:bg-red-800 text-white font-bold py-2 px-4 rounded mb-4  bx bx-log-out '> </a>
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

        </section>
        <script src="../js/menu_admin.js"></script>
        
    </body>

    </html>