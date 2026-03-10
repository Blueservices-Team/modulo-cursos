<?php
/**
 * CRUD /api/training/technicians.php
 * GET    - list technicians (dealer sees own, corp sees all or filter ?dealer_id=)
 * POST   - create technician (dealer only, own dealer)
 * PUT    - update technician  ?id=X
 * DELETE - delete technician  ?id=X
 */
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../models/Technician.php';

header('Content-Type: application/json; charset=utf-8');
requireAnyRole();

$method = $_SERVER['REQUEST_METHOD'];

/* ── GET ─────────────────────────────────── */
if ($method === 'GET') {
    if (isDealer()) {
        $list = Technician::listByDealer(currentDealerId());
    } elseif (!empty($_GET['dealer_id'])) {
        $list = Technician::listByDealer((int)$_GET['dealer_id']);
    } else {
        $list = Technician::listAll();
    }
    jsonResponse(true, $list);

/* ── POST (create) ───────────────────────── */
} elseif ($method === 'POST') {
    requireDealer();
    $input = json_decode(file_get_contents('php://input'), true);

    $nombre   = trim($input['nombre'] ?? '');
    $email    = trim($input['email'] ?? '') ?: null;
    $rfc      = trim($input['rfc'] ?? '') ?: null;
    $telefono = trim($input['telefono'] ?? '') ?: null;

    if (!$nombre) {
        jsonResponse(false, null, 'El nombre es obligatorio', 400);
    }

    $id = Technician::create(currentDealerId(), $nombre, $email, $rfc, $telefono);
    jsonResponse(true, ['id' => $id, 'message' => 'Técnico creado'], null, 201);

/* ── PUT (update) ────────────────────────── */
} elseif ($method === 'PUT') {
    requireDealer();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'id requerido', 400);

    // Verify ownership
    $tech = Technician::getById($id);
    if (!$tech || $tech['dealer_id'] != currentDealerId()) {
        jsonResponse(false, null, 'Técnico no encontrado', 404);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $nombre   = trim($input['nombre'] ?? $tech['nombre']);
    $email    = trim($input['email'] ?? '') ?: $tech['email'];
    $rfc      = trim($input['rfc'] ?? '') ?: $tech['rfc'];
    $telefono = trim($input['telefono'] ?? '') ?: $tech['telefono'];
    $activo   = isset($input['activo']) ? (int)$input['activo'] : (int)$tech['activo'];

    Technician::update($id, $nombre, $email, $rfc, $telefono, $activo);
    jsonResponse(true, ['message' => 'Técnico actualizado']);

/* ── DELETE ───────────────────────────────── */
} elseif ($method === 'DELETE') {
    requireDealer();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonResponse(false, null, 'id requerido', 400);

    $tech = Technician::getById($id);
    if (!$tech || $tech['dealer_id'] != currentDealerId()) {
        jsonResponse(false, null, 'Técnico no encontrado', 404);
    }

    Technician::delete($id);
    jsonResponse(true, ['message' => 'Técnico eliminado']);

} else {
    jsonResponse(false, null, 'Método no permitido', 405);
}
