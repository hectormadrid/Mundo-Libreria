<?php

namespace App\Http;

/**
 * Limita los intentos fallidos de inicio de sesión por IP + identificador
 * (5 intentos cada 15 minutos). Usa archivos temporales para no requerir tablas.
 */
class LoginThrottle {
    private const MAX_ATTEMPTS = 5;
    private const WINDOW_SECONDS = 900;

    private static function file(string $scope, string $identifier): string {
        $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'mundo_libreria_login';
        if (!is_dir($dir)) {
            @mkdir($dir, 0700, true);
        }
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        return $dir . DIRECTORY_SEPARATOR . hash('sha256', $scope . '|' . $ip . '|' . strtolower($identifier));
    }

    private static function recentAttempts(string $file): array {
        if (!is_file($file)) {
            return [];
        }
        $attempts = json_decode((string) file_get_contents($file), true) ?: [];
        $since = time() - self::WINDOW_SECONDS;
        return array_values(array_filter($attempts, fn($t) => $t > $since));
    }

    public static function check(string $scope, string $identifier): void {
        if (count(self::recentAttempts(self::file($scope, $identifier))) >= self::MAX_ATTEMPTS) {
            throw new HttpException(429, 'Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.');
        }
    }

    public static function fail(string $scope, string $identifier): void {
        $file = self::file($scope, $identifier);
        $attempts = self::recentAttempts($file);
        $attempts[] = time();
        @file_put_contents($file, json_encode($attempts), LOCK_EX);
    }

    public static function clear(string $scope, string $identifier): void {
        @unlink(self::file($scope, $identifier));
    }
}
