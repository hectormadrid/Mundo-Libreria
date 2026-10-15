<?php
/**
 * Migración única: la versión anterior guardaba textos con htmlspecialchars()
 * (por ejemplo "O&#039;Higgins"). React escapa al mostrar, así que esos textos
 * se verían con las entidades. Este script los devuelve a texto normal.
 *
 * Uso (desde la raíz del proyecto):  php database/decodificar_entidades.php
 */

if (PHP_SAPI !== 'cli') {
    exit("Este script solo se ejecuta desde la línea de comandos.\n");
}

require_once __DIR__ . '/../vendor/autoload.php';

use App\Database\Conexion;
use App\Helpers\EnvLoader;

EnvLoader::load(__DIR__ . '/../.env');
$db = Conexion::getConnection();

$tablas = [
    'usuario' => ['rut', 'nombre', 'correo', 'telefono', 'direccion'],
    'productos' => ['nombre', 'descripcion', 'marca', 'color', 'codigo_barras'],
    'categorias' => ['nombre'],
    'familias' => ['nombre'],
];

$total = 0;
foreach ($tablas as $tabla => $columnas) {
    $rows = $db->query("SELECT id, " . implode(', ', $columnas) . " FROM `$tabla`")->fetch_all(MYSQLI_ASSOC);
    foreach ($rows as $row) {
        $cambios = [];
        foreach ($columnas as $columna) {
            $valor = $row[$columna];
            if ($valor === null || !str_contains($valor, '&')) {
                continue;
            }
            $decodificado = html_entity_decode($valor, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            if ($decodificado !== $valor) {
                $cambios[$columna] = $decodificado;
            }
        }
        if (!$cambios) {
            continue;
        }
        $set = implode(', ', array_map(fn($c) => "`$c` = ?", array_keys($cambios)));
        $stmt = $db->prepare("UPDATE `$tabla` SET $set WHERE id = ?");
        $valores = [...array_values($cambios), (int) $row['id']];
        $stmt->bind_param(str_repeat('s', count($cambios)) . 'i', ...$valores);
        $stmt->execute();
        $total++;
        echo "$tabla #{$row['id']}: " . implode(', ', array_keys($cambios)) . "\n";
    }
}

echo "Listo. Filas actualizadas: $total\n";
