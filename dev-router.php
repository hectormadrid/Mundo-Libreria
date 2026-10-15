<?php
/**
 * Router para el servidor embebido de PHP, solo para desarrollo (no lee .htaccess).
 * Uso:  php -S 127.0.0.1:8000 -t public dev-router.php
 */

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (str_starts_with($path, '/api')) {
    require __DIR__ . '/public/api/index.php';
    return true;
}

// Archivos reales (imágenes, build de React): los sirve el propio servidor.
if ($path !== '/' && is_file(__DIR__ . '/public' . $path)) {
    return false;
}

// Cualquier otra ruta es una página de la app de React.
readfile(__DIR__ . '/public/index.html');
return true;
