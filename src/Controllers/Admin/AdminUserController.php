<?php

namespace App\Controllers\Admin;

use App\Database\Db;
use App\Helpers\SecurityHelper;
use App\Http\Auth;
use App\Http\HttpException;
use App\Http\Request;
use App\Http\Response;

class AdminUserController {
    public static function index(Request $request): array {
        Auth::requireAdmin();
        return array_map(
            fn($a) => ['id' => (int) $a['id'], 'nombre' => $a['nombre']],
            Db::all('SELECT id, nombre FROM Administrador ORDER BY nombre ASC')
        );
    }

    public static function store(Request $request): Response {
        Auth::requireAdmin();
        $nombre = $request->string('nombre');
        $password = (string) $request->input('password', '');

        if ($nombre === '' || $password === '') {
            throw HttpException::badRequest('El nombre y la contraseña son obligatorios.');
        }
        if (!SecurityHelper::validatePasswordStrength($password)) {
            throw HttpException::badRequest('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.');
        }
        if (Db::one('SELECT id FROM Administrador WHERE nombre = ?', [$nombre])) {
            throw HttpException::conflict('Ya existe un administrador con ese nombre.');
        }

        $id = Db::insert(
            "INSERT INTO Administrador (nombre, tipo, password) VALUES (?, 'administrador', ?)",
            [$nombre, password_hash($password, PASSWORD_DEFAULT)]
        );
        return Response::created(['id' => $id, 'nombre' => $nombre]);
    }

    public static function destroy(Request $request): array {
        $currentId = Auth::requireAdmin();
        $id = $request->intParam('id');

        if ($id === $currentId) {
            throw HttpException::conflict('No puedes eliminar tu propia cuenta de administrador.');
        }
        if ((int) Db::value('SELECT COUNT(*) FROM Administrador') <= 1) {
            throw HttpException::conflict('Debe quedar al menos un administrador.');
        }
        if (Db::exec('DELETE FROM Administrador WHERE id = ?', [$id]) === 0) {
            throw HttpException::notFound('Administrador no encontrado.');
        }
        return ['id' => $id];
    }
}
