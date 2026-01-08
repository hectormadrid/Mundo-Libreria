<?php
session_start();
// Verificar que sea administrador
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    header('Location: /pages/login_admin.php');
    exit;
}
require_once __DIR__ . '/../../db/Conexion.php';

// Obtener todos los productos para el dropdown
$productos = [];
$sql = "SELECT id, nombre, codigo_barras FROM productos ORDER BY nombre ASC";
$res = $conexion->query($sql);
while ($row = $res->fetch_assoc()) {
    $productos[] = $row;
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Generador de Códigos - Mundo Librería</title>
    <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/style/admin.css">
    <style>
        #barcode-container {
            padding: 2rem;
            background: white;
            border: 1px solid #ddd;
            text-align: center;
            width: 350px; /* Ancho fijo para la etiqueta */
        }
        .product-name {
            font-size: 1.1rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        .product-price {
            font-size: 1.25rem;
            font-weight: bold;
            margin-top: 0.5rem;
        }
        @media print {
            body * {
                visibility: hidden;
            }
            #print-area, #print-area * {
                visibility: visible;
            }
            #print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
        }
    </style>
</head>

<body class="bg-gray-100">

    <?php include '_sidebar.php'; ?>

    <section class="home-section">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-3xl font-bold">Generador de Códigos de Barras</h1>
        </div>

        <div class="bg-white rounded shadow p-6">
            <div class="mb-6">
                <label for="product-select" class="block text-gray-700 mb-2 font-bold">Selecciona un producto:</label>
                <select id="product-select" class="w-full max-w-lg px-3 py-2 border rounded">
                    <option value="">-- Elige un producto --</option>
                    <?php foreach ($productos as $producto) : ?>
                        <option value="<?php echo $producto['id']; ?>">
                            <?php echo htmlspecialchars($producto['nombre']); ?> (<?php echo htmlspecialchars($producto['codigo_barras'] ?? 'Sin código'); ?>)
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            
            <div id="print-area" class="flex justify-center items-center flex-col">
                <div id="barcode-container" class="hidden">
                    <div id="product-name" class="product-name"></div>
                    <svg id="barcode"></svg>
                    <div id="product-price" class="product-price"></div>
                </div>
            </div>

            <div class="mt-6 text-center">
                <button id="btnPrint" class="bg-green-600 text-white px-6 py-3 rounded hidden">
                    <i class="fas fa-print mr-2"></i>Imprimir Código
                </button>
            </div>
        </div>
    </section>

    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    <script src="/js/Admin/generadorCodigos.js"></script>
    <script src="/js/Admin/menu_admin.js"></script>

</body>
</html>