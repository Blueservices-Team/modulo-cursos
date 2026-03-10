<?php
require_once __DIR__ . '/../config/db.php';

class Course {

    public static function listAll(bool $onlyActive = true): array {
        $db = getDB();
        $where = $onlyActive ? 'WHERE activo = 1' : '';
        $stmt = $db->query("SELECT * FROM courses {$where} ORDER BY nombre");
        return $stmt->fetchAll();
    }

    public static function getById(int $id): ?array {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM courses WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
}
