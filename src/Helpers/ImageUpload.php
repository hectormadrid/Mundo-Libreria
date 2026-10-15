<?php

namespace App\Helpers;

use App\Http\HttpException;

/**
 * Guarda imágenes de productos validando el tipo real del archivo y su tamaño.
 */
class ImageUpload {
    private const ALLOWED = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    private const MAX_BYTES = 2 * 1024 * 1024;

    public static function dir(): string {
        return __DIR__ . '/../../public/uploads/productos/';
    }

    /** Devuelve el nombre de archivo guardado. */
    public static function storeProductImage(array $file): string {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            throw HttpException::badRequest('No se pudo subir la imagen.');
        }
        if ($file['size'] > self::MAX_BYTES) {
            throw HttpException::badRequest('La imagen supera el límite de 2MB.');
        }

        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        if (!isset(self::ALLOWED[$mime])) {
            throw HttpException::badRequest('Tipo de archivo no permitido. Usa JPG, PNG o WEBP.');
        }

        if (!is_dir(self::dir()) && !mkdir(self::dir(), 0755, true)) {
            throw new \RuntimeException('No se pudo crear el directorio de imágenes.');
        }

        $name = 'producto_' . time() . '_' . bin2hex(random_bytes(8)) . '.' . self::ALLOWED[$mime];
        if (!move_uploaded_file($file['tmp_name'], self::dir() . $name)) {
            throw new \RuntimeException('Error al guardar la imagen en el servidor.');
        }
        return $name;
    }

    public static function delete(?string $name): void {
        if ($name && basename($name) === $name && is_file(self::dir() . $name)) {
            @unlink(self::dir() . $name);
        }
    }
}
