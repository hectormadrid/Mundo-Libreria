<?php
require_once __DIR__ . '/../../db/SessionHelper.php';
SessionHelper::start();
require_once __DIR__.'/../../db/Conexion.php';
require_once __DIR__.'/../../db/SecurityHelper.php';

// Verificar sesión
if (!isset($_SESSION['ID'])) {
    header('Location: login.php');
    exit;
}

// Generar token CSRF si no existe
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
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
    
    // Obtener pedidos recientes
    $pedidos_recientes = [];
    $sql_pedidos = "SELECT id, total, estado, fecha FROM pedido WHERE id_usuario = ? ORDER BY fecha DESC LIMIT 3";
    $stmt_p = $conexion->prepare($sql_pedidos);
    $stmt_p->bind_param("i", $id_usuario);
    $stmt_p->execute();
    $res_p = $stmt_p->get_result();
    while ($row = $res_p->fetch_assoc()) {
        $pedidos_recientes[] = $row;
    }
    $stmt_p->close();
    
} catch (Exception $e) {
    $mensaje = "error:Error al cargar los datos: " . $e->getMessage();
}

// Procesar actualización del perfil
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // 1. VALIDACIÓN CSRF
    if (empty($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        $mensaje = "error:Error de seguridad CSRF. Inténtelo de nuevo.";
    } else {
        // 2. Sanitización y recolección
        $nombre = SecurityHelper::sanitize($_POST['nombre'] ?? '');
        $telefono = SecurityHelper::sanitize($_POST['telefono'] ?? '');
        $direccion = SecurityHelper::sanitize($_POST['direccion'] ?? '');
        
        // 3. Validaciones
        if (empty($nombre)) {
            $mensaje = "error:El nombre es obligatorio.";
        } elseif (!empty($telefono) && !SecurityHelper::validatePhone($telefono)) {
            $mensaje = "error:El formato de teléfono no es válido.";
        } else {
            try {
                $sql_update = "UPDATE usuario SET nombre = ?, telefono = ?, direccion = ? WHERE id = ?";
                $stmt_update = $conexion->prepare($sql_update);
                $stmt_update->bind_param("sssi", $nombre, $telefono, $direccion, $id_usuario);
                
                if ($stmt_update->execute()) {
                    $mensaje = "success:Perfil actualizado correctamente";
                    $_SESSION['nombre'] = $nombre;
                    // Recargar datos actualizados para la vista
                    $usuario['nombre'] = $nombre;
                    $usuario['telefono'] = $telefono;
                    $usuario['direccion'] = $direccion;
                } else {
                    $mensaje = "error:Error al actualizar el perfil";
                }
                $stmt_update->close();
                
            } catch (Exception $e) {
                $mensaje = "error:Error al procesar la actualización.";
            }
        }
    }
}
?>