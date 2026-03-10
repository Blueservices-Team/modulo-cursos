<?php
/**
 * POST /api/training/history.php  - import manual history record (corporativo)
 * GET  /api/training/history.php  - list history (?technician_id= optional)
 */
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../models/TrainingHistory.php';
require_once __DIR__ . '/../../models/Technician.php';

header('Content-Type: application/json; charset=utf-8');
requireAnyRole();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $techId = (int)($_GET['technician_id'] ?? 0);
    if ($techId) {
        // If dealer, verify ownership
        if (isDealer()) {
            $tech = Technician::getById($techId);
            if (!$tech || $tech['dealer_id'] != currentDealerId()) {
                jsonResponse(false, null, 'Técnico no encontrado', 404);
            }
        }
        $data = TrainingHistory::listByTechnician($techId);
    } else {
        if (isDealer()) {
            jsonResponse(false, null, 'technician_id requerido para dealer', 400);
        }
        $data = TrainingHistory::listAll();
    }
    jsonResponse(true, $data);

} elseif ($method === 'POST') {
    requireCorporate();

    $input = json_decode(file_get_contents('php://input'), true);
    $techId     = (int)($input['technician_id'] ?? 0);
    $courseName = trim($input['course_name'] ?? '');
    $date       = trim($input['training_date'] ?? '') ?: null;
    $result     = trim($input['result'] ?? '') ?: null;
    $certFile   = trim($input['certificate_file'] ?? '') ?: null;

    if (!$techId || !$courseName) {
        jsonResponse(false, null, 'technician_id y course_name requeridos', 400);
    }

    $tech = Technician::getById($techId);
    if (!$tech) {
        jsonResponse(false, null, 'Técnico no encontrado', 404);
    }

    $id = TrainingHistory::import($techId, $courseName, $date, $result, $certFile, currentUserId());
    jsonResponse(true, ['id' => $id, 'message' => 'Registro histórico importado'], null, 201);

} else {
    jsonResponse(false, null, 'Método no permitido', 405);
}
