<?php
/*
 * config.php - shared helpers for every file in the api folder.
 * Change DB_USER / DB_PASS here if your MySQL is not the XAMPP default.
 */
date_default_timezone_set('Asia/Manila');

const DB_HOST = '127.0.0.1';
const DB_NAME = 'dmc_carevault';
const DB_USER = 'root';
const DB_PASS = '';

// An error whose message is safe to show to the user (bad input, no permission...).
class UserError extends Exception {}

header('Content-Type: application/json; charset=utf-8');

set_exception_handler(function ($e) {
    if ($e instanceof UserError) {
        json_out(['message' => $e->getMessage()], 400);
    }
    error_log($e->getMessage());
    json_out(['message' => 'Server error: ' . $e->getMessage()], 500);
});

function json_out($data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $pdo->exec("SET time_zone = '+08:00'");
    }
    return $pdo;
}

function read_body(): array {
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

function start_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
        session_start();
    }
}

// The logged-in user, read again from the database every time (so a changed role
// or a deactivated account takes effect immediately). Null when nobody is logged in.
function current_user(): ?array {
    start_session();
    if (empty($_SESSION['username'])) {
        return null;
    }
    $st = db()->prepare('SELECT id, username, full_name, role, is_active FROM users WHERE username = ?');
    $st->execute([$_SESSION['username']]);
    $u = $st->fetch();
    if (!$u || !$u['is_active']) {
        return null;
    }
    return ['id' => $u['id'], 'username' => $u['username'], 'fullName' => $u['full_name'], 'role' => $u['role']];
}

function require_login(): array {
    $u = current_user();
    if ($u === null) {
        json_out(['message' => 'Please log in again.'], 401);
    }
    return $u;
}

function log_action(?string $username, ?string $role, string $action, ?string $details): void {
    $st = db()->prepare('INSERT INTO audit_logs (username, role, action_name, details) VALUES (?, ?, ?, ?)');
    $st->execute([
        mb_substr($username ?? 'unknown', 0, 20),
        $role === null ? null : mb_substr($role, 0, 20),
        mb_substr($action, 0, 100),
        $details === null ? null : mb_substr($details, 0, 255),
    ]);
}
