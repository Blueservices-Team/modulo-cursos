<?php
/**
 * POST /api/training/attendance.php
 *  { session_id, records: [{ technician_id, status: 'PRESENTE'|'AUSENTE', comments }] }
 *  Corporativo marks attendance (only for confirmed invites)
 */
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../models/TrainingSession.php';

header('Content-Type: application/json; charset=utf-8');
requireCorporate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Método no permitido', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$sessionId = (int)($input['session_id'] ?? 0);
$records   = $input['records'] ?? [];

if (!$sessionId || !is_array($records) || empty($records)) {
    jsonResponse(false, null, 'session_id y records[] requeridos', 400);
}

$session = TrainingSession::getById($sessionId);
if (!$session) {
    jsonResponse(false, null, 'Sesión no encontrada', 404);
}

$success = 0;
$skipped = 0;
foreach ($records as $rec) {
    $tid    = (int)($rec['technician_id'] ?? 0);
    $status = strtoupper(trim($rec['status'] ?? ''));
    $comments = trim($rec['comments'] ?? '');

    if (!$tid || !in_array($status, ['PRESENTE', 'AUSENTE'])) {
        $skipped++;
        continue;
    }

    $ok = TrainingSession::markAttendance($sessionId, $tid, $status, $comments ?: null, currentUserId());
    if ($ok) $success++;
    else $skipped++;
}

jsonResponse(true, [
    'marked'  => $success,
    'skipped' => $skipped,
    'message' => "{$success} registro(s) de asistencia guardados. {$skipped} omitido(s) (no confirmados o inválidos)."
]);
