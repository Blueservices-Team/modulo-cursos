<?php
require_once __DIR__ . '/../config/db.php';

class TrainingHistory {

    public static function import(int $techId, string $courseName, ?string $date, ?string $result, ?string $certFile, int $userId): int {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO training_history (technician_id, course_name, training_date, result, certificate_file, imported_by) VALUES (:tid, :cn, :dt, :res, :cf, :uid)");
        $stmt->execute([
            ':tid' => $techId,
            ':cn'  => $courseName,
            ':dt'  => $date,
            ':res' => $result,
            ':cf'  => $certFile,
            ':uid' => $userId,
        ]);
        return (int)$db->lastInsertId();
    }

    public static function listByTechnician(int $techId): array {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM training_history WHERE technician_id = :tid ORDER BY training_date DESC");
        $stmt->execute([':tid' => $techId]);
        return $stmt->fetchAll();
    }

    public static function listAll(): array {
        $db = getDB();
        $stmt = $db->query("SELECT th.*, t.nombre AS technician_name, d.nombre AS dealer_name
                            FROM training_history th
                            JOIN technicians t ON t.id = th.technician_id
                            JOIN dealers d ON d.id = t.dealer_id
                            ORDER BY th.created_at DESC");
        return $stmt->fetchAll();
    }
}
