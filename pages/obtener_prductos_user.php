<?php
// archivo: php/obtener_productos_publico.php
header('Content-Type: application/json');
require_once __DIR__.'/../db/Conexion.php';

try {
   
    $query = "SELECT id, nombre, precio, descripcion, imagen FROM productos WHERE estado = 'Activo' LIMIT 8";
    $result = $conexion->query($query);
    
    $productos = [];
    while($row = $result->fetch_assoc()) {
        // Formatear la URL de la imagen
        $row['imagen_url'] = !empty($row['imagen']) 
            ? '/Mundo-Libreria/uploads/productos/'.$row['imagen'] 
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