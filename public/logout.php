<?php
require_once __DIR__ . '/../vendor/autoload.php';
use App\Helpers\SessionHelper;

// Cierra la sesión de forma completa y segura.
SessionHelper::destroy();

// Redirige a la página principal
header("Location: index.php");
exit();
