<?php
require_once __DIR__ . '/../config/db.php';

class Technician {

    public static function listByDealer(int $dealerId, bool $onlyActive = false): array {
        $db = getDB();
        $where = 't.dealer_id = :did';
        if ($onlyActive) $where .= ' AND t.activo = 1';
        $stmt = $db->prepare("SELECT t.*, d.nombre AS dealer_name FROM technicians t JOIN dealers d ON d.id = t.dealer_id WHERE {$where} ORDER BY t.nombre");
        $stmt->execute([':did' => $dealerId]);
        return $stmt->fetchAll();
    }

    public static function listAll(bool $onlyActive = false): array {
        $db = getDB();
        $where = $onlyActive ? 'WHERE t.activo = 1' : '';
        $stmt = $db->query("SELECT t.*, d.nombre AS dealer_name FROM technicians t JOIN dealers d ON d.id = t.dealer_id {$where} ORDER BY d.nombre, t.nombre");
        return $stmt->fetchAll();
    }

    public static function getById(int $id): ?array {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM technicians WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function create(int $dealerId, string $nombre, ?string $email, ?string $rfc, ?string $telefono): int {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO technicians (dealer_id, nombre, email, rfc, telefono) VALUES (:did, :nom, :em, :rfc, :tel)");
        $stmt->execute([':did' => $dealerId, ':nom' => $nombre, ':em' => $email, ':rfc' => $rfc, ':tel' => $telefono]);
        return (int)$db->lastInsertId();
    }

    public static function update(int $id, string $nombre, ?string $email, ?string $rfc, ?string $telefono, int $activo): bool {
        $db = getDB();
        $stmt = $db->prepare("UPDATE technicians SET nombre = :nom, email = :em, rfc = :rfc, telefono = :tel, activo = :act WHERE id = :id");
        $stmt->execute([':nom' => $nombre, ':em' => $email, ':rfc' => $rfc, ':tel' => $telefono, ':act' => $activo, ':id' => $id]);
        return $stmt->rowCount() >= 0;
    }

    public static function delete(int $id): bool {
        $db = getDB();
        $stmt = $db->prepare("DELETE FROM technicians WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    public static function countActiveByDealer(int $dealerId): int {
        $db = getDB();
        $stmt = $db->prepare("SELECT COUNT(*) FROM technicians WHERE dealer_id = :did AND activo = 1");
        $stmt->execute([':did' => $dealerId]);
        return (int)$stmt->fetchColumn();
    }

    public static function getCertificates(int $technicianId): array {
        $db = getDB();
        $stmt = $db->prepare("SELECT c.*, co.nombre AS course_name FROM certificates c JOIN courses co ON co.id = c.course_id WHERE c.technician_id = :tid ORDER BY c.issued_at DESC");
        $stmt->execute([':tid' => $technicianId]);
        return $stmt->fetchAll();
    }

    public static function getHistory(int $technicianId): array {
        $db = getDB();
        $stmt = $db->prepare("SELECT th.*, u.nombre AS imported_by_name FROM training_history th JOIN users u ON u.id = th.imported_by WHERE th.technician_id = :tid ORDER BY th.training_date DESC");
        $stmt->execute([':tid' => $technicianId]);
        return $stmt->fetchAll();
    }
}
