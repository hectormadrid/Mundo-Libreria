<?php

namespace App\Controllers;

use App\Database\Db;
use App\Helpers\SecurityHelper;
use App\Http\Auth;
use App\Http\HttpException;
use App\Http\Request;

class ProfileController {
    public static function show(Request $request): array {
        $usuario = Db::one(
            'SELECT id, rut, nombre, correo, telefono, direccion FROM usuario WHERE id = ?',
            [Auth::requireUser()]
        );
        if (!$usuario) {
            throw HttpException::unauthorized();
        }
        return self::format($usuario);
    }

    public static function update(Request $request): array {
        $userId = Auth::requireUser();
        $nombre = $request->string('nombre');
        $telefono = $request->string('telefono');
        $direccion = $request->string('direccion');

        if ($nombre === '') {
            throw HttpException::badRequest('El nombre es obligatorio.');
        }
        if ($telefono !== '' && !SecurityHelper::validatePhone($telefono)) {
            throw HttpException::badRequest('El formato de teléfono no es válido.');
        }

        Db::exec(
            'UPDATE usuario SET nombre = ?, telefono = ?, direccion = ? WHERE id = ?',
            [$nombre, $telefono ?: null, $direccion ?: null, $userId]
        );
        $_SESSION['nombre'] = $nombre;

        return self::show($request);
    }

    public static function format(array $u): array {
        return [
            'id' => (int) $u['id'],
            'rut' => $u['rut'],
            'nombre' => $u['nombre'],
            'correo' => $u['correo'],
            'telefono' => $u['telefono'],
            'direccion' => $u['direccion'],
        ];
    }
}
