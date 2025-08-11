<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../../db/Conexion.php';

// Verificar autenticación
if (!isset($_SESSION['ID'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
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
    $stock = filter_input(INPUT_POST, 'Stock', FILTER_VALIDATE_INT);
    $categoria = $_POST['categoria'] ?? '';
    $estado = $_POST['estado'] ?? 'Activo';

    // Validaciones básicas
    if (!$id || $id <= 0) {
        throw new Exception("ID de producto no válido");
    }

    if (empty($nombre)) {
        throw new Exception("El nombre es obligatorio");
    }

    if (!$precio || $precio <= 0) {
        throw new Exception("El precio debe ser un número positivo");
    }

    if ($stock === false || $stock < 0) {
        throw new Exception("El stock debe ser un número entero no negativo");
    }

    if (!in_array($categoria, $categoriasPermitidas)) {
        throw new Exception("Categoría no válida");
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
    $sql = "UPDATE productos SET 
            nombre = ?,
            precio = ?,
            descripcion = ?,
            categoria = ?,
            Stock = ?,
            estado = ?";
    
    $params = [$nombre, $precio, $descripcion, $categoria, $stock, $estado];
    $types = "ssssis"; // Tipos: string, string, string, string, integer, string
    
    if ($nombreImagen) {
        $sql .= ", imagen = ?";
        $params[] = $nombreImagen;
        $types .= "s"; // Agregar tipo string para la imagen
    }
    
    $sql .= " WHERE id = ?";
    $params[] = $id;
    $types .= "i"; // Agregar tipo integer para el ID

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