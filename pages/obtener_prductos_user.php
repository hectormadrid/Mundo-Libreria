<?php
header('Content-Type: application/json');
require_once __DIR__.'/../db/Conexion.php';

try {
    $categoria_nombre = isset($_GET['categoria']) ? strtolower(trim($_GET['categoria'])) : '';
    $familia_id = isset($_GET['familia_id']) ? (int)$_GET['familia_id'] : 0;

    $query = "
        SELECT 
            p.id, p.nombre, p.imagen, p.precio, p.descripcion, p.stock, p.marca, p.color, c.nombre AS categoria 
        FROM 
            productos p
        LEFT JOIN 
            categorias c ON p.id_categoria = c.id
    ";

    $conditions = ["p.estado = 'Activo'", "p.stock > 0"];
    $params = [];
    $types = "";

    if (!empty($categoria_nombre)) {
        // Necesitamos un JOIN explícito si filtramos por nombre de categoría
        $conditions[] = "LOWER(c.nombre) = ?";
        $params[] = $categoria_nombre;
        $types .= "s";
    }

    if ($familia_id > 0) {
        $conditions[] = "p.id_familia = ?";
        $params[] = $familia_id;
        $types .= "i";
    }

    if (count($conditions) > 0) {
        $query .= " WHERE " . implode(" AND ", $conditions);
    }

    $query .= " ORDER BY p.id DESC LIMIT 12"; // Aumentado el límite para mejor visualización

    $stmt = $conexion->prepare($query);

    if (!empty($types)) {
        $stmt->bind_param($types, ...$params);
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
        "error" => "Error: " . $e->getMessage()
    ]);
} finally {
    if(isset($conexion)) {
        $conexion->close();
    }
}
?>
