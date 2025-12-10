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

    $data = json_decode(file_get_contents('php://input'), true);
    $id_a_eliminar = $data['id'] ?? null;

    if (!$id_a_eliminar) {
        throw new Exception("ID de administrador no proporcionado.");
    }
    
    // 3. Prevenir que un administrador se elimine a sí mismo
    $id_sesion_actual = $_SESSION['ID'] ?? null;
    if ($id_a_eliminar == $id_sesion_actual) {
        throw new Exception("No puedes eliminar tu propia cuenta de administrador.");
    }

    // 4. Eliminar de la base de datos
    $sql = "DELETE FROM Administrador WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_a_eliminar);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Administrador eliminado correctamente.']);
        } else {
            throw new Exception("No se encontró ningún administrador con ese ID.");
        }
    } else {
        throw new Exception("Error al eliminar el administrador: " . $stmt->error);
    }
    
} catch (Exception $e) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conexion)) $conexion->close();
}
?>