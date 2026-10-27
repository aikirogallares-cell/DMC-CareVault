<?php
// config/db.php - the database connection.
// Keep this file private. It holds the database password.

define("DB_HOST", "localhost");
define("DB_NAME", "dmc_carevault");
define("DB_USER", "carevault_app");
define("DB_PASS", "CareVault2026Secure");

function getDatabase(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
    }
    return $pdo;
}

// Sends an answer to the browser as JSON, then stops the script.
function sendJson($data, int $status = 200): void
{
    http_response_code($status);
    header("Content-Type: application/json; charset=utf-8");
    header("Cache-Control: no-store");
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}