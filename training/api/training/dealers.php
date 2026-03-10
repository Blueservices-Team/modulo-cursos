<?php
/**
 * GET /api/training/dealers.php - list all active dealers (corporativo)
 */
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../models/Dealer.php';

header('Content-Type: application/json; charset=utf-8');
requireCorporate();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, null, 'Método no permitido', 405);
}

$dealers = Dealer::listAll();
jsonResponse(true, $dealers);
