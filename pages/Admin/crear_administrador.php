<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../db/Conexion.php';

// 1. Verificar que sea administrador
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso no autorizado.']);
    exit;
}

try {
    // 2. Validar método y datos de entrada
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método no permitido");
    }

    $nombre = trim($_POST['nombre'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($nombre)) {
        throw new Exception("El nombre es obligatorio.");
    }
    if (empty($password)) {
        throw new Exception("La contraseña es obligatoria.");
    }
    if (strlen($password) < 4) {
        throw new Exception("La contraseña debe tener al menos 4 caracteres.");
    }
    
    // 3. Verificar si el administrador ya existe
    $stmt = $conexion->prepare("SELECT id FROM Administrador WHERE nombre = ?");
    $stmt->bind_param("s", $nombre);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        throw new Exception("Ya existe un administrador con ese nombre.");
    }
    $stmt->close();
    
    // 4. Hashear la contraseña
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $tipo = 'administrador';

    // 5. Insertar en la base de datos
    $sql = "INSERT INTO Administrador (nombre, tipo, password) VALUES (?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("sss", $nombre, $tipo, $hashed_password);

    if ($stmt->execute()) {
        http_response_code(201); // Created
        echo json_encode(['success' => true, 'message' => 'Administrador creado correctamente.']);
    } else {
        throw new Exception("Error al crear el administrador: " . $stmt->error);
    }
    
} catch (Exception $e) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conexion)) $conexion->close();
}
?>