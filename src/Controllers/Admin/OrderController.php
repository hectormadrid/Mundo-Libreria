<?php

namespace App\Controllers\Admin;

use App\Controllers\OrderController as StoreOrderController;
use App\Database\Db;
use App\Http\Auth;
use App\Http\HttpException;
use App\Http\Request;

class OrderController {
    public const ESTADOS = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

    public static function index(Request $request): array {
        Auth::requireAdmin();
        $rows = Db::all(
            'SELECT p.id, p.total, p.estado, p.fecha, p.metodo_pago, p.direccion_envio, p.telefono_contacto,
                    u.nombre AS cliente, u.correo
             FROM pedido p JOIN usuario u ON p.id_usuario = u.id
             ORDER BY p.fecha DESC, p.id DESC'
        );
        return array_map(fn($row) => [
            ...StoreOrderController::formatOrder($row),
            'cliente' => $row['cliente'],
            'correo' => $row['correo'],
        ], $rows);
    }

    public static function show(Request $request): array {
        Auth::requireAdmin();
        $row = Db::one(
            'SELECT p.id, p.total, p.estado, p.fecha, p.metodo_pago, p.direccion_envio, p.telefono_contacto,
                    u.nombre AS cliente, u.correo, u.rut
             FROM pedido p JOIN usuario u ON p.id_usuario = u.id
             WHERE p.id = ?',
            [$request->intParam('id')]
        );
        if (!$row) {
            throw HttpException::notFound('Pedido no encontrado.');
        }
        return [
            ...StoreOrderController::formatOrder($row),
            'cliente' => $row['cliente'],
            'correo' => $row['correo'],
            'rut' => $row['rut'],
            'items' => StoreOrderController::items((int) $row['id']),
        ];
    }

    /**
     * Al cancelar un pedido se devuelve el stock de sus productos.
     * Un pedido cancelado no se reactiva, porque su stock ya volvió al inventario.
     */
    public static function updateStatus(Request $request): array {
        Auth::requireAdmin();
        $id = $request->intParam('id');
        $nuevo = $request->string('estado');

        if (!in_array($nuevo, self::ESTADOS, true)) {
            throw HttpException::badRequest('Estado no válido.');
        }

        Db::transaction(function () use ($id, $nuevo) {
            $actual = Db::value('SELECT estado FROM pedido WHERE id = ? FOR UPDATE', [$id]);
            if ($actual === null) {
                throw HttpException::notFound('Pedido no encontrado.');
            }
            if ($actual === $nuevo) {
                return;
            }
            if ($actual === 'cancelado') {
                throw HttpException::conflict('Un pedido cancelado no se puede reactivar.');
            }
            if ($nuevo === 'cancelado') {
                Db::exec(
                    'UPDATE productos p JOIN detalle_pedido d ON d.id_producto = p.id
                     SET p.stock = p.stock + d.cantidad WHERE d.id_pedido = ?',
                    [$id]
                );
            }
            Db::exec('UPDATE pedido SET estado = ? WHERE id = ?', [$nuevo, $id]);
        });

        return ['id' => $id, 'estado' => $nuevo];
    }
}
