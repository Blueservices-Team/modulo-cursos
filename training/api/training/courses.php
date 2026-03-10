<?php
/**
 * GET /api/training/courses.php - list all active courses
 */
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../models/Course.php';

header('Content-Type: application/json; charset=utf-8');
requireAnyRole();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, null, 'Método no permitido', 405);
}

$courses = Course::listAll();
jsonResponse(true, $courses);
