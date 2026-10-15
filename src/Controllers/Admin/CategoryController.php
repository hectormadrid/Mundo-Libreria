<?php

namespace App\Controllers\Admin;

use App\Database\Db;
use App\Http\Auth;
use App\Http\HttpException;
use App\Http\Request;
use App\Http\Response;

class CategoryController {
    public static function index(Request $request): array {
        Auth::requireAdmin();
        $rows = Db::all(
            'SELECT c.id, c.nombre, c.fecha_creacion,
                    (SELECT COUNT(*) FROM productos p WHERE p.id_categoria = c.id) AS productos,
                    (SELECT COUNT(*) FROM familias f WHERE f.id_categoria = c.id) AS familias
             FROM categorias c ORDER BY c.nombre ASC'
        );
        return array_map([self::class, 'format'], $rows);
    }

    public static function store(Request $request): Response {
        Auth::requireAdmin();
        $nombre = self::validName($request);
        if (Db::one('SELECT id FROM categorias WHERE nombre = ?', [$nombre])) {
            throw HttpException::conflict('La categoría ya existe.');
        }
        $id = Db::insert('INSERT INTO categorias (nombre) VALUES (?)', [$nombre]);
        return Response::created(['id' => $id, 'nombre' => $nombre]);
    }

    public static function update(Request $request): array {
        Auth::requireAdmin();
        $id = $request->intParam('id');
        $nombre = self::validName($request);
        if (!Db::one('SELECT id FROM categorias WHERE id = ?', [$id])) {
            throw HttpException::notFound('Categoría no encontrada.');
        }
        if (Db::one('SELECT id FROM categorias WHERE nombre = ? AND id != ?', [$nombre, $id])) {
            throw HttpException::conflict('Ya existe otra categoría con ese nombre.');
        }
        Db::exec('UPDATE categorias SET nombre = ? WHERE id = ?', [$nombre, $id]);
        return ['id' => $id, 'nombre' => $nombre];
    }

    /** Al eliminarla, sus familias se borran y sus productos quedan sin categoría (claves foráneas). */
    public static function destroy(Request $request): array {
        Auth::requireAdmin();
        $id = $request->intParam('id');
        if (Db::exec('DELETE FROM categorias WHERE id = ?', [$id]) === 0) {
            throw HttpException::notFound('Categoría no encontrada.');
        }
        return ['id' => $id];
    }

    private static function validName(Request $request): string {
        $nombre = $request->string('nombre');
        if ($nombre === '') {
            throw HttpException::badRequest('El nombre de la categoría es obligatorio.');
        }
        if (mb_strlen($nombre) > 100) {
            throw HttpException::badRequest('El nombre no puede superar los 100 caracteres.');
        }
        return $nombre;
    }

    private static function format(array $c): array {
        return [
            'id' => (int) $c['id'],
            'nombre' => $c['nombre'],
            'fechaCreacion' => $c['fecha_creacion'],
            'productos' => (int) $c['productos'],
            'familias' => (int) $c['familias'],
        ];
    }
}
