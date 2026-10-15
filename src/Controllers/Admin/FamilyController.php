<?php

namespace App\Controllers\Admin;

use App\Database\Db;
use App\Http\Auth;
use App\Http\HttpException;
use App\Http\Request;
use App\Http\Response;

class FamilyController {
    public static function index(Request $request): array {
        Auth::requireAdmin();
        $rows = Db::all(
            'SELECT f.id, f.nombre, f.id_categoria, c.nombre AS categoria,
                    (SELECT COUNT(*) FROM productos p WHERE p.id_familia = f.id) AS productos
             FROM familias f JOIN categorias c ON f.id_categoria = c.id
             ORDER BY c.nombre ASC, f.nombre ASC'
        );
        return array_map([self::class, 'format'], $rows);
    }

    public static function store(Request $request): Response {
        Auth::requireAdmin();
        [$nombre, $idCategoria] = self::validated($request);
        if (Db::one('SELECT id FROM familias WHERE nombre = ? AND id_categoria = ?', [$nombre, $idCategoria])) {
            throw HttpException::conflict('Ya existe una familia con ese nombre en esta categoría.');
        }
        $id = Db::insert('INSERT INTO familias (nombre, id_categoria) VALUES (?, ?)', [$nombre, $idCategoria]);
        return Response::created(['id' => $id]);
    }

    public static function update(Request $request): array {
        Auth::requireAdmin();
        $id = $request->intParam('id');
        [$nombre, $idCategoria] = self::validated($request);
        if (!Db::one('SELECT id FROM familias WHERE id = ?', [$id])) {
            throw HttpException::notFound('Familia no encontrada.');
        }
        if (Db::one('SELECT id FROM familias WHERE nombre = ? AND id_categoria = ? AND id != ?', [$nombre, $idCategoria, $id])) {
            throw HttpException::conflict('Ya existe una familia con ese nombre en esta categoría.');
        }
        Db::exec('UPDATE familias SET nombre = ?, id_categoria = ? WHERE id = ?', [$nombre, $idCategoria, $id]);
        // Los productos de la familia pasan a la nueva categoría para que no queden inconsistentes.
        Db::exec('UPDATE productos SET id_categoria = ? WHERE id_familia = ?', [$idCategoria, $id]);
        return ['id' => $id];
    }

    /** Al eliminarla, sus productos quedan sin familia (clave foránea ON DELETE SET NULL). */
    public static function destroy(Request $request): array {
        Auth::requireAdmin();
        $id = $request->intParam('id');
        if (Db::exec('DELETE FROM familias WHERE id = ?', [$id]) === 0) {
            throw HttpException::notFound('Familia no encontrada.');
        }
        return ['id' => $id];
    }

    private static function validated(Request $request): array {
        $nombre = $request->string('nombre');
        $idCategoria = $request->nullableInt('idCategoria');
        if ($nombre === '' || $idCategoria === null) {
            throw HttpException::badRequest('El nombre y la categoría son obligatorios.');
        }
        if (mb_strlen($nombre) > 100) {
            throw HttpException::badRequest('El nombre no puede superar los 100 caracteres.');
        }
        if (!Db::one('SELECT id FROM categorias WHERE id = ?', [$idCategoria])) {
            throw HttpException::badRequest('La categoría seleccionada no existe.');
        }
        return [$nombre, $idCategoria];
    }

    private static function format(array $f): array {
        return [
            'id' => (int) $f['id'],
            'nombre' => $f['nombre'],
            'idCategoria' => (int) $f['id_categoria'],
            'categoria' => $f['categoria'],
            'productos' => (int) $f['productos'],
        ];
    }
}
