<?php
require_once __DIR__ . '/../config/db.php';

class TrainingSession {

    public static function list(array $filters = []): array {
        $db = getDB();
        $where = ['1=1'];
        $params = [];

        if (!empty($filters['from'])) {
            $where[] = 'ts.session_date >= :from_date';
            $params[':from_date'] = $filters['from'];
        }
        if (!empty($filters['to'])) {
            $where[] = 'ts.session_date <= :to_date';
            $params[':to_date'] = $filters['to'];
        }
        if (!empty($filters['location'])) {
            $where[] = 'ts.location_code = :loc';
            $params[':loc'] = (int)$filters['location'];
        }
        if (!empty($filters['dealer_id'])) {
            $where[] = 'ts.id IN (SELECT si2.session_id FROM session_invites si2 JOIN technicians t2 ON t2.id = si2.technician_id WHERE t2.dealer_id = :did)';
            $params[':did'] = (int)$filters['dealer_id'];
        }
        if (!empty($filters['q'])) {
            $where[] = '(c.nombre LIKE :q)';
            $params[':q'] = '%' . $filters['q'] . '%';
        }

        $sql = "SELECT ts.*, c.nombre AS course_name,
                       u.nombre AS created_by_name
                FROM training_sessions ts
                JOIN courses c ON c.id = ts.course_id
                JOIN users u ON u.id = ts.created_by_user_id
                WHERE " . implode(' AND ', $where) . "
                ORDER BY ts.session_date ASC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function getById(int $id): ?array {
        $db = getDB();
        $stmt = $db->prepare("SELECT ts.*, c.nombre AS course_name FROM training_sessions ts JOIN courses c ON c.id = ts.course_id WHERE ts.id = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function create(int $courseId, string $date, int $location, int $userId): int {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO training_sessions (course_id, session_date, location_code, created_by_user_id) VALUES (:cid, :dt, :loc, :uid)");
        $stmt->execute([':cid' => $courseId, ':dt' => $date, ':loc' => $location, ':uid' => $userId]);
        return (int)$db->lastInsertId();
    }

    public static function getInvites(int $sessionId, ?int $dealerId = null): array {
        $db = getDB();
        $where = 'si.session_id = :sid';
        $params = [':sid' => $sessionId];
        if ($dealerId) {
            $where .= ' AND t.dealer_id = :did';
            $params[':did'] = $dealerId;
        }
        $sql = "SELECT si.*, t.nombre AS technician_name, t.dealer_id, d.nombre AS dealer_name,
                       a.status AS attendance_status, a.comments AS attendance_comments
                FROM session_invites si
                JOIN technicians t ON t.id = si.technician_id
                JOIN dealers d ON d.id = t.dealer_id
                LEFT JOIN attendance a ON a.session_id = si.session_id AND a.technician_id = si.technician_id
                WHERE {$where}
                ORDER BY d.nombre, t.nombre";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function addInvites(int $sessionId, array $technicianIds): int {
        $db = getDB();
        $stmt = $db->prepare("INSERT IGNORE INTO session_invites (session_id, technician_id) VALUES (:sid, :tid)");
        $count = 0;
        foreach ($technicianIds as $tid) {
            $stmt->execute([':sid' => $sessionId, ':tid' => (int)$tid]);
            $count += $stmt->rowCount();
        }
        return $count;
    }

    public static function confirmInvite(int $inviteId, int $userId): bool {
        $db = getDB();
        $stmt = $db->prepare("UPDATE session_invites SET dealer_confirmed = 1, confirmed_at = NOW(), confirm_user_id = :uid WHERE id = :id");
        $stmt->execute([':uid' => $userId, ':id' => $inviteId]);
        return $stmt->rowCount() > 0;
    }

    public static function markAttendance(int $sessionId, int $technicianId, string $status, ?string $comments, int $userId): bool {
        $db = getDB();
        // Only allow attendance for confirmed invites
        $check = $db->prepare("SELECT id FROM session_invites WHERE session_id = :sid AND technician_id = :tid AND dealer_confirmed = 1");
        $check->execute([':sid' => $sessionId, ':tid' => $technicianId]);
        if (!$check->fetch()) {
            return false;
        }
        $stmt = $db->prepare("INSERT INTO attendance (session_id, technician_id, status, comments, marked_by_user_id)
                              VALUES (:sid, :tid, :st, :cm, :uid)
                              ON DUPLICATE KEY UPDATE status = VALUES(status), comments = VALUES(comments), marked_by_user_id = VALUES(marked_by_user_id), marked_at = NOW()");
        $stmt->execute([':sid' => $sessionId, ':tid' => $technicianId, ':st' => $status, ':cm' => $comments, ':uid' => $userId]);
        return true;
    }
}
