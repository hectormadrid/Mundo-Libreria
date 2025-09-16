<?php
// eliminar_usuario.php - Versión corregida
session_start();
header('Content-Type: application/json');
require_once __DIR__.'/../../db/Conexion.php';
// Verificar que sea administrador
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    header('Location: ../pages/login_admin.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;

    if (!$id) {
        echo json_encode(['success' => false, 'error' => 'ID no proporcionado']);
        exit;
    }

    try {
        // Verificar si el usuario existe primero
        $checkUserQuery = "SELECT id FROM usuario WHERE id = ?";
        $checkUserStmt = $conexion->prepare($checkUserQuery);
        $checkUserStmt->bind_param("i", $id);
        $checkUserStmt->execute();
        $userExists = $checkUserStmt->get_result()->num_rows > 0;

        if (!$userExists) {
            echo json_encode(['success' => false, 'error' => 'El usuario no existe']);
            exit;
        }

        // Verificar si el usuario tiene carrito activo
        $checkCartQuery = "SELECT COUNT(*) as count FROM carrito WHERE id_usuario = ?";
        $checkCartStmt = $conexion->prepare($checkCartQuery);
        $checkCartStmt->bind_param("i", $id);
        $checkCartStmt->execute();
        $hasCart = $checkCartStmt->get_result()->fetch_assoc()['count'] > 0;

        if ($hasCart) {
            echo json_encode(['success' => false, 'error' => 'El usuario tiene productos en el carrito']);
            exit;
        }

        // Eliminar usuario
        $deleteQuery = "DELETE FROM usuario WHERE id = ?";
        $deleteStmt = $conexion->prepare($deleteQuery);
        $deleteStmt->bind_param("i", $id);
        
        if ($deleteStmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Usuario eliminado correctamente']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Error al eliminar usuario']);
        }

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
}
?>