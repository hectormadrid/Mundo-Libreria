<?php
session_start();
include '../db/Conexcion.php';

// Validar datos recibidos
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password'];

    // 1. Consulta preparada para seguridad
    $sql = "SELECT id, email, password FROM usuarios WHERE email = ?";
    $stmt = $conn->prepare($sql);
    
    if ($stmt) {
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        // 2. Verificar si el usuario existe
        if ($result->num_rows == 1) {
            $usuario = $result->fetch_assoc();
            
            // 3. Validar contraseña (asumiendo que está hasheada)
            if (password_verify($password, $usuario['password'])) {
                $_SESSION['user_id'] = $usuario['id'];
                $_SESSION['user_email'] = $usuario['email'];
                
                // 4. Redirigir al index
                header("Location: ../pages/index.php");
                exit();
            } else {
                $error = "Contraseña incorrecta";
            }
        } else {
            $error = "Usuario no encontrado";
        }
    } else {
        $error = "Error en la consulta SQL: " . $conn->error;
    }
}

// Si hay errores, regresar al login con mensaje
$_SESSION['login_error'] = $error ?? "Error desconocido";
header("Location: ../login.php");
exit();
?>