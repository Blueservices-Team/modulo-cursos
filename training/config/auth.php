<?php
/**
 * Auth & Access helpers
 * Assumes session already started by the existing system.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function currentRole(): string {
    return $_SESSION['role'] ?? '';
}

function currentDealerId(): ?int {
    return isset($_SESSION['dealer_id']) ? (int)$_SESSION['dealer_id'] : null;
}

function currentUserId(): ?int {
    return isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
}

function isCorporate(): bool {
    return currentRole() === 'ADMIN_MASTER';
}

function isDealer(): bool {
    return currentRole() === 'DEALER_ADMIN';
}

function requireCorporate(): void {
    if (!isCorporate()) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Acceso denegado: solo corporativo']);
        exit;
    }
}

function requireDealer(): void {
    if (!isDealer()) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Acceso denegado: solo dealer']);
        exit;
    }
}

function requireAnyRole(): void {
    if (!isCorporate() && !isDealer()) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'No autenticado']);
        exit;
    }
}

/**
 * JSON response helper
 */
function jsonResponse(bool $ok, $data = null, ?string $error = null, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    $resp = ['ok' => $ok];
    if ($data !== null) $resp['data'] = $data;
    if ($error !== null) $resp['error'] = $error;
    echo json_encode($resp, JSON_UNESCAPED_UNICODE);
    exit;
}
