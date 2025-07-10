<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); // Solo para desarrollo

try {
    require_once __DIR__.'/../db/Conexion.php';
    
  
    $query = "SELECT * FROM productos";
    $result = $conexion->query($query);
    
    $data = [];
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "data" => $data,
        "debug" => [
            "request_time" => date('Y-m-d H:i:s'),
            "row_count" => count($data)
        ]
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

?>
