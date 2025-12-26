<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../../db/Conexion.php';

// Verificar que sea administrador
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso no autorizado.']);
    exit;
}
// Habilitar reporte de errores para depuración
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Categorías permitidas
$categoriasPermitidas = ['Libreria', 'Oficina', 'Papeleria'];

try {
    // Validar método HTTP
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método no permitido");
    }

    // Validar y sanitizar datos de entrada
    $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    $nombre = trim($_POST['nombre'] ?? '');
    $precio = filter_input(INPUT_POST, 'precio', FILTER_VALIDATE_FLOAT);
    $descripcion = trim($_POST['descripcion'] ?? '');
    $stock = filter_input(INPUT_POST, 'stock', FILTER_VALIDATE_INT);
    $id_categoria = filter_input(INPUT_POST, 'id_categoria', FILTER_VALIDATE_INT);
    $estado = $_POST['estado'] ?? 'activo';

    // Validaciones básicas
    if (!$id || $id <= 0) throw new Exception("ID de producto no válido");
    if (empty($nombre)) throw new Exception("El nombre es obligatorio");
    if (!$precio || $precio <= 0) throw new Exception("El precio debe ser un número positivo");
    if ($stock === false || $stock < 0) throw new Exception("El stock debe ser un número entero no negativo");
    if (!$id_categoria) throw new Exception("La categoría es obligatoria");

    // Validar código de barras
    $codigo_barras = trim($_POST['codigo_barras'] ?? '');
    if (!empty($codigo_barras)) {
        $check_stmt = $conexion->prepare("SELECT id FROM productos WHERE codigo_barras = ? AND id != ?");
        $check_stmt->bind_param("si", $codigo_barras, $id);
        $check_stmt->execute();
        $check_stmt->store_result();
        if ($check_stmt->num_rows > 0) {
            throw new Exception("El código de barras ingresado ya está en uso por otro producto.");
        }
        $check_stmt->close();
    }

    // Iniciar transacción
    $conexion->begin_transaction();

    // Obtener imagen anterior si existe
    $stmt = $conexion->prepare("SELECT imagen FROM productos WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $imagenAnterior = $result->num_rows > 0 ? $result->fetch_assoc()['imagen'] : null;
    $stmt->close();

    // Manejar nueva imagen si se subió
    $nombreImagen = null;
    if (!empty($_FILES['imagen']['name']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        // Validar tipo real del archivo
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeReal = finfo_file($finfo, $_FILES['imagen']['tmp_name']);
        finfo_close($finfo);
        
        $permitidos = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        if (!array_key_exists($mimeReal, $permitidos)) {
            throw new Exception("Formato de imagen no válido. Solo JPG, PNG o WEBP");
        }

        // Validar tamaño (2MB máximo)
        if ($_FILES['imagen']['size'] > 2097152) {
            throw new Exception("La imagen es demasiado grande (Máx. 2MB)");
        }

        // Generar nombre único
        $extension = $permitidos[$mimeReal];
        $nombreImagen = 'producto_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
        $rutaDestino = __DIR__ . '/../../uploads/productos/' . $nombreImagen;

        // Crear directorio si no existe
        if (!file_exists(dirname($rutaDestino))) {
            if (!mkdir(dirname($rutaDestino), 0755, true)) {
                throw new Exception("No se pudo crear el directorio para la imagen");
            }
        }

        // Mover archivo
        if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaDestino)) {
            throw new Exception("Error al guardar la imagen en el servidor");
        }

        // Eliminar imagen anterior si existe
        if ($imagenAnterior && file_exists(__DIR__ . '/../../uploads/productos/' . $imagenAnterior)) {
            unlink(__DIR__ . '/../../uploads/productos/' . $imagenAnterior);
        }
    }

    // Construir consulta SQL
    $id_familia = isset($_POST['id_familia']) && !empty($_POST['id_familia']) ? (int)$_POST['id_familia'] : null;

    $sql = "UPDATE productos SET 
            nombre = ?,
            codigo_barras = ?,
            id_categoria = ?,
            id_familia = ?,
            precio = ?,
            descripcion = ?,
            stock = ?,
            estado = ?";
    
    $codigo_barras_or_null = !empty($codigo_barras) ? $codigo_barras : null;
    $params = [$nombre, $codigo_barras_or_null, $id_categoria, $id_familia, $precio, $descripcion, $stock, $estado];
    $types = "ssiidisi"; // s:nombre, s:codigo_barras, i:id_cat, i:id_familia, d:precio, s:desc, i:stock, s:estado

    if ($nombreImagen) {
        $sql .= ", imagen = ?";
        $params[] = $nombreImagen;
        $types .= "s";
    }
    
    $sql .= " WHERE id = ?";
    $params[] = $id;
    $types .= "i";

    // Preparar y ejecutar consulta
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    $stmt->bind_param($types, ...$params);

    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar producto: " . $stmt->error);
    }

    $conexion->commit();

    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Producto actualizado correctamente',
        'data' => [
            'id' => $id,
            'imagen' => $nombreImagen ?? $imagenAnterior
        ]
    ]);

} catch (Exception $e) {
    // Revertir transacción en caso de error
    if (isset($conexion) && $conexion instanceof mysqli) {
        $conexion->rollback();
    }
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => [
            'post_data' => $_POST,
            'files' => !empty($_FILES) ? 'Archivo recibido' : 'Sin archivo'
        ]
    ]);
} finally {
    // Cerrar conexiones
    if (isset($stmt) && $stmt instanceof mysqli_stmt) {
        $stmt->close();
    }
    if (isset($conexion) && $conexion instanceof mysqli) {
        $conexion->close();
    }
}
?>