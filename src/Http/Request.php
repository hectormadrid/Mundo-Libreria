<?php

namespace App\Http;

/**
 * Petición HTTP entrante. Unifica el cuerpo JSON y los formularios multipart.
 */
class Request {
    private ?array $body = null;

    public function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $params = []
    ) {}

    public static function fromGlobals(): self {
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        // La ruta de la API es todo lo que viene después de "/api", sin importar
        // en qué subcarpeta esté instalado el proyecto.
        $pos = strpos($uri, '/api');
        $path = $pos === false ? $uri : substr($uri, $pos + 4);
        $path = '/' . trim($path, '/');

        return new self(strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET'), $path);
    }

    public function withParams(array $params): self {
        return new self($this->method, $this->path, $params);
    }

    public function param(string $key): string {
        return $this->params[$key] ?? '';
    }

    public function intParam(string $key): int {
        $value = filter_var($this->param($key), FILTER_VALIDATE_INT);
        if ($value === false || $value <= 0) {
            throw HttpException::badRequest('Identificador no válido.');
        }
        return $value;
    }

    public function query(string $key, string $default = ''): string {
        $value = $_GET[$key] ?? $default;
        return is_string($value) ? trim($value) : $default;
    }

    /** Cuerpo de la petición: JSON o campos de formulario. */
    public function all(): array {
        if ($this->body === null) {
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            if (str_contains($contentType, 'application/json')) {
                $decoded = json_decode(file_get_contents('php://input') ?: '', true);
                $this->body = is_array($decoded) ? $decoded : [];
            } else {
                $this->body = $_POST;
            }
        }
        return $this->body;
    }

    public function input(string $key, mixed $default = null): mixed {
        return $this->all()[$key] ?? $default;
    }

    /** Texto recortado; los datos se guardan tal cual y se escapan al mostrarlos. */
    public function string(string $key): string {
        $value = $this->input($key, '');
        return is_scalar($value) ? trim((string) $value) : '';
    }

    public function nullableString(string $key): ?string {
        $value = $this->string($key);
        return $value === '' ? null : $value;
    }

    public function int(string $key, int $default = 0): int {
        $value = filter_var($this->input($key), FILTER_VALIDATE_INT);
        return $value === false ? $default : $value;
    }

    public function nullableInt(string $key): ?int {
        $value = filter_var($this->input($key), FILTER_VALIDATE_INT);
        return $value === false || $value <= 0 ? null : $value;
    }

    public function float(string $key): ?float {
        $value = filter_var($this->input($key), FILTER_VALIDATE_FLOAT);
        return $value === false ? null : $value;
    }

    public function file(string $key): ?array {
        $file = $_FILES[$key] ?? null;
        if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            return null;
        }
        return $file;
    }

    public function header(string $name): string {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        return $_SERVER[$key] ?? '';
    }
}
