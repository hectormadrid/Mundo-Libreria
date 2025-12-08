<?php
session_start();
require_once __DIR__.'/../../db/Conexion.php';

// Verificar sesión
if (!isset($_SESSION['ID'])) {
    header('Location: login.php');
    exit;
}

$id_usuario = $_SESSION['ID'];
$usuario = null;
$mensaje = '';

// Obtener datos del usuario
try {
    $sql = "SELECT id, rut, nombre, correo, telefono, direccion FROM usuario WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $usuario = $result->fetch_assoc();
    }
    $stmt->close();
    
} catch (Exception $e) {
    $mensaje = "error:Error al cargar los datos: " . $e->getMessage();
}

// Procesar actualización del perfil
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = trim($_POST['nombre']);
    $telefono = trim($_POST['telefono']);
    $direccion = trim($_POST['direccion']);
    
    try {
        $sql_update = "UPDATE usuario SET nombre = ?, telefono = ?, direccion = ? WHERE id = ?";
        $stmt_update = $conexion->prepare($sql_update);
        $stmt_update->bind_param("sssi", $nombre, $telefono, $direccion, $id_usuario);
        
        if ($stmt_update->execute()) {
            $mensaje = "success:Perfil actualizado correctamente";
            $_SESSION['nombre'] = $nombre;
            header('Location: perfilUser.php?success=1');
            exit;
        } else {
            $mensaje = "error:Error al actualizar el perfil";
        }
        $stmt_update->close();
        
    } catch (Exception $e) {
        $mensaje = "error:Error: " . $e->getMessage();
    }
}
?>