<?php
/**
 * Clase para manejar sesiones de forma segura en todo el proyecto Mundo-Libreria.
 */
class SessionHelper {
    /**
     * Inicia una sesión con configuraciones de seguridad mejoradas.
     */
    public static function start() {
        if (session_status() === PHP_SESSION_NONE) {
            // Configurar parámetros de la cookie de sesión
            // - HttpOnly: Previene el acceso a la cookie mediante JavaScript (evita robo de sesión XSS)
            // - Secure: Solo envía la cookie sobre HTTPS (habilitar en producción)
            // - SameSite: Ayuda a mitigar ataques CSRF
            session_set_cookie_params([
                'lifetime' => 0, // Hasta que se cierre el navegador
                'path' => '/',
                'domain' => '', // Se ajusta al dominio actual
                'secure' => isset($_SERVER['HTTPS']), // Solo si hay HTTPS
                'httponly' => true,
                'samesite' => 'Lax' // 'Lax' es un buen equilibrio para e-commerce
            ]);

            session_start();
        }

        // Regenerar el ID de sesión periódicamente para prevenir secuestro de sesión
        if (!isset($_SESSION['last_regeneration'])) {
            self::regenerateSession();
        } else {
            $interval = 60 * 30; // 30 minutos
            if (time() - $_SESSION['last_regeneration'] > $interval) {
                self::regenerateSession();
            }
        }
    }

    /**
     * Regenera el ID de sesión de forma segura.
     */
    public static function regenerateSession() {
        session_regenerate_id(true); // El true borra el archivo de sesión antiguo
        $_SESSION['last_regeneration'] = time();
    }

    /**
     * Cierra la sesión de forma completa y segura.
     */
    public static function destroy() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Limpiar todas las variables de sesión
        $_SESSION = array();

        // Borrar la cookie de sesión si existe
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }

        // Destruir la sesión en el servidor
        session_destroy();
    }
}
?>
