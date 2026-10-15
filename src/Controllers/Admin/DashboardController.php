<?php

namespace App\Controllers\Admin;

use App\Database\Db;
use App\Http\Auth;
use App\Http\Request;

class DashboardController {
    public static function metrics(Request $request): array {
        Auth::requireAdmin();
        return [
            'totalProductos' => (int) Db::value('SELECT COUNT(*) FROM productos'),
            'productosActivos' => (int) Db::value("SELECT COUNT(*) FROM productos WHERE estado = 'activo'"),
            'stockBajo' => (int) Db::value("SELECT COUNT(*) FROM productos WHERE stock < 10 AND estado = 'activo'"),
            'valorInventario' => (float) Db::value("SELECT COALESCE(SUM(precio * stock), 0) FROM productos WHERE estado = 'activo'"),
            'pedidosPendientes' => (int) Db::value("SELECT COUNT(*) FROM pedido WHERE estado = 'pendiente'"),
            // Ventas confirmadas del mes: todo lo pagado, enviado o entregado.
            'ventasMes' => (float) Db::value(
                "SELECT COALESCE(SUM(total), 0) FROM pedido
                 WHERE estado IN ('pagado', 'enviado', 'entregado')
                   AND YEAR(fecha) = YEAR(CURRENT_DATE()) AND MONTH(fecha) = MONTH(CURRENT_DATE())"
            ),
        ];
    }
}
