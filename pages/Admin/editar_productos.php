<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../db/Conexion.php';
$categoriasPermitidas = ['Libreria', 'Oficina', 'Papeleria'];
$categoria = $_POST['categoria'] ?? '';
// Obtener datos del formulario
$id = $_POST['id'] ?? null;
$nombre = $_POST['nombre'] ?? '';
$precio = floatval($_POST['precio'] ?? 0);
$descripcion = $_POST['descripcion'] ?? '';
$categoria = $_POST['categoria'] ?? '';
$estado = $_POST['estado'] ?? 'Activo';
if (!in_array($categoria, $categoriasPermitidas)) {
    echo json_encode([
        'success' => false,
        'error' => 'Categoría no válida'
    ]);
    exit;
}
try {
    // Validación básica
    if (!$id || !is_numeric($id)) {
        throw new Exception("ID de producto no válido");
    }

    // Iniciar transacción
    $conexion->begin_transaction();

    // Consulta base de actualización
    $sql = "UPDATE productos SET 
            nombre = ?,
            precio = ?,
            descripcion = ?,
            categoria = ?,
            estado = ?";

    $params = [$nombre, $precio, $descripcion, $categoria, $estado];

    // Manejar imagen si se subió
    if (!empty($_FILES['imagen']['name'])) {
        // Validar tipo de archivo
        $permitidos = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($_FILES['imagen']['type'], $permitidos)) {
            throw new Exception("Formato de imagen no válido. Solo JPG, PNG o WEBP");
        }

        // Validar tamaño (2MB máximo)
        if ($_FILES['imagen']['size'] > 2097152) {
            throw new Exception("La imagen es demasiado grande (Máx. 2MB)");
        }

        // Generar nombre único
        $extension = pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
        $nombreImagen = 'producto_' . time() . '.' . $extension;
        $rutaDestino = __DIR__ . '../uploads/productos/' . $nombreImagen;

        // Mover archivo
        if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaDestino)) {
            throw new Exception("Error al guardar la imagen");
        }

        // Agregar imagen a la consulta
        $sql .= ", imagen = ?";
        $params[] = $nombreImagen;

        // Opcional: Eliminar imagen anterior si existe
        // (requeriría obtener primero el nombre de la imagen actual)
    }

    // Finalizar consulta
    $sql .= " WHERE id = ?";
    $params[] = $id;

    // Preparar y ejecutar
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    // Vincular parámetros dinámicamente
    $types = str_repeat('s', count($params));
    $stmt->bind_param($types, ...$params);

    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar producto: " . $stmt->error);
    }

    $conexion->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Producto actualizado correctamente'
    ]);

} catch (Exception $e) {
    $conexion->rollback();
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    $conexion->close();
}