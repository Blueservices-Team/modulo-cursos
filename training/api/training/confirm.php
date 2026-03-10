<?php
/**
 * POST /api/training/confirm.php  { invite_id: int }
 *   Dealer confirms an invite for their technician
 */
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../models/TrainingSession.php';

header('Content-Type: application/json; charset=utf-8');
requireDealer();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    jsonResponse(false, null, 'Método no permitido', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$inviteId = (int)($input['invite_id'] ?? 0);

if (!$inviteId) {
    jsonResponse(false, null, 'invite_id requerido', 400);
}

// Verify this invite belongs to a technician of this dealer
$db = getDB();
$check = $db->prepare("SELECT si.id FROM session_invites si JOIN technicians t ON t.id = si.technician_id WHERE si.id = :iid AND t.dealer_id = :did");
$check->execute([':iid' => $inviteId, ':did' => currentDealerId()]);
if (!$check->fetch()) {
    jsonResponse(false, null, 'Invitación no encontrada o no pertenece a su dealer', 403);
}

$ok = TrainingSession::confirmInvite($inviteId, currentUserId());
if ($ok) {
    jsonResponse(true, ['message' => 'Asistencia confirmada']);
} else {
    jsonResponse(false, null, 'No se pudo confirmar', 500);
}
