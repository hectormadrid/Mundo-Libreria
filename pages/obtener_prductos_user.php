<?php
header('Content-Type: application/json');
require_once __DIR__.'/../db/Conexion.php';

try {
    $categoria_nombre = isset($_GET['categoria']) ? strtolower(trim($_GET['categoria'])) : '';

    $base_query = "
        SELECT 
            p.id, p.nombre, p.imagen, p.precio, p.descripcion, p.stock, c.nombre AS categoria 
        FROM 
            productos p
        LEFT JOIN 
            categorias c ON p.id_categoria = c.id
        WHERE 
            p.estado = 'Activo' AND p.stock > 0
    ";

    if (!empty($categoria_nombre)) {
        // Si se filtra por categoría, usamos un INNER JOIN implícito en el WHERE
        $query = "
            SELECT 
                p.id, p.nombre, p.imagen, p.precio, p.descripcion, p.stock, c.nombre AS categoria 
            FROM 
                productos p
            JOIN 
                categorias c ON p.id_categoria = c.id
            WHERE 
                p.estado = 'Activo' AND p.stock > 0 AND LOWER(c.nombre) = ?
            LIMIT 8
        ";
        $stmt = $conexion->prepare($query);
        $stmt->bind_param("s", $categoria_nombre);
    } else {
        // Sin filtro, trae todos los productos activos
        $query = $base_query . " LIMIT 8";
        $stmt = $conexion->prepare($query);
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
}
?>
