<?php

namespace App\Controllers;

use App\Database\Db;
use App\Http\HttpException;
use App\Http\Request;

class CatalogController {
    private const PAGE_SIZE = 12;

    public static function categories(Request $request): array {
        return array_map(
            fn($c) => ['id' => (int) $c['id'], 'nombre' => $c['nombre']],
            Db::all('SELECT id, nombre FROM categorias ORDER BY nombre ASC')
        );
    }

    /** Familias de una categoría, por id (?categoria_id=) o por nombre (?categoria=). */
    public static function families(Request $request): array {
        $categoriaId = (int) $request->query('categoria_id', '0');
        $categoria = $request->query('categoria');

        if ($categoriaId <= 0 && $categoria !== '') {
            $categoriaId = (int) Db::value('SELECT id FROM categorias WHERE LOWER(nombre) = LOWER(?)', [$categoria]);
        }
        if ($categoriaId <= 0) {
            return [];
        }

        return array_map(
            fn($f) => ['id' => (int) $f['id'], 'nombre' => $f['nombre']],
            Db::all('SELECT id, nombre FROM familias WHERE id_categoria = ? ORDER BY nombre ASC', [$categoriaId])
        );
    }

    public static function products(Request $request): array {
        $conditions = ["p.estado = 'activo'", 'p.stock > 0'];
        $params = [];

        if (($q = $request->query('q')) !== '') {
            $conditions[] = '(p.nombre LIKE ? OR p.descripcion LIKE ? OR p.marca LIKE ?)';
            $like = '%' . $q . '%';
            array_push($params, $like, $like, $like);
        }
        if (($categoria = $request->query('categoria')) !== '') {
            $conditions[] = 'LOWER(c.nombre) = LOWER(?)';
            $params[] = $categoria;
        }
        if (($familia = (int) $request->query('familia', '0')) > 0) {
            $conditions[] = 'p.id_familia = ?';
            $params[] = $familia;
        }

        $where = ' WHERE ' . implode(' AND ', $conditions);
        $from = ' FROM productos p LEFT JOIN categorias c ON p.id_categoria = c.id';

        $total = (int) Db::value('SELECT COUNT(*)' . $from . $where, $params);
        $page = max(1, (int) $request->query('page', '1'));
        $offset = ($page - 1) * self::PAGE_SIZE;

        $rows = Db::all(
            'SELECT p.id, p.nombre, p.imagen, p.precio, p.descripcion, p.stock, p.marca, p.color, c.nombre AS categoria'
                . $from . $where . ' ORDER BY p.id DESC LIMIT ? OFFSET ?',
            [...$params, self::PAGE_SIZE, $offset]
        );

        return [
            'items' => array_map([self::class, 'formatProduct'], $rows),
            'page' => $page,
            'pages' => max(1, (int) ceil($total / self::PAGE_SIZE)),
            'total' => $total,
        ];
    }

    public static function product(Request $request): array {
        $id = $request->intParam('id');
        $product = Db::one(
            "SELECT p.*, c.nombre AS categoria, f.nombre AS familia
             FROM productos p
             LEFT JOIN categorias c ON p.id_categoria = c.id
             LEFT JOIN familias f ON p.id_familia = f.id
             WHERE p.id = ? AND p.estado = 'activo'",
            [$id]
        );
        if (!$product) {
            throw HttpException::notFound('Producto no encontrado.');
        }

        $similares = Db::all(
            "SELECT p.id, p.nombre, p.imagen, p.precio, p.descripcion, p.stock
             FROM productos p
             WHERE p.estado = 'activo' AND p.stock > 0 AND p.id != ?
               AND (p.id_categoria = ? OR p.id_familia = ?)
             ORDER BY RAND() LIMIT 4",
            [$id, (int) $product['id_categoria'], (int) $product['id_familia']]
        );

        return [
            ...self::formatProduct($product),
            'idCategoria' => $product['id_categoria'] !== null ? (int) $product['id_categoria'] : null,
            'familia' => $product['familia'],
            'idFamilia' => $product['id_familia'] !== null ? (int) $product['id_familia'] : null,
            'similares' => array_map([self::class, 'formatProduct'], $similares),
        ];
    }

    public static function formatProduct(array $p): array {
        return [
            'id' => (int) $p['id'],
            'nombre' => $p['nombre'],
            'descripcion' => $p['descripcion'] ?? '',
            'precio' => (float) $p['precio'],
            'stock' => (int) ($p['stock'] ?? 0),
            'imagen' => $p['imagen'] ?: null,
            'marca' => $p['marca'] ?? null,
            'color' => $p['color'] ?? null,
            'categoria' => $p['categoria'] ?? null,
        ];
    }
}
