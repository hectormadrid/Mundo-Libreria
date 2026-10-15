<?php

namespace App\Controllers\Admin;

use App\Controllers\ProfileController;
use App\Database\Db;
use App\Helpers\SecurityHelper;
use App\Http\Auth;
use App\Http\HttpException;
use App\Http\Request;

class UserController {
    public static function index(Request $request): array {
        Auth::requireAdmin();
        $rows = Db::all(
            'SELECT u.id, u.rut, u.nombre, u.correo, u.telefono, u.direccion,
                    (SELECT COUNT(*) FROM pedido p WHERE p.id_usuario = u.id) AS pedidos
             FROM usuario u ORDER BY u.id DESC'
        );
        return array_map(fn($u) => [...ProfileController::format($u), 'pedidos' => (int) $u['pedidos']], $rows);
    }

    public static function update(Request $request): array {
        Auth::requireAdmin();
        $id = $request->intParam('id');
        $rut = $request->string('rut');
        $nombre = $request->string('nombre');
        $correo = $request->string('correo');
        $telefono = $request->string('telefono');
        $direccion = $request->string('direccion');

        if ($rut === '' || $nombre === '' || $correo === '') {
            throw HttpException::badRequest('RUT, nombre y correo son obligatorios.');
        }
        if (!SecurityHelper::validateEmail($correo)) {
            throw HttpException::badRequest('El formato del correo no es válido.');
        }
        if (!SecurityHelper::validateRut($rut)) {
            throw HttpException::badRequest('El formato de RUT no es válido.');
        }
        if ($telefono !== '' && !SecurityHelper::validatePhone($telefono)) {
            throw HttpException::badRequest('El formato de teléfono no es válido.');
        }
        if (!Db::one('SELECT id FROM usuario WHERE id = ?', [$id])) {
            throw HttpException::notFound('Usuario no encontrado.');
        }
        if (Db::one('SELECT id FROM usuario WHERE (correo = ? OR rut = ?) AND id != ?', [$correo, $rut, $id])) {
            throw HttpException::conflict('El correo o el RUT ya pertenecen a otro usuario.');
        }

        Db::exec(
            'UPDATE usuario SET rut = ?, nombre = ?, correo = ?, telefono = ?, direccion = ? WHERE id = ?',
            [$rut, $nombre, $correo, $telefono ?: null, $direccion ?: null, $id]
        );

        $usuario = Db::one('SELECT id, rut, nombre, correo, telefono, direccion FROM usuario WHERE id = ?', [$id]);
        return ProfileController::format($usuario);
    }

    /** No se eliminan clientes con pedidos: la base de datos borraría también su historial de ventas. */
    public static function destroy(Request $request): array {
        Auth::requireAdmin();
        $id = $request->intParam('id');

        if (!Db::one('SELECT id FROM usuario WHERE id = ?', [$id])) {
            throw HttpException::notFound('Usuario no encontrado.');
        }
        if ((int) Db::value('SELECT COUNT(*) FROM pedido WHERE id_usuario = ?', [$id]) > 0) {
            throw HttpException::conflict('El usuario tiene pedidos registrados y no se puede eliminar.');
        }

        Db::exec('DELETE FROM usuario WHERE id = ?', [$id]);
        return ['id' => $id];
    }
}
