<?php
session_start();
header('Content-Type: application/json');

// Verificar que sea administrador
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso no autorizado.']);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// Configuración para subida de imágenes
$uploadDir = __DIR__ . '/../../uploads/productos/';
$allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
$maxSize = 2 * 1024 * 1024; // 2MB



try {
    require_once(__DIR__ . '/../../db/Conexion.php');

    // Validar campos obligatorios
    $requiredFields = ['nombre', 'precio', 'descripcion', 'id_categoria', 'estado', 'Stock'];
    foreach ($requiredFields as $field) {
        if (!isset($_POST[$field])) { // Verificar si existe primero
            throw new Exception("El campo $field es requerido");
        }
        if ($field !== 'id_categoria' && empty(trim($_POST[$field]))) { // Validar que no esté vacío, excepto para id_categoria que puede ser 0
            throw new Exception("El campo $field no puede estar vacío");
        }
    }

    // Procesar la imagen si fue enviada
    $nombreImagen = null;
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {

        // Validar tipo de archivo
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $_FILES['imagen']['tmp_name']);

        if (!array_key_exists($mimeType, $allowedTypes)) {
            throw new Exception("Tipo de archivo no permitido. Use JPG, PNG o WEBP");
        }

        // Validar tamaño
        if ($_FILES['imagen']['size'] > $maxSize) {
            throw new Exception("El tamaño excede el límite de 2MB");
        }

        // Crear directorio si no existe
        if (!file_exists($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                throw new Exception("No se pudo crear el directorio de uploads");
            }
        }

        // Generar nombre único
        $extension = $allowedTypes[$mimeType];
        $nombreImagen = 'producto_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
        $uploadPath = $uploadDir . $nombreImagen;

        // Mover archivo
        if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $uploadPath)) {
            throw new Exception("Error al guardar la imagen en el servidor");
        }
    }

    // Lógica para el código de barras
    $codigo_barras = isset($_POST['codigo_barras']) ? trim($_POST['codigo_barras']) : '';

    if (empty($codigo_barras)) {
        // Generar un código de barras único si está vacío
        do {
            // Genera un código de 13 dígitos con prefijo 'ML'
            $generated_barcode = 'ML' . str_pad(mt_rand(1, 99999999999), 11, '0', STR_PAD_LEFT);
            
            // Verificar si ya existe
            $check_stmt = $conexion->prepare("SELECT id FROM productos WHERE codigo_barras = ?");
            $check_stmt->bind_param("s", $generated_barcode);
            $check_stmt->execute();
            $check_stmt->store_result();
            $is_unique = ($check_stmt->num_rows === 0);
            $check_stmt->close();

        } while (!$is_unique);
        $codigo_barras = $generated_barcode;
    } else {
        // Si se proporciona un código, verificar que no exista
        $check_stmt = $conexion->prepare("SELECT id FROM productos WHERE codigo_barras = ?");
        $check_stmt->bind_param("s", $codigo_barras);
        $check_stmt->execute();
        $check_stmt->store_result();
        if ($check_stmt->num_rows > 0) {
            throw new Exception("El código de barras ingresado ya existe.");
        }
        $check_stmt->close();
    }

    // Insertar en la base de datos
    $query = "INSERT INTO productos (nombre, codigo_barras, id_categoria, id_familia, precio, descripcion, marca, color, estado, imagen, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($query);

    if (!$stmt) {
        throw new Exception('Error al preparar la consulta: ' . $conexion->error);
    }

    // Sanitizar valores
    $nombre = trim($_POST['nombre']);
    $precio = (float)$_POST['precio'];
    $descripcion = trim($_POST['descripcion']);
    $marca = isset($_POST['marca']) && !empty(trim($_POST['marca'])) ? trim($_POST['marca']) : null;
    $color = isset($_POST['color']) && !empty(trim($_POST['color'])) ? trim($_POST['color']) : null;
    $id_categoria = (int)$_POST['id_categoria'];
    $id_familia = isset($_POST['id_familia']) && !empty($_POST['id_familia']) ? (int)$_POST['id_familia'] : null;
    
    $estado_raw = $_POST['estado'] ?? ''; // Obtener estado, por defecto cadena vacía
    $estado = strtolower($estado_raw); // Convertir a minúsculas
    // Validar y establecer por defecto si es inválido
    if (!in_array($estado, ['activo', 'inactivo'])) {
        $estado = 'activo'; // Por defecto 'activo'
    }
    $Stock = (int)$_POST['Stock'];

    $stmt->bind_param(
        "ssiidsssssi",
        $nombre,
        $codigo_barras,
        $id_categoria,
        $id_familia,
        $precio,
        $descripcion,
        $marca,
        $color,
        $estado,
        $nombreImagen,
        $Stock
    );

    if ($stmt->execute()) {
        // Obtener el nombre de la categoría para la respuesta
        $categoriaNombre = '';
        if ($id_categoria > 0) {
            $cat_stmt = $conexion->prepare("SELECT nombre FROM categorias WHERE id = ?");
            $cat_stmt->bind_param("i", $id_categoria);
            $cat_stmt->execute();
            $cat_res = $cat_stmt->get_result();
            if ($cat_row = $cat_res->fetch_assoc()) {
                $categoriaNombre = $cat_row['nombre'];
            }
            $cat_stmt->close();
        }

        $response = [
            'success' => true,
            'message' => 'Producto agregado correctamente',
            'imagen' => $nombreImagen,
            'data' => [ 
                'id' => $stmt->insert_id,
                'nombre' => $nombre,
                'precio' => $precio,
                'descripcion' => $descripcion,
                'marca' => $marca,
                'color' => $color,
                'id_categoria' => $id_categoria,
                'categoria' => $categoriaNombre, // Enviar también el nombre para la tabla
                'estado' => $estado,
                'Stock' => $Stock,
                'imagen' => $nombreImagen,
                'codigo_barras' => $codigo_barras
            ]
        ];
        echo json_encode($response);
    } else {
        // Si hay error en la BD, eliminar la imagen subida (si existe)
        if ($nombreImagen && file_exists($uploadPath)) {
            unlink($uploadPath);
        }
        throw new Exception('Error al ejecutar la consulta: ' . $stmt->error);
    }
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conexion)) $conexion->close();
}
