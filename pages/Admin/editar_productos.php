<?php
// Especificar que la respuesta será JSON
header('Content-Type: application/json');

// Iniciar sesión para validar el rol de administrador
session_start();
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    http_response_code(403); // Forbidden
    echo json_encode(['success' => false, 'error' => 'Acceso denegado. Se requiere ser administrador.']);
    exit;
}

// Incluir la conexión a la base de datos
require_once __DIR__ . '/../../db/Conexion.php';

// Validar que la petición sea de tipo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'error' => 'Método no permitido.']);
    exit;
}

// --- Captura y saneamiento de datos ---
$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'error' => 'El ID del producto es inválido.']);
    exit;
}

$nombre = trim($_POST['nombre'] ?? '');
$descripcion = trim($_POST['descripcion'] ?? ''); // ¡Capturando la descripción!
$precio = filter_input(INPUT_POST, 'precio', FILTER_VALIDATE_FLOAT);
$stock = filter_input(INPUT_POST, 'stock', FILTER_VALIDATE_INT);
$id_categoria = filter_input(INPUT_POST, 'id_categoria', FILTER_VALIDATE_INT);

// --- Corrección para 'id_familia' ---
// Si 'id_familia' se envía vacío (cuando 'sin familia' está marcado), debe ser NULL
$id_familia = null;
if (isset($_POST['id_familia']) && !empty($_POST['id_familia'])) {
    $id_familia = (int)$_POST['id_familia'];
}
// --- Fin de la corrección ---

$codigo_barras = trim($_POST['codigo_barras'] ?? '');
$marca = trim($_POST['marca'] ?? '');
$color = trim($_POST['color'] ?? '');
$estado = trim(strtolower($_POST['estado'] ?? '')); // ¡Capturando y normalizando el estado!

// Validar que el estado sea 'activo' o 'inactivo'
if (!in_array($estado, ['activo', 'inactivo'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Estado no válido. Debe ser "Activo" o "Inactivo".']);
    exit;
}

// --- Lógica de la base de datos ---
try {
    $uploadDir = __DIR__ . '/../../uploads/productos/';
    $imagenNombre = null;
    $imagenCambiada = false;

    // 1. OBTENER IMAGEN ACTUAL ANTES DE CUALQUIER CAMBIO
    $stmt_get = $conexion->prepare("SELECT imagen FROM productos WHERE id = ?");
    $stmt_get->bind_param('i', $id);
    $stmt_get->execute();
    $res_get = $stmt_get->get_result();
    $producto_actual = $res_get->fetch_assoc();
    $imagenAntigua = $producto_actual['imagen'] ?? null;
    $stmt_get->close();
    
    $imagenNombre = $imagenAntigua; // Por defecto, mantenemos la imagen antigua

    // 2. VERIFICAR SI SE SUBIÓ UNA NUEVA IMAGEN
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $imagenCambiada = true;
        // Validar y mover la nueva imagen
        $tmp_name = $_FILES['imagen']['tmp_name'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $tmp_name);
        $allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

        if (!array_key_exists($mimeType, $allowedTypes)) {
            throw new Exception("Tipo de archivo no permitido.");
        }
        if ($_FILES['imagen']['size'] > 2 * 1024 * 1024) { // 2MB
            throw new Exception("La imagen excede el límite de 2MB.");
        }

        $extension = $allowedTypes[$mimeType];
        $nuevoNombre = 'producto_' . time() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
        
        if (!move_uploaded_file($tmp_name, $uploadDir . $nuevoNombre)) {
            throw new Exception("Error al guardar la nueva imagen.");
        }
        $imagenNombre = $nuevoNombre; // Usamos el nuevo nombre para la DB
    }

    // 3. CONSTRUIR Y EJECUTAR LA ACTUALIZACIÓN
    $sql = "UPDATE productos SET 
                nombre = ?,
                descripcion = ?,
                precio = ?,
                stock = ?,
                id_categoria = ?,
                id_familia = ?,
                codigo_barras = ?,
                marca = ?,
                color = ?,
                estado = ?,
                imagen = ? 
            WHERE id = ?";

    $stmt = $conexion->prepare($sql);
    
    $stmt->bind_param(
        "ssdiissssssi", // s para la imagen al final
        $nombre,
        $descripcion,
        $precio,
        $stock,
        $id_categoria,
        $id_familia, // Usar la variable corregida
        $codigo_barras,
        $marca,
        $color,
        $estado,
        $imagenNombre, // La variable que contiene el nombre de la imagen (nueva o antigua)
        $id
    );

    if (!$stmt->execute()) {
        // Si la actualización falla, y subimos una nueva imagen, la borramos
        if ($imagenCambiada && file_exists($uploadDir . $imagenNombre)) {
            @unlink($uploadDir . $imagenNombre);
        }
        throw new Exception("Error al ejecutar la actualización: " . $stmt->error);
    }

    // 4. SI TODO FUE BIEN Y LA IMAGEN CAMBIÓ, BORRAR LA ANTIGUA
    if ($imagenCambiada && $imagenAntigua && file_exists($uploadDir . $imagenAntigua)) {
        @unlink($uploadDir . $imagenAntigua);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Producto actualizado correctamente.',
    ]);

} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);

} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conexion)) $conexion->close();
}
?>