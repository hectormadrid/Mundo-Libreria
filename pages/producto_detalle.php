<?php
session_start();
require_once __DIR__ . '/../db/Conexion.php';

$product = null;
$similar_products = [];

if (isset($_GET['id'])) {
  $product_id = (int)$_GET['id'];

  // Fetch main product details
  $stmt = $conexion->prepare("
        SELECT 
            p.*, 
            c.nombre AS categoria_nombre, 
            f.nombre AS familia_nombre 
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id
        LEFT JOIN familias f ON p.id_familia = f.id
        WHERE p.id = ? AND p.estado = 'activo'
    ");
  $stmt->bind_param("i", $product_id);
  $stmt->execute();
  $result = $stmt->get_result();
  $product = $result->fetch_assoc();
  $stmt->close();

  if ($product) {
    // Fetch similar products (same category or family, excluding current product)
    $stmt_similar = $conexion->prepare("
            SELECT 
                p.id, p.nombre, p.imagen, p.precio, p.descripcion 
            FROM productos p
            WHERE p.estado = 'activo' 
            AND p.id != ?
            AND (p.id_categoria = ? OR p.id_familia = ?)
            ORDER BY RAND() 
            LIMIT 5
        ");
    $stmt_similar->bind_param("iii", $product_id, $product['id_categoria'], $product['id_familia']);
    $stmt_similar->execute();
    $result_similar = $stmt_similar->get_result();
    while ($row = $result_similar->fetch_assoc()) {
      $similar_products[] = $row;
    }
    $stmt_similar->close();
  }
}

// Redirect if product not found
if (!$product) {
  // Optionally redirect to a 404 page or index with an error message
  header('Location: index.php?error=producto_no_encontrado');
  exit;
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="../assets/MUNDO-WEB.ico">
  <title>Detalle de Producto - Mundo Libreria</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <link rel="stylesheet" href="../style/index.css">
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'lib-red': '#E53E3E',
            'lib-yellow': '#F6E05E',
            'lib-blue': '#3182CE',
          },
          animation: {
            'float': 'float 6s ease-in-out infinite',
            'pulse-slow': 'pulse 3s infinite',
            'bounce-slow': 'bounce 2s infinite',
          }
        }
      }
    }
  </script>
</head>

<body class="bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800 font-sans overflow-x-hidden">

  <!-- Header mejorado (copy from index.php for consistency) -->
  <header class="bg-gradient-to-r from-lib-blue via-lib-blue to-blue-600 text-white shadow-2xl relative overflow-hidden">
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 left-0 w-64 h-64 bg-lib-yellow rounded-full -translate-x-32 -translate-y-32 animate-pulse-slow"></div>
      <div class="absolute bottom-0 right-0 w-48 h-48 bg-lib-red rounded-full translate-x-24 translate-y-24 animate-float"></div>
    </div>

    <div class="container mx-auto px-4 py-4 relative z-10">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="flex items-center mb-4 md:mb-0 group">
          <div class="bg-white p-2 rounded-full shadow-lg mr-3 group-hover:scale-110 transition-transform duration-300">
            <img src="../assets/MUNDO-WEB.ico" alt="Logo" class="h-8 w-8">
          </div>
          <h1 class="text-3xl font-bold">
            Mundo <span class="text-lib-yellow animate-pulse">Librería</span>
          </h1>
        </div>

        <div class="flex items-center space-x-4">
          <div class="flex items-center glass-effect rounded-full p-1 hover:bg-white/20 transition-all duration-300">
            <input
              type="text"
              id="search-input"
              placeholder="¿Qué buscas hoy?"
              class="px-4 py-3 rounded-l-full text-sm focus:outline-none text-gray-800 w-48 md:w-64 bg-white/90 placeholder-gray-500">
            <button id="search-button" class="bg-lib-yellow px-4 py-3 rounded-r-full hover:bg-yellow-300 transition-all duration-300 hover:scale-105 shadow-lg">
              <svg class="w-5 h-5 text-lib-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </div>

          <?php if (isset($_SESSION['nombre'])): ?>
            <div class="flex items-center space-x-3 glass-effect rounded-full px-4 py-2">
              <div class="w-8 h-8 bg-lib-yellow rounded-full flex items-center justify-center">
                <span class="text-lib-blue font-bold text-sm"><?= strtoupper(substr($_SESSION['nombre'], 0, 1)) ?></span>
              </div>
              <div>
                <a href="perfilUser.php">perfil </a>
              </div>
              <span class="text-white font-semibold hidden md:inline">¡Hola, <?= htmlspecialchars($_SESSION['nombre']) ?>!</span>
              <a href="../db/Cerrar_sesion.php" class="bg-lib-red px-4 py-2 rounded-full text-white hover:bg-red-600 transition-all duration-300 hover:scale-105 shadow-lg">
                Salir
              </a>
            </div>
          <?php else: ?>
            <a href="login.php" class="bg-lib-yellow text-lib-blue px-6 py-3 rounded-full hover:bg-yellow-400 transition-all duration-300 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="hidden md:inline">Iniciar Sesión</span>
            </a>
          <?php endif; ?>

          <a href="Carrito.php" class="fixed bottom-6 right-6 z-50 bg-blue-600 p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 group">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293 c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4  2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span id="cart-count" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-transform duration-300">
              0
            </span>
          </a>
        </div>
      </div>
    </div>
  </header>

  <!-- Product Detail Section -->
  <main class="container mx-auto px-4 py-8 mt-16">
    <div class="mb-8">
      <a href="index.php" class="inline-flex items-center text-lib-blue hover:text-blue-700 transition-colors duration-300"> 
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"> │
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /> │
        </svg> 
        Volver al Inicio 
      </a>
    </div>
    <div class="bg-white rounded-lg shadow-xl overflow-hidden md:flex">
      <div class="md:w-1/2 p-6 flex items-center justify-center bg-gray-100">
        <img src="../uploads/productos/<?= htmlspecialchars($product['imagen'] ?? 'default.jpg') ?>"
          alt="<?= htmlspecialchars($product['nombre']) ?>"
          class="max-w-full h-auto object-contain max-h-96 rounded-lg shadow-md">
      </div>
      <div class="md:w-1/2 p-6">
        <h1 class="text-4xl font-bold text-gray-900 mb-2"><?= htmlspecialchars($product['nombre']) ?></h1>
        <p class="text-lib-blue text-lg mb-4">
          Categoría: <a href="index.php?categoria=<?= htmlspecialchars($product['id_categoria']) ?>" class="hover:underline"><?= htmlspecialchars($product['categoria_nombre']) ?></a>
          <?php if ($product['familia_nombre']): ?>
            / Familia: <a href="index.php?familia=<?= htmlspecialchars($product['id_familia']) ?>" class="hover:underline"><?= htmlspecialchars($product['familia_nombre']) ?></a>
          <?php endif; ?>
        </p>
        <p class="text-3xl font-extrabold text-lib-red mb-6">$<?= number_format($product['precio'], 0, ',', '.') ?></p>

        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Descripción</h3>
          <p class="text-gray-700 leading-relaxed"><?= nl2br(htmlspecialchars($product['descripcion'])) ?></p>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-6 text-gray-700">
          <div>
            <span class="font-semibold">Marca:</span> <?= htmlspecialchars($product['marca'] ?? 'N/A') ?>
          </div>
          <div>
            <span class="font-semibold">Color:</span> <?= htmlspecialchars($product['color'] ?? 'N/A') ?>
          </div>
          <div>
            <span class="font-semibold">Stock:</span>
            <span class="<?= $product['stock'] > 10 ? 'text-green-600' : ($product['stock'] > 0 ? 'text-orange-500' : 'text-red-600') ?> font-bold">
              <?= $product['stock'] > 0 ? htmlspecialchars($product['stock']) : 'Agotado' ?>
            </span>
          </div>
        </div>

        <button id="addToCartBtn"
          data-product-id="<?= $product['id'] ?>"
          class="w-full bg-lib-yellow text-blue py-3 px-6 rounded-lg text-xl font-bold hover:bg-yellow-500 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 <?= $product['stock'] == 0 ? 'opacity-50 cursor-not-allowed' : '' ?>"
          <?= $product['stock'] == 0 ? 'disabled' : '' ?>>
          <i class="fas fa-cart-plus mr-2"></i> Añadir al Carrito
        </button>
      </div>
    </div>

    <!-- Similar Products Section -->
    <?php if (!empty($similar_products)): ?>
      <section class="mt-16">
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-8">Productos Similares</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <?php foreach ($similar_products as $sim_product): ?>
            <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out product-card">
              <a href="producto_detalle.php?id=<?= $sim_product['id'] ?>">
                <img src="../uploads/productos/<?= htmlspecialchars($sim_product['imagen'] ?? 'default.jpg') ?>"
                  alt="<?= htmlspecialchars($sim_product['nombre']) ?>"
                  class="w-full h-48 object-cover">
              </a>
              <div class="p-4">
                <h3 class="text-xl font-semibold text-gray-800 mb-2 truncate">
                  <a href="producto_detalle.php?id=<?= $sim_product['id'] ?>" class="hover:text-lib-blue"><?= htmlspecialchars($sim_product['nombre']) ?></a>
                </h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2"><?= htmlspecialchars($sim_product['descripcion']) ?></p>
                <p class="text-lib-red text-2xl font-bold mb-4">$<?= number_format($sim_product['precio'], 0, ',', '.') ?></p>
                <button class="add-to-cart-btn-small w-full bg-lib-blue text-white py-2 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300">
                  Añadir
                </button>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </section>
    <?php endif; ?>
  </main>

  <!-- Footer (copy from index.php for consistency) -->
  <footer class="bg-gradient-to-r from-lib-blue to-blue-800 text-white mt-20 py-12 relative overflow-hidden">
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 right-0 w-64 h-64 bg-lib-yellow rounded-full translate-x-32 -translate-y-32 animate-pulse-slow"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-lib-red rounded-full -translate-x-24 translate-y-24 animate-float"></div>
    </div>

    <div class="container mx-auto px-4 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div class="md:col-span-2">
          <div class="flex items-center mb-4">
            <div class="bg-white p-2 rounded-full shadow-lg mr-3">
              <img src="../assets/MUNDO-WEB.ico" alt="Logo" class="h-8 w-8">
            </div>
            <h1 class="text-3xl font-bold">
              Mundo <span class="text-lib-yellow animate-pulse">Librería</span>
            </h1>
          </div>
          <div class="flex space-x-3">
            <!-- WhatsApp -->
            <a href="https://wa.me/56941870729" target="_blank"
              class="bg-white/20 text-white p-3 rounded-full hover:bg-green-500 hover:text-white transition-all duration-300 hover:scale-110">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 32 32">
                <path d="M16.001 2.667c-7.364 0-13.334 5.97-13.334 13.333 0 2.354.618 4.65 1.79 6.667l-1.884 5.47 5.646-1.854a13.28 13.28 0 0 0 7.782 2.384c7.364 0 13.334-5.97 13.334-13.333S23.365 2.667 16.001 2.667zm0 24.666a11.28 11.28 0 0 1-6.104-1.792l-.438-.271-3.354 1.102 1.104-3.229-.292-.5a11.28 11.28 0 0 1-1.688-5.938c0-6.229 5.063-11.292 11.292-11.292s11.292 5.063 11.292 11.292-5.063 11.292-11.292 11.292zm6.229-8.229c-.354-.177-2.104-1.042-2.438-1.167-.333-.125-.583-.177-.833.177-.25.354-.958 1.167-1.167 1.417-.208.25-.417.271-.771.094-.354-.177-1.5-.542-2.854-1.729-1.054-.938-1.771-2.083-1.979-2.438-.208-.354-.021-.542.156-.719.161-.161.354-.417.531-.625.177-.208.24-.354.354-.583.115-.229.057-.438-.031-.625-.094-.177-.833-2.021-1.146-2.771-.302-.729-.604-.625-.833-.625-.219 0-.438-.01-.667-.01-.229 0-.604.083-.917.417-.312.333-1.188 1.167-1.188 2.854s1.219 3.313 1.385 3.542c.167.229 2.396 3.646 5.813 5.104.812.354 1.438.562 1.927.719.812.26 1.552.219 2.135.135.646-.094 2.104-.854 2.396-1.677.292-.823.292-1.531.208-1.677-.083-.146-.312-.229-.667-.396z" />
              </svg>
            </a>
            <!-- Instagram -->
            <a href="https://www.instagram.com/tuusuario" target="_blank"
              class="bg-white/20 text-white p-3 rounded-full hover:bg-pink-500 hover:text-white transition-all duration-300 hover:scale-110">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.34 3.608 1.316.975.975 1.254 2.242 1.316 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.34 2.633-1.316 3.608-.975.975-2.242 1.254-3.608 1.316-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.34-3.608-1.316-.975-.975-1.254-2.242-1.316-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.34-2.633 1.316-3.608.975-.975 2.242-1.254 3.608-1.316C8.416 2.175 8.796 2.163 12 2.163zm0 1.837c-3.17 0-3.548.012-4.796.07-1.042.048-1.61.218-1.985.363-.5.195-.857.43-1.234.807-.377.377-.612.734-.807 1.234-.145.375-.315.943-.363 1.985-.058 1.248-.07 1.626-.07 4.796s.012 3.548.07 4.796c.048 1.042.218 1.61.363 1.985.195.5.43.857.807 1.234.377.377.734.612 1.234.807.375.145.943.315 1.985.363 1.248.058 1.626.07 4.796.07s3.548-.012 4.796-.07c1.042-.048 1.61-.218 1.985-.363.195-.5.43-.857.807-1.234.377-.377.734-.612-1.234-.807.145-.375.315-.943-.363-1.985.058-1.248.07-1.626.07-4.796s-.012-3.548-.07-4.796c-.048-1.042-.218-1.61-.363-1.985-.195-.5-.43-.857-.807-1.234-.377-.377-.734-.612-1.234-.807-.375-.145-.943-.315-1.985-.363-1.248-.058-1.626-.07-4.796-.07zm0 3.838a5.999 5.999 0 1 0 0 12 5.999 5.999 0 0 0 0-12zm0 9.838a3.839 3.839 0 1 1 0-7.678 3.839 3.839 0 0 1 0 7.678zm6.406-10.845a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
              </svg>
            </a>
            <!-- Facebook -->
            <a href="https://www.facebook.com/profile.php?id=100064931640451" target="_blank"
              class="bg-white/20 text-white p-3 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-110">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 
                                23.403.597 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 
                                1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 
                                0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.622h-3.12V24h6.116C23.403 
                                24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Horarios -->
        <div>
          <h3 class="font-bold text-lg mb-4 flex items-center">
            <span class="text-lib-yellow mr-2">🕒</span> Horarios
          </h3>
          <div class="space-y-2 text-blue-100">
            <p class="flex justify-between">
              <span>Lunes - Viernes</span>
              <span class="font-semibold">9:00 - 20:00</span>
            </p>
            <p class="flex justify-between">
              <span>Sábados</span>
              <span class="font-semibold">19:00 - 19:00</span>
            </p>
            <p class="flex justify-between">
              <span>Domingos</span>
              <span class="font-semibold text-lib-yellow">Cerrado</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-t border-blue-300/30 pt-8 text-center">
        <p class="text-blue-100">© 2025 Mundo Librería. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
  <div id="notification" class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 opacity-0 -translate-y-10">
    <div class="flex items-center">
      <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span id="notification-text">Producto agregado al carrito</span>
    </div>
  </div>

  <!-- Scripts -->
  <script src="../js/User/carousel.js"></script>
  <script src="../js/User/components.js"></script>
  <script src="../js/User/cargarProductosUser.js"></script>
  <script src="../js/User/contacto.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Handle "Add to Cart" button click
      const addToCartBtn = document.getElementById('addToCartBtn');
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
          const productId = this.dataset.productId;
          if (productId) {
            fetch('agregar_al_carrito.php', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'id_producto=' + productId
              })
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  // Update cart count
                  const cartCount = document.getElementById('cart-count');
                  if (cartCount) {
                    cartCount.textContent = data.count;
                  }
                  // Show notification
                  const notification = document.getElementById('notification');
                  const notificationText = document.getElementById('notification-text');
                  if (notification && notificationText) {
                    notificationText.textContent = 'Producto agregado al carrito';
                    notification.classList.remove('opacity-0', '-translate-y-10');
                    notification.classList.add('opacity-100', 'translate-y-0');
                    setTimeout(() => {
                      notification.classList.remove('opacity-100', 'translate-y-0');
                      notification.classList.add('opacity-0', '-translate-y-10');
                    }, 3000);
                  }
                } else {
                  // Handle error, e.g., show SweetAlert
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Error al agregar producto al carrito.'
                  });
                }
              })
              .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                  icon: 'error',
                  title: 'Error de Conexión',
                  text: 'No se pudo conectar con el servidor para añadir el producto.'
                });
              });
          }
        });
      }
    });
  </script>
</body>

</html>