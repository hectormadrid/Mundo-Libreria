<?php

namespace App\Controllers;

use App\Database\Db;
use App\Http\Auth;
use App\Http\HttpException;
use App\Http\Request;

class CartController {
    /** Carrito del usuario. Sin sesión se devuelve vacío. */
    public static function show(Request $request): array {
        $userId = Auth::userId();
        return $userId === null ? ['items' => [], 'total' => 0, 'count' => 0] : self::cartFor($userId);
    }

    public static function cartFor(int $userId): array {
        $rows = Db::all(
            'SELECT p.id, p.nombre, p.precio, p.imagen, p.stock, p.estado, c.cantidad
             FROM carrito c JOIN productos p ON c.id_producto = p.id
             WHERE c.id_usuario = ? ORDER BY c.id ASC',
            [$userId]
        );

        $items = [];
        $total = 0.0;
        $count = 0;
        foreach ($rows as $row) {
            $precio = (float) $row['precio'];
            $cantidad = (int) $row['cantidad'];
            $items[] = [
                'id' => (int) $row['id'],
                'nombre' => $row['nombre'],
                'precio' => $precio,
                'imagen' => $row['imagen'] ?: null,
                'cantidad' => $cantidad,
                'stock' => (int) $row['stock'],
                'disponible' => strtolower($row['estado']) === 'activo',
                'subtotal' => $precio * $cantidad,
            ];
            $total += $precio * $cantidad;
            $count += $cantidad;
        }

        return ['items' => $items, 'total' => $total, 'count' => $count];
    }

    public static function add(Request $request): array {
        $userId = Auth::requireUser();
        $productId = $request->int('productId');
        $cantidad = max(1, $request->int('cantidad', 1));

        $stock = self::availableStock($productId);
        $actual = (int) Db::value('SELECT cantidad FROM carrito WHERE id_usuario = ? AND id_producto = ?', [$userId, $productId]);

        if ($actual + $cantidad > $stock) {
            throw HttpException::conflict('No hay más stock disponible de este producto.');
        }

        if ($actual > 0) {
            Db::exec('UPDATE carrito SET cantidad = ? WHERE id_usuario = ? AND id_producto = ?', [$actual + $cantidad, $userId, $productId]);
        } else {
            Db::insert('INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)', [$userId, $productId, $cantidad]);
        }

        return self::cartFor($userId);
    }

    public static function update(Request $request): array {
        $userId = Auth::requireUser();
        $productId = $request->intParam('productId');
        $cantidad = $request->int('cantidad');

        if ($cantidad < 1) {
            throw HttpException::badRequest('La cantidad debe ser al menos 1.');
        }
        if ($cantidad > self::availableStock($productId)) {
            throw HttpException::conflict('No hay suficiente stock para esa cantidad.');
        }
        if (Db::exec('UPDATE carrito SET cantidad = ? WHERE id_usuario = ? AND id_producto = ?', [$cantidad, $userId, $productId]) === 0
            && !Db::one('SELECT id FROM carrito WHERE id_usuario = ? AND id_producto = ?', [$userId, $productId])) {
            throw HttpException::notFound('El producto no está en tu carrito.');
        }

        return self::cartFor($userId);
    }

    public static function remove(Request $request): array {
        $userId = Auth::requireUser();
        Db::exec('DELETE FROM carrito WHERE id_usuario = ? AND id_producto = ?', [$userId, $request->intParam('productId')]);
        return self::cartFor($userId);
    }

    public static function clear(Request $request): array {
        $userId = Auth::requireUser();
        Db::exec('DELETE FROM carrito WHERE id_usuario = ?', [$userId]);
        return self::cartFor($userId);
    }

    private static function availableStock(int $productId): int {
        $product = Db::one("SELECT stock FROM productos WHERE id = ? AND estado = 'activo'", [$productId]);
        if (!$product) {
            throw HttpException::notFound('Producto no disponible.');
        }
        return (int) $product['stock'];
    }
}
