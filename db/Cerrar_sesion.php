<?php
require_once __DIR__ . '/SessionHelper.php';
SessionHelper::start();

// Cierra la sesión de forma completa y segura.
SessionHelper::destroy();

// Redirige a la página principal
header("Location: ../pages/index.php");
exit();
?>