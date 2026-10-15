<?php

namespace App\Http;

/**
 * Error controlado de la API: se responde al cliente con su código HTTP y mensaje.
 */
class HttpException extends \RuntimeException {
    public function __construct(private int $status, string $message) {
        parent::__construct($message);
    }

    public function getStatus(): int {
        return $this->status;
    }

    public static function badRequest(string $message): self {
        return new self(400, $message);
    }

    public static function unauthorized(string $message = 'Debes iniciar sesión.'): self {
        return new self(401, $message);
    }

    public static function forbidden(string $message = 'Acceso no autorizado.'): self {
        return new self(403, $message);
    }

    public static function notFound(string $message = 'Recurso no encontrado.'): self {
        return new self(404, $message);
    }

    public static function conflict(string $message): self {
        return new self(409, $message);
    }
}
