<?php

namespace App\Controllers;

use App\Database\Db;
use App\Helpers\EmailHelper;
use App\Helpers\SecurityHelper;
use App\Http\Auth;
use App\Http\HttpException;
use App\Http\Request;
use App\Http\Response;

class OrderController {
    public const METODOS_PAGO = ['efectivo', 'transferencia', 'tarjeta'];

    public static function index(Request $request): array {
        $userId = Auth::requireUser();
        $rows = Db::all(
            'SELECT p.id, p.total, p.estado, p.fecha, p.metodo_pago,
                    (SELECT COALESCE(SUM(d.cantidad), 0) FROM detalle_pedido d WHERE d.id_pedido = p.id) AS productos
             FROM pedido p WHERE p.id_usuario = ? ORDER BY p.fecha DESC, p.id DESC',
            [$userId]
        );
        return array_map([self::class, 'formatOrder'], $rows);
    }

    public static function show(Request $request): array {
        $userId = Auth::requireUser();
        $order = Db::one(
            'SELECT id, total, estado, fecha, metodo_pago, direccion_envio, telefono_contacto
             FROM pedido WHERE id = ? AND id_usuario = ?',
            [$request->intParam('id'), $userId]
        );
        if (!$order) {
            throw HttpException::notFound('Pedido no encontrado.');
        }
        return [...self::formatOrder($order), 'items' => self::items((int) $order['id'])];
    }

    public static function store(Request $request): Response {
        $userId = Auth::requireUser();
        $nombre = $request->string('nombre');
        $correo = $request->string('correo');
        $telefono = $request->nullableString('telefono');
        $direccion = $request->nullableString('direccion');
        $metodoPago = $request->string('metodoPago');

        if ($nombre === '' || $correo === '') {
            throw HttpException::badRequest('Completa tu nombre y correo.');
        }
        if (!SecurityHelper::validateEmail($correo)) {
            throw HttpException::badRequest('El formato de correo no es válido.');
        }
        if (!in_array($metodoPago, self::METODOS_PAGO, true)) {
            throw HttpException::badRequest('Método de pago no válido.');
        }

        [$orderId, $total, $items] = Db::transaction(function () use ($userId, $metodoPago, $direccion, $telefono) {
            // Bloquear las filas de productos para que dos compras simultáneas no vendan el mismo stock.
            $items = Db::all(
                'SELECT p.id, p.nombre, p.precio, p.stock, p.estado, c.cantidad
                 FROM carrito c JOIN productos p ON c.id_producto = p.id
                 WHERE c.id_usuario = ? FOR UPDATE',
                [$userId]
            );
            if (!$items) {
                throw HttpException::badRequest('Tu carrito está vacío.');
            }

            $total = 0.0;
            foreach ($items as $item) {
                if (strtolower($item['estado']) !== 'activo') {
                    throw HttpException::conflict('El producto ya no está disponible: ' . $item['nombre']);
                }
                if ((int) $item['cantidad'] > (int) $item['stock']) {
                    throw HttpException::conflict('No hay suficiente stock para: ' . $item['nombre']);
                }
                $total += (float) $item['precio'] * (int) $item['cantidad'];
            }

            // Sin pasarela de pago integrada: la tarjeta se simula como pagada.
            // Transferencia y efectivo quedan pendientes hasta que un admin confirme el pago.
            $estado = $metodoPago === 'tarjeta' ? 'pagado' : 'pendiente';
            $orderId = Db::insert(
                'INSERT INTO pedido (id_usuario, total, metodo_pago, estado, direccion_envio, telefono_contacto) VALUES (?, ?, ?, ?, ?, ?)',
                [$userId, $total, $metodoPago, $estado, $direccion, $telefono]
            );

            foreach ($items as $item) {
                Db::insert(
                    'INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio) VALUES (?, ?, ?, ?)',
                    [$orderId, (int) $item['id'], (int) $item['cantidad'], (float) $item['precio']]
                );
                Db::exec('UPDATE productos SET stock = stock - ? WHERE id = ?', [(int) $item['cantidad'], (int) $item['id']]);
            }
            Db::exec('DELETE FROM carrito WHERE id_usuario = ?', [$userId]);

            return [$orderId, $total, $items];
        });

        try {
            EmailHelper::send(
                $correo,
                "Confirmación de Pedido #$orderId - Mundo Librería",
                EmailHelper::getOrderTemplate($nombre, $orderId, $total, $items)
            );
        } catch (\Throwable $e) {
            // El pedido ya está creado; un fallo del correo no debe revertirlo.
            error_log('Error al enviar email de confirmación: ' . $e->getMessage());
        }

        return Response::created(['id' => $orderId]);
    }

    public static function items(int $orderId): array {
        return array_map(fn($row) => [
            'id' => (int) $row['id'],
            'nombre' => $row['nombre'],
            'imagen' => $row['imagen'] ?: null,
            'cantidad' => (int) $row['cantidad'],
            'precio' => (float) $row['precio'],
            'subtotal' => (float) $row['precio'] * (int) $row['cantidad'],
        ], Db::all(
            'SELECT p.id, p.nombre, p.imagen, d.cantidad, d.precio
             FROM detalle_pedido d JOIN productos p ON d.id_producto = p.id
             WHERE d.id_pedido = ?',
            [$orderId]
        ));
    }

    public static function formatOrder(array $o): array {
        $order = [
            'id' => (int) $o['id'],
            'total' => (float) $o['total'],
            'estado' => $o['estado'],
            'fecha' => $o['fecha'],
            'metodoPago' => $o['metodo_pago'] ?? null,
        ];
        if (array_key_exists('productos', $o)) {
            $order['productos'] = (int) $o['productos'];
        }
        if (array_key_exists('direccion_envio', $o)) {
            $order['direccionEnvio'] = $o['direccion_envio'];
            $order['telefonoContacto'] = $o['telefono_contacto'];
        }
        return $order;
    }
}
