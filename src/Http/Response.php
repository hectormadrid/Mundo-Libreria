<?php

namespace App\Http;

/**
 * Respuesta de un controlador. Todas las respuestas tienen la forma
 * { "data": ... } si todo salió bien, o { "error": "..." } si falló.
 */
class Response {
    public function __construct(
        public readonly mixed $data = null,
        public readonly int $status = 200
    ) {}

    public static function created(mixed $data = null): self {
        return new self($data, 201);
    }

    public static function send(mixed $data, int $status = 200): void {
        http_response_code($status);
        echo json_encode(['data' => $data], JSON_UNESCAPED_UNICODE);
    }

    public static function error(string $message, int $status): void {
        http_response_code($status);
        echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    }
}
