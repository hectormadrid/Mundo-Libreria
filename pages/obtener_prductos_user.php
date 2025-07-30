<?php
header('Content-Type: application/json');
require_once __DIR__.'/../db/Conexion.php';

try {
    // Verifica si se pasó una categoría por GET
   $categoria = isset($_GET['categoria']) ? strtolower(trim($_GET['categoria'])) : '';

    // Prepara la consulta con o sin filtro de categoría
    if (!empty($categoria)) {
        $stmt = $conexion->prepare("SELECT id, nombre, imagen, precio, descripcion, categoria FROM productos WHERE estado = 'Activo' AND LOWER(categoria) = ?  LIMIT 8");
        $stmt->bind_param("s", $categoria);
    } else {
        $stmt = $conexion->prepare("SELECT id, nombre, imagen, precio, descripcion, categoria FROM productos WHERE estado = 'Activo' LIMIT 8");
    }
if (!empty($categoria)) {
    // filtra por categoría
} else {
    // trae todos los productos
}

    $stmt->execute();
    $result = $stmt->get_result();

    $productos = [];
    while($row = $result->fetch_assoc()) {
        $row['imagen_url'] = !empty($row['imagen']) 
            ? '/Mundo-Libreria/uploads/productos/' . $row['imagen'] 
            : '/Mundo-Libreria/assets/placeholder-producto.jpg';
        $productos[] = $row;
    }

    echo json_encode([
        "success" => true,
        "data" => $productos
    ]);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
