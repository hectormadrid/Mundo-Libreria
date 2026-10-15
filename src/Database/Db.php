<?php

namespace App\Database;

/**
 * Atajos para consultas preparadas con mysqli.
 * Los tipos se deducen de los parámetros (int → i, float → d, resto → s).
 */
class Db {
    public static function conn(): \mysqli {
        return Conexion::getConnection();
    }

    private static function run(string $sql, array $params): \mysqli_stmt {
        $stmt = self::conn()->prepare($sql);
        if ($params) {
            $types = '';
            foreach ($params as $param) {
                $types .= is_int($param) ? 'i' : (is_float($param) ? 'd' : 's');
            }
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        return $stmt;
    }

    public static function all(string $sql, array $params = []): array {
        $stmt = self::run($sql, $params);
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $rows;
    }

    public static function one(string $sql, array $params = []): ?array {
        $stmt = self::run($sql, $params);
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return $row ?: null;
    }

    public static function value(string $sql, array $params = []): mixed {
        $row = self::one($sql, $params);
        return $row ? reset($row) : null;
    }

    /** Ejecuta INSERT/UPDATE/DELETE y devuelve las filas afectadas. */
    public static function exec(string $sql, array $params = []): int {
        $stmt = self::run($sql, $params);
        $affected = $stmt->affected_rows;
        $stmt->close();
        return $affected;
    }

    public static function insert(string $sql, array $params = []): int {
        $stmt = self::run($sql, $params);
        $id = $stmt->insert_id;
        $stmt->close();
        return $id;
    }

    public static function transaction(callable $callback): mixed {
        $conn = self::conn();
        $conn->begin_transaction();
        try {
            $result = $callback();
            $conn->commit();
            return $result;
        } catch (\Throwable $e) {
            $conn->rollback();
            throw $e;
        }
    }
}
