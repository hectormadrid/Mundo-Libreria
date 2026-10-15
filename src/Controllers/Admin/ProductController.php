<?php

namespace App\Controllers\Admin;

use App\Database\Db;
use App\Helpers\ImageUpload;
use App\Http\Auth;
use App\Http\HttpException;
use App\Http\Request;
use App\Http\Response;

class ProductController {
    public static function index(Request $request): array {
        Auth::requireAdmin();
        $rows = Db::all(
            'SELECT p.id, p.nombre, p.codigo_barras, p.imagen, p.precio, p.descripcion, p.marca, p.color,
                    p.stock, p.estado, p.fecha_creacion, p.id_categoria, c.nombre AS categoria,
                    p.id_familia, f.nombre AS familia
             FROM productos p
             LEFT JOIN categorias c ON p.id_categoria = c.id
             LEFT JOIN familias f ON p.id_familia = f.id
             ORDER BY p.id DESC'
        );
        return array_map([self::class, 'format'], $rows);
    }

    public static function store(Request $request): Response {
        Auth::requireAdmin();
        $data = self::validated($request);
        $data['codigo_barras'] = $data['codigo_barras'] ?? self::generateBarcode();
        self::assertBarcodeAvailable($data['codigo_barras']);

        $file = $request->file('imagen');
        $imagen = $file ? ImageUpload::storeProductImage($file) : null;

        try {
            $id = Db::insert(
                'INSERT INTO productos (nombre, codigo_barras, id_categoria, id_familia, imagen, descripcion, marca, color, precio, stock, estado)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [$data['nombre'], $data['codigo_barras'], $data['id_categoria'], $data['id_familia'], $imagen,
                 $data['descripcion'], $data['marca'], $data['color'], $data['precio'], $data['stock'], $data['estado']]
            );
        } catch (\Throwable $e) {
            ImageUpload::delete($imagen);
            throw $e;
        }

        return Response::created(self::find($id));
    }

    /** Se usa POST (no PUT) porque PHP solo procesa multipart/form-data en POST. */
    public static function update(Request $request): array {
        Auth::requireAdmin();
        $id = $request->intParam('id');
        $actual = Db::one('SELECT imagen FROM productos WHERE id = ?', [$id]);
        if (!$actual) {
            throw HttpException::notFound('Producto no encontrado.');
        }

        $data = self::validated($request);
        $data['codigo_barras'] = $data['codigo_barras'] ?? self::generateBarcode();
        self::assertBarcodeAvailable($data['codigo_barras'], $id);

        $imagen = $actual['imagen'];
        $file = $request->file('imagen');
        if ($file) {
            $imagen = ImageUpload::storeProductImage($file);
        }

        try {
            Db::exec(
                'UPDATE productos SET nombre = ?, codigo_barras = ?, id_categoria = ?, id_familia = ?, imagen = ?, descripcion = ?,
                        marca = ?, color = ?, precio = ?, stock = ?, estado = ?
                 WHERE id = ?',
                [$data['nombre'], $data['codigo_barras'], $data['id_categoria'], $data['id_familia'], $imagen,
                 $data['descripcion'], $data['marca'], $data['color'], $data['precio'], $data['stock'], $data['estado'], $id]
            );
        } catch (\Throwable $e) {
            if ($file) {
                ImageUpload::delete($imagen);
            }
            throw $e;
        }

        if ($file) {
            ImageUpload::delete($actual['imagen']);
        }
        return self::find($id);
    }

    public static function updateStatus(Request $request): array {
        Auth::requireAdmin();
        $id = $request->intParam('id');
        $estado = strtolower($request->string('estado'));
        if (!in_array($estado, ['activo', 'inactivo'], true)) {
            throw HttpException::badRequest('Estado no válido.');
        }
        if (!Db::one('SELECT id FROM productos WHERE id = ?', [$id])) {
            throw HttpException::notFound('Producto no encontrado.');
        }
        Db::exec('UPDATE productos SET estado = ? WHERE id = ?', [$estado, $id]);
        return self::find($id);
    }

    private static function find(int $id): array {
        $row = Db::one(
            'SELECT p.id, p.nombre, p.codigo_barras, p.imagen, p.precio, p.descripcion, p.marca, p.color,
                    p.stock, p.estado, p.fecha_creacion, p.id_categoria, c.nombre AS categoria,
                    p.id_familia, f.nombre AS familia
             FROM productos p
             LEFT JOIN categorias c ON p.id_categoria = c.id
             LEFT JOIN familias f ON p.id_familia = f.id
             WHERE p.id = ?',
            [$id]
        );
        return self::format($row);
    }

    private static function validated(Request $request): array {
        $nombre = $request->string('nombre');
        $precio = $request->float('precio');
        $stock = filter_var($request->input('stock'), FILTER_VALIDATE_INT);
        $idCategoria = $request->nullableInt('idCategoria');
        $idFamilia = $request->nullableInt('idFamilia');
        $estado = strtolower($request->string('estado') ?: 'activo');

        if ($nombre === '') {
            throw HttpException::badRequest('El nombre es obligatorio.');
        }
        if ($precio === null || $precio < 0) {
            throw HttpException::badRequest('El precio debe ser un número mayor o igual a 0.');
        }
        if ($stock === false || $stock < 0) {
            throw HttpException::badRequest('El stock debe ser un número entero mayor o igual a 0.');
        }
        if ($idCategoria === null || !Db::one('SELECT id FROM categorias WHERE id = ?', [$idCategoria])) {
            throw HttpException::badRequest('Selecciona una categoría válida.');
        }
        if ($idFamilia !== null && !Db::one('SELECT id FROM familias WHERE id = ? AND id_categoria = ?', [$idFamilia, $idCategoria])) {
            throw HttpException::badRequest('La familia no pertenece a la categoría seleccionada.');
        }
        if (!in_array($estado, ['activo', 'inactivo'], true)) {
            throw HttpException::badRequest('Estado no válido.');
        }

        return [
            'nombre' => $nombre,
            'codigo_barras' => $request->nullableString('codigoBarras'),
            'precio' => $precio,
            'stock' => $stock,
            'descripcion' => $request->string('descripcion'),
            'marca' => $request->nullableString('marca'),
            'color' => $request->nullableString('color'),
            'id_categoria' => $idCategoria,
            'id_familia' => $idFamilia,
            'estado' => $estado,
        ];
    }

    private static function assertBarcodeAvailable(string $codigo, int $exceptId = 0): void {
        if (Db::one('SELECT id FROM productos WHERE codigo_barras = ? AND id != ?', [$codigo, $exceptId])) {
            throw HttpException::conflict('El código de barras ya está asignado a otro producto.');
        }
    }

    private static function generateBarcode(): string {
        do {
            $codigo = 'ML' . str_pad((string) random_int(1, 99999999999), 11, '0', STR_PAD_LEFT);
        } while (Db::one('SELECT id FROM productos WHERE codigo_barras = ?', [$codigo]));
        return $codigo;
    }

    public static function format(array $p): array {
        return [
            'id' => (int) $p['id'],
            'nombre' => $p['nombre'],
            'codigoBarras' => $p['codigo_barras'],
            'imagen' => $p['imagen'] ?: null,
            'precio' => (float) $p['precio'],
            'descripcion' => $p['descripcion'] ?? '',
            'marca' => $p['marca'],
            'color' => $p['color'],
            'stock' => (int) $p['stock'],
            'estado' => strtolower($p['estado']),
            'fechaCreacion' => $p['fecha_creacion'],
            'idCategoria' => $p['id_categoria'] !== null ? (int) $p['id_categoria'] : null,
            'categoria' => $p['categoria'],
            'idFamilia' => $p['id_familia'] !== null ? (int) $p['id_familia'] : null,
            'familia' => $p['familia'],
        ];
    }
}
