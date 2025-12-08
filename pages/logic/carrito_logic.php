<?php
// Iniciar la sesión para acceder a las variables de sesión del usuario.
session_start();

// Incluir el archivo de conexión a la base de datos.
// Se utiliza __DIR__ para asegurar que la ruta sea relativa al archivo actual.
require_once __DIR__ . '/../../db/Conexion.php';

// --- VERIFICACIONES DE SEGURIDAD Y ESTADO ---

// Verificar si la conexión a la base de datos se estableció correctamente.
// Si no, termina la ejecución y muestra un error.
if (!isset($conexion) || !$conexion) {
    // Es una buena práctica registrar este error en un archivo de logs en un entorno de producción.
    die("Error de conexión a la base de datos.");
}

// Verificar si el usuario ha iniciado sesión.
// Si no hay un ID de usuario en la sesión, se le redirige a la página de login.
if (!isset($_SESSION['ID'])) {
    header('Location: login.php');
    exit; // Detiene la ejecución del script para evitar que se procese más código.
}

// --- OBTENCIÓN DE DATOS DEL CARRITO ---

// Obtener el ID del usuario de la sesión y asegurarse de que sea un entero.
$id_usuario = (int) $_SESSION['ID'];

// Preparar la consulta SQL para obtener los productos del carrito del usuario.
// Se usa un JOIN para combinar la información del carrito con los detalles de los productos.
$sql = "
    SELECT p.id, p.nombre, p.precio, p.imagen, c.cantidad
    FROM carrito c
    JOIN productos p ON c.id_producto = p.id
    WHERE c.id_usuario = ?
";

// Preparar la sentencia para evitar inyección SQL.
$stmt = $conexion->prepare($sql);
if (!$stmt) {
    // Si la preparación de la consulta falla, es un error del servidor.
    die("Error al preparar la consulta: " . $conexion->error);
}

// Vincular el ID del usuario al parámetro de la consulta. 'i' significa que es un tipo entero.
$stmt->bind_param("i", $id_usuario);

// Ejecutar la consulta.
if (!$stmt->execute()) {
    die("Error al ejecutar la consulta: " . $stmt->error);
}

// Obtener los resultados de la consulta.
$result = $stmt->get_result();

// --- PROCESAMIENTO DE LOS DATOS ---

// Inicializar un array para guardar los productos del carrito y el total.
$carrito_items = [];
$total = 0;

// Iterar sobre cada fila (producto) obtenida de la base de datos.
while ($row = $result->fetch_assoc()) {
    // Realizar un 'casteo' explícito para asegurar que los tipos de datos son correctos.
    $row['precio'] = (float) $row['precio'];
    $row['cantidad'] = (int) $row['cantidad'];
    
    // Calcular el subtotal para este producto.
    $row['subtotal'] = $row['precio'] * $row['cantidad'];

    // Acumular el subtotal al total general del carrito.
    $total += $row['subtotal'];
    
    // Añadir el producto procesado al array de items del carrito.
    $carrito_items[] = $row;
}

// Cerrar la sentencia para liberar recursos.
$stmt->close();

// Variable booleana para facilitar la comprobación en la vista si el carrito tiene productos o no.
$hasItems = !empty($carrito_items);

?>
