<?php
/**
 * GET  /api/training/sessions.php?from=&to=&dealer_id=&location=&q=
 * POST /api/training/sessions.php  (create session - corporativo only)
 */
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../config/features.php';
require_once __DIR__ . '/../../models/TrainingSession.php';
require_once __DIR__ . '/../../models/Course.php';

header('Content-Type: application/json; charset=utf-8');
requireAnyRole();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $filters = [
        'from'      => $_GET['from'] ?? null,
        'to'        => $_GET['to'] ?? null,
        'dealer_id' => $_GET['dealer_id'] ?? null,
        'location'  => $_GET['location'] ?? null,
        'q'         => $_GET['q'] ?? null,
    ];

    // If dealer, auto-filter to their own dealer
    if (isDealer()) {
        $filters['dealer_id'] = currentDealerId();
    }

    $sessions = TrainingSession::list($filters);
    jsonResponse(true, $sessions);

} elseif ($method === 'POST') {
    requireCorporate();

    $input = json_decode(file_get_contents('php://input'), true);
    $courseId = (int)($input['course_id'] ?? 0);
    $date    = trim($input['session_date'] ?? '');
    $location = (int)($input['location_code'] ?? 0);

    // Validate
    if (!$courseId || !$date || $location < 1 || $location > 4) {
        jsonResponse(false, null, 'Campos requeridos: course_id, session_date, location_code (1-4)', 400);
    }

    $course = Course::getById($courseId);
    if (!$course) {
        jsonResponse(false, null, 'Curso no encontrado', 404);
    }

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        jsonResponse(false, null, 'Formato de fecha inválido (YYYY-MM-DD)', 400);
    }

    $id = TrainingSession::create($courseId, $date, $location, currentUserId());
    jsonResponse(true, ['id' => $id, 'message' => 'Sesión creada correctamente'], null, 201);

} else {
    jsonResponse(false, null, 'Método no permitido', 405);
}
