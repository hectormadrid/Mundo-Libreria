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
$id_familia = filter_input(INPUT_POST, 'id_familia', FILTER_VALIDATE_INT);
$codigo_barras = trim($_POST['codigo_barras'] ?? '');
$estado = trim(strtolower($_POST['estado'] ?? '')); // ¡Capturando y normalizando el estado!

// Validar que el estado sea 'activo' o 'inactivo'
if (!in_array($estado, ['activo', 'inactivo'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Estado no válido. Debe ser "Activo" o "Inactivo".']);
    exit;
}

// --- Lógica de la base de datos ---
try {
    // Manejo de imagen (simplificado para el ejemplo, puedes expandirlo)
    // Por ahora, esta query no actualiza la imagen para enfocarnos en el bug principal.
    
    $sql = "UPDATE productos SET 
                nombre = ?,
                descripcion = ?,
                precio = ?,
                stock = ?,
                id_categoria = ?,
                id_familia = ?,
                codigo_barras = ?,
                estado = ?
            WHERE id = ?";

    $stmt = $conexion->prepare($sql);
    
    // Asignar null si la familia no se seleccionó
    $id_familia_final = $id_familia ?: null;

    // "sdsiiissi" -> string, double, string, integer, integer, integer, string, string, integer
    $stmt->bind_param(
        "ssdiisssi",
        $nombre,
        $descripcion,
        $precio,
        $stock,
        $id_categoria,
        $id_familia_final,
        $codigo_barras,
        $estado,
        $id
    );

    if (!$stmt->execute()) {
        throw new Exception("Error al ejecutar la actualización: " . $stmt->error);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Producto actualizado correctamente.',
        'data_received' => $_POST // Devolver lo que se recibió para depurar
    ]);

} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);

} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conexion)) $conexion->close();
}
?>