<?php
// 1. Incluir la conexión a la base de datos
include("../db/Conexion.php"); // Asegúrate de que la ruta sea correcta

// 2. Consulta SQL para obtener los productos
$query = "SELECT * FROM productos"; // Cambia "productos" por tu tabla real
$result = $conexion->query($query);

// 3. Verificar si hay resultados
if ($result->num_rows > 0) {
    $productos = array();
    while ($row = $result->fetch_assoc()) {
        $productos[] = $row;
    }
    // 4. Devolver los datos en formato JSON
    header('Content-Type: application/json');
    echo json_encode($productos);
} else {
    echo json_encode(array()); // Si no hay datos, devuelve un array vacío
}

// 5. Cerrar la conexión
$conexion->close();
?>