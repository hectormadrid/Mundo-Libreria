<?php
/**
 * Clase para centralizar la seguridad, validación y sanitización de datos.
 */
class SecurityHelper {
    /**
     * Limpia una cadena de texto para prevenir XSS y eliminar espacios innecesarios.
     */
    public static function sanitize($data) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
        return $data;
    }

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
        $rut = preg_replace('/[^k0-9]/i', '', $rut);
        if (strlen($rut) < 8) return false;
        // Podríamos añadir validación de dígito verificador aquí si fuera necesario
        return true;
    }

    /**
     * Valida el formato del teléfono.
     */
    public static function validatePhone($phone) {
        return preg_match('/^\+?[0-9]{8,15}$/', str_replace(' ', '', $phone));
    }

    /**
     * Verifica la fortaleza de la contraseña en el servidor.
     * Al menos: 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial.
     */
    public static function validatePasswordStrength($password) {
        $uppercase = preg_match('@[A-Z]@', $password);
        $lowercase = preg_match('@[a-z]@', $password);
        $number    = preg_match('@[0-9]@', $password);
        $specialChars = preg_match('@[^\w]@', $password);

        return $uppercase && $lowercase && $number && $specialChars && strlen($password) >= 8;
    }
}
?>
