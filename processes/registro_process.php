<?php
include '../db/Conexcion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);

    // Verificar si el email ya existe
    $sql = "SELECT id FROM usuarios WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        header("Location: ../registrar.php?error=1");
        exit();
    }

    // Registrar usuario
    $sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $name, $email, $password);

    if ($stmt->execute()) {
        header("Location: ../login.php?success=1");
    } else {
        header("Location: ../registrar.php?error=1");
    }
    $stmt->close();
}
$conn->close();
?>