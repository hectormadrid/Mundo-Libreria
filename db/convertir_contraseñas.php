<?php
require_once 'Conexion.php';

$sql = "SELECT id, password FROM Administrador";
$result = $conexion->query($sql);

while ($row = $result->fetch_assoc()) {
    $id = $row['id'];
    $plaintext = $row['password'];
    $hashed = password_hash($plaintext, PASSWORD_DEFAULT);

    $update = $conexion->prepare("UPDATE Administrador SET password = ? WHERE id = ?");
    $update->bind_param("si", $hashed, $id);
    $update->execute();
}
echo "Contraseñas actualizadas correctamente.";
?>