<?php

namespace App\Helpers;

/**
 * Validaciones de datos de entrada. Los textos se guardan tal cual y se escapan al mostrarlos.
 */
class SecurityHelper {
    /**
     * Valida si un email es correcto.
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    /**
     * Valida el formato del RUT chileno (básico: números, puntos, guion y K).
     */
    public static function validateRut($rut) {
        if (strlen($rut) > 12 || !preg_match('/^[0-9.]+-?[0-9kK]$/', $rut)) return false;
        $rut = strtoupper(preg_replace('/[^k0-9]/i', '', $rut));
        if (strlen($rut) < 8) return false;

        // Dígito verificador (módulo 11)
        $cuerpo = substr($rut, 0, -1);
        $dv = substr($rut, -1);
        $suma = 0;
        $multiplo = 2;
        for ($i = strlen($cuerpo) - 1; $i >= 0; $i--) {
            $suma += (int) $cuerpo[$i] * $multiplo;
            $multiplo = $multiplo === 7 ? 2 : $multiplo + 1;
        }
        $esperado = 11 - ($suma % 11);
        $esperado = $esperado === 11 ? '0' : ($esperado === 10 ? 'K' : (string) $esperado);
        return $dv === $esperado;
    }

    /**
     * Valida el formato del teléfono.
     */
    public static function validatePhone($phone) {
        return preg_match('/^\+?[0-9]{8,15}$/', str_replace(' ', '', $phone));
    }

    /**
     * Verifica la fortaleza de la contraseña en el servidor.
     */
    public static function validatePasswordStrength($password) {
        $uppercase = preg_match('@[A-Z]@', $password);
        $lowercase = preg_match('@[a-z]@', $password);
        $number    = preg_match('@[0-9]@', $password);
        $specialChars = preg_match('@[^\w]@', $password);

        return $uppercase && $lowercase && $number && $specialChars && strlen($password) >= 8;
    }
}
