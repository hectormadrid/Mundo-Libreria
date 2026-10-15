<?php

namespace App\Controllers;

use App\Database\Db;
use App\Helpers\EmailHelper;
use App\Helpers\SecurityHelper;
use App\Helpers\SessionHelper;
use App\Http\Auth;
use App\Http\HttpException;
use App\Http\LoginThrottle;
use App\Http\Request;
use App\Http\Response;

class AuthController {
    private const PASSWORD_RULE = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';

    /** Estado de la sesión actual y token CSRF para las siguientes peticiones. */
    public static function session(Request $request): array {
        $user = null;
        if ($id = Auth::userId()) {
            $user = Db::one('SELECT id, nombre, correo FROM usuario WHERE id = ?', [$id]);
            if (!$user) {
                unset($_SESSION['ID'], $_SESSION['nombre'], $_SESSION['correo']);
            }
        }

        $admin = null;
        if ($adminId = Auth::adminId()) {
            $admin = Db::one('SELECT id, nombre FROM Administrador WHERE id = ?', [$adminId]);
        }

        return [
            'user' => $user ? ['id' => (int) $user['id'], 'nombre' => $user['nombre'], 'correo' => $user['correo']] : null,
            'admin' => $admin ? ['id' => (int) $admin['id'], 'nombre' => $admin['nombre']] : null,
            'csrfToken' => Auth::csrfToken(),
        ];
    }

    public static function login(Request $request): array {
        $correo = $request->string('correo');
        $password = (string) $request->input('password', '');

        if (!SecurityHelper::validateEmail($correo) || $password === '') {
            throw HttpException::badRequest('Ingresa un correo válido y tu contraseña.');
        }

        LoginThrottle::check('user', $correo);
        $usuario = Db::one('SELECT id, nombre, correo, password FROM usuario WHERE correo = ? LIMIT 1', [$correo]);

        if (!$usuario || !password_verify($password, $usuario['password'])) {
            LoginThrottle::fail('user', $correo);
            throw HttpException::unauthorized('Credenciales incorrectas.');
        }

        LoginThrottle::clear('user', $correo);
        Auth::loginUser($usuario);
        return self::session($request);
    }

    public static function register(Request $request): Response {
        $rut = $request->string('rut');
        $nombre = $request->string('nombre');
        $correo = $request->string('correo');
        $telefono = $request->string('telefono');
        $password = (string) $request->input('password', '');

        if ($rut === '' || $nombre === '' || $correo === '' || $telefono === '' || $password === '') {
            throw HttpException::badRequest('Completa todos los campos.');
        }
        if (!SecurityHelper::validateEmail($correo)) {
            throw HttpException::badRequest('El formato de correo no es válido.');
        }
        if (!SecurityHelper::validateRut($rut)) {
            throw HttpException::badRequest('El formato de RUT no es válido.');
        }
        if (!SecurityHelper::validatePhone($telefono)) {
            throw HttpException::badRequest('El formato de teléfono no es válido.');
        }
        if (!SecurityHelper::validatePasswordStrength($password)) {
            throw HttpException::badRequest(self::PASSWORD_RULE);
        }
        if (Db::one('SELECT id FROM usuario WHERE correo = ? OR rut = ?', [$correo, $rut])) {
            throw HttpException::conflict('El correo o el RUT ya están registrados.');
        }

        Db::insert(
            'INSERT INTO usuario (rut, nombre, correo, telefono, password) VALUES (?, ?, ?, ?, ?)',
            [$rut, $nombre, $correo, $telefono, password_hash($password, PASSWORD_DEFAULT)]
        );

        try {
            EmailHelper::send($correo, '¡Bienvenido a Mundo Librería!', EmailHelper::getWelcomeTemplate($nombre));
        } catch (\Throwable $e) {
            error_log('Error al enviar correo de bienvenida: ' . $e->getMessage());
        }

        return Response::created(['message' => '¡Registro exitoso! Ya puedes iniciar sesión.']);
    }

    public static function logout(Request $request): array {
        SessionHelper::destroy();
        SessionHelper::start();
        return ['user' => null, 'admin' => null, 'csrfToken' => Auth::csrfToken()];
    }

    public static function adminLogin(Request $request): array {
        $nombre = $request->string('nombre');
        $password = (string) $request->input('password', '');

        if ($nombre === '' || $password === '') {
            throw HttpException::badRequest('Completa todos los campos.');
        }

        LoginThrottle::check('admin', $nombre);
        $admin = Db::one('SELECT id, nombre, password FROM Administrador WHERE nombre = ? LIMIT 1', [$nombre]);

        if (!$admin || !password_verify($password, $admin['password'])) {
            LoginThrottle::fail('admin', $nombre);
            throw HttpException::unauthorized('Credenciales incorrectas.');
        }

        LoginThrottle::clear('admin', $nombre);
        Auth::loginAdmin($admin);
        return self::session($request);
    }

    public static function forgotPassword(Request $request): array {
        $correo = $request->string('correo');
        if (!SecurityHelper::validateEmail($correo)) {
            throw HttpException::badRequest('Ingresa una dirección de correo electrónico válida.');
        }

        // Mismo mensaje exista o no la cuenta, para no revelar qué correos están registrados.
        $message = 'Si tu correo está registrado, recibirás un enlace de recuperación en unos minutos.';

        $usuario = Db::one('SELECT id FROM usuario WHERE correo = ? LIMIT 1', [$correo]);
        if (!$usuario) {
            return ['message' => $message];
        }

        $token = bin2hex(random_bytes(32));
        Db::exec(
            'UPDATE usuario SET reset_token_hash = ?, reset_token_expires_at = ? WHERE id = ?',
            [hash('sha256', $token), date('Y-m-d H:i:s', strtotime('+1 hour')), (int) $usuario['id']]
        );

        $link = self::frontendUrl('restablecer?token=' . $token);
        if (!EmailHelper::send($correo, 'Recuperación de Contraseña - Mundo Librería', EmailHelper::getPasswordResetTemplate($link))) {
            throw new \RuntimeException('Error al enviar el correo de recuperación.');
        }

        return ['message' => $message];
    }

    public static function validateResetToken(Request $request): array {
        self::findUserByResetToken($request->string('token'));
        return ['valid' => true];
    }

    public static function resetPassword(Request $request): array {
        $password = (string) $request->input('password', '');
        $usuario = self::findUserByResetToken($request->string('token'));

        if (!SecurityHelper::validatePasswordStrength($password)) {
            throw HttpException::badRequest(self::PASSWORD_RULE);
        }

        Db::exec(
            'UPDATE usuario SET password = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?',
            [password_hash($password, PASSWORD_DEFAULT), (int) $usuario['id']]
        );

        return ['message' => '¡Tu contraseña ha sido actualizada con éxito!'];
    }

    private static function findUserByResetToken(string $token): array {
        if ($token === '') {
            throw HttpException::badRequest('No se proporcionó un token de recuperación.');
        }
        $usuario = Db::one(
            'SELECT id, reset_token_expires_at FROM usuario WHERE reset_token_hash = ? LIMIT 1',
            [hash('sha256', $token)]
        );
        if (!$usuario) {
            throw HttpException::badRequest('El enlace de recuperación no es válido o ya fue utilizado.');
        }
        if (new \DateTime() > new \DateTime($usuario['reset_token_expires_at'])) {
            throw HttpException::badRequest('El enlace de recuperación expiró. Solicita uno nuevo.');
        }
        return $usuario;
    }

    /** URL pública del frontend: APP_URL del .env o, si no existe, la deducida de la petición. */
    private static function frontendUrl(string $path): string {
        $base = $_ENV['APP_URL'] ?? '';
        if ($base === '') {
            $https = ($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
            $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
            $prefix = substr($uri, 0, (int) strpos($uri, '/api'));
            $base = ($https ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . $prefix;
        }
        return rtrim($base, '/') . '/' . $path;
    }
}
