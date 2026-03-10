<?php
/**
 * POST /api/training/invite.php  { session_id, technician_ids: [int] }
 *   Corporativo adds technicians to a session
 *
 * GET  /api/training/invite.php?session_id=X
 *   List invites for a session
 */
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../models/TrainingSession.php';

header('Content-Type: application/json; charset=utf-8');
requireAnyRole();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sessionId = (int)($_GET['session_id'] ?? 0);
    if (!$sessionId) {
        jsonResponse(false, null, 'session_id requerido', 400);
    }

    $dealerId = isDealer() ? currentDealerId() : null;
    $invites = TrainingSession::getInvites($sessionId, $dealerId);
    jsonResponse(true, $invites);

} elseif ($method === 'POST') {
    requireCorporate();

    $input = json_decode(file_get_contents('php://input'), true);
    $sessionId = (int)($input['session_id'] ?? 0);
    $techIds   = $input['technician_ids'] ?? [];

    if (!$sessionId || empty($techIds) || !is_array($techIds)) {
        jsonResponse(false, null, 'session_id y technician_ids[] requeridos', 400);
    }

    $session = TrainingSession::getById($sessionId);
    if (!$session) {
        jsonResponse(false, null, 'Sesión no encontrada', 404);
    }

    $added = TrainingSession::addInvites($sessionId, $techIds);
    jsonResponse(true, ['added' => $added, 'message' => "{$added} técnico(s) invitado(s)"]);

} else {
    jsonResponse(false, null, 'Método no permitido', 405);
}
