<?php
header('Content-Type: application/json');

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
    $requiredFields = ['nombre', 'precio', 'descripcion', 'categoria', 'estado', 'Stock'];
    foreach ($requiredFields as $field) {
        if (!isset($_POST[$field])) { // Verificar si existe primero
            throw new Exception("El campo $field es requerido");
        }
        if (empty(trim($_POST[$field]))) { // Validar que no esté vacío
            throw new Exception("El campo $field no puede estar vacío");
        }
    }

    // Procesar la imagen si fue enviada
    $nombreImagen = null;
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {

        // Validar tipo de archivo
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $_FILES['imagen']['tmp_name']);
        finfo_close($finfo);

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

    // Insertar en la base de datos
    $query = "INSERT INTO productos (nombre, precio, descripcion, categoria, estado, imagen,stock) VALUES (?, ?, ?, ?,?, ?,?)";
    $stmt = $conexion->prepare($query);

    if (!$stmt) {
        throw new Exception('Error al preparar la consulta: ' . $conexion->error);
    }

    // Sanitizar valores
    $nombre = trim($_POST['nombre']);
    $precio = (float)$_POST['precio'];
    $descripcion = trim($_POST['descripcion']);
    $categoria = trim($_POST['categoria']);
    $estado = in_array($_POST['estado'], ['Activo', 'Inactivo']) ? $_POST['estado'] : 'Activo';
    $Stock = (int)$_POST['Stock'];


    $stmt->bind_param(
        "sdssssi",
        $nombre,
        $precio,
        $descripcion,
        $categoria,
        $estado,
        $nombreImagen,
        $Stock
    );

    if ($stmt->execute()) {
        $response = [
            'success' => true,
            'message' => 'Producto agregado correctamente',
            'imagen' => $nombreImagen,
            'data' => [ // Estructura que DataTables espera para actualización
                'id' => $stmt->insert_id,
                'nombre' => $nombre,
                'precio' => $precio,
                'descripcion' => $descripcion,
                'categoria' => $categoria,
                'estado' => $estado,
                'Stock' => $Stock,
                'imagen' => $nombreImagen,

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
