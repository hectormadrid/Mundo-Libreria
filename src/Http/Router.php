<?php

namespace App\Http;

/**
 * Router mínimo: rutas con parámetros del tipo /productos/{id}.
 */
class Router {
    private array $routes = [];

    public function get(string $pattern, callable $handler): void {
        $this->add('GET', $pattern, $handler);
    }

    public function post(string $pattern, callable $handler): void {
        $this->add('POST', $pattern, $handler);
    }

    public function put(string $pattern, callable $handler): void {
        $this->add('PUT', $pattern, $handler);
    }

    public function patch(string $pattern, callable $handler): void {
        $this->add('PATCH', $pattern, $handler);
    }

    public function delete(string $pattern, callable $handler): void {
        $this->add('DELETE', $pattern, $handler);
    }

    private function add(string $method, string $pattern, callable $handler): void {
        $regex = '#^' . preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', rtrim($pattern, '/') ?: '/') . '$#';
        $this->routes[] = [$method, $regex, $handler];
    }

    /** Ejecuta el controlador que coincida y devuelve su resultado (datos o Response). */
    public function dispatch(Request $request): mixed {
        $pathMatched = false;

        foreach ($this->routes as [$method, $regex, $handler]) {
            if (!preg_match($regex, $request->path, $matches)) {
                continue;
            }
            $pathMatched = true;
            if ($method !== $request->method) {
                continue;
            }
            $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
            return $handler($request->withParams($params));
        }

        if ($pathMatched) {
            throw new HttpException(405, 'Método no permitido.');
        }
        throw HttpException::notFound('Ruta no encontrada.');
    }
}
