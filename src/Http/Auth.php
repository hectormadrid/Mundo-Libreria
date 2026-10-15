<?php

namespace App\Http;

use App\Helpers\SessionHelper;

/**
 * Autenticación por sesión PHP. Clientes y administradores usan claves de sesión
 * distintas para que una identidad nunca se confunda con la otra.
 */
class Auth {
    public static function userId(): ?int {
        return isset($_SESSION['ID']) ? (int) $_SESSION['ID'] : null;
    }

    public static function requireUser(): int {
        $id = self::userId();
        if ($id === null) {
            throw HttpException::unauthorized();
        }
        return $id;
    }

    public static function adminId(): ?int {
        if (($_SESSION['tipo'] ?? null) !== 'administrador' || !isset($_SESSION['admin_id'])) {
            return null;
        }
        return (int) $_SESSION['admin_id'];
    }

    public static function requireAdmin(): int {
        $id = self::adminId();
        if ($id === null) {
            throw HttpException::forbidden();
        }
        return $id;
    }

    public static function loginUser(array $usuario): void {
        SessionHelper::regenerateSession();
        unset($_SESSION['admin_id'], $_SESSION['admin_nombre'], $_SESSION['tipo']);
        $_SESSION['ID'] = (int) $usuario['id'];
        $_SESSION['nombre'] = $usuario['nombre'];
        $_SESSION['correo'] = $usuario['correo'];
    }

    public static function loginAdmin(array $admin): void {
        SessionHelper::regenerateSession();
        unset($_SESSION['ID'], $_SESSION['nombre'], $_SESSION['correo']);
        $_SESSION['admin_id'] = (int) $admin['id'];
        $_SESSION['admin_nombre'] = $admin['nombre'];
        $_SESSION['tipo'] = 'administrador';
    }

    public static function csrfToken(): string {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    /**
     * Toda petición que modifica datos debe traer el token en la cabecera X-CSRF-Token.
     * Un sitio externo no puede leer el token ni enviar esa cabecera sin CORS.
     */
    public static function verifyCsrf(Request $request): void {
        $token = $request->header('X-CSRF-Token');
        $expected = $_SESSION['csrf_token'] ?? '';
        if ($expected === '' || !hash_equals($expected, $token)) {
            throw HttpException::forbidden('La sesión expiró o el token de seguridad no es válido. Recarga la página.');
        }
    }
}
