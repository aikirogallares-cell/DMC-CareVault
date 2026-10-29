<?php
/*
 * auth.php - login, logout and change password. Passwords are checked here on the
 * server with password_verify() against the bcrypt hashes in the `users` table.
 */
require __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';
$in = read_body();

if ($action === 'login') {
    $username = trim((string)($in['username'] ?? ''));
    $password = (string)($in['password'] ?? '');

    $st = db()->prepare('SELECT * FROM users WHERE username = ?');
    $st->execute([$username]);
    $u = $st->fetch();

    if (!$u || !password_verify($password, $u['password_hash'])) {
        log_action($username, 'unknown', 'Login failed', 'Wrong username or password');
        json_out(['success' => false, 'message' => 'Invalid username or password.']);
    }
    if (!$u['is_active']) {
        json_out(['success' => false, 'message' => 'This account is deactivated. Please contact the administrator.']);
    }

    start_session();
    session_regenerate_id(true);
    $_SESSION['username'] = $u['username'];
    log_action($u['username'], $u['role'], 'Login', 'Signed in');

    json_out(['success' => true, 'user' => [
        'id' => $u['id'], 'username' => $u['username'], 'fullName' => $u['full_name'], 'role' => $u['role'],
    ]]);
}

if ($action === 'logout') {
    $u = current_user();
    if ($u !== null) {
        log_action($u['username'], $u['role'], 'Logout', 'Signed out');
    }
    start_session();
    $_SESSION = [];
    session_destroy();
    json_out(['ok' => true]);
}

if ($action === 'changePassword') {
    $u = require_login();
    $current = (string)($in['currentPassword'] ?? '');
    $new = (string)($in['newPassword'] ?? '');

    $st = db()->prepare('SELECT password_hash FROM users WHERE id = ?');
    $st->execute([$u['id']]);
    $hash = $st->fetchColumn();

    if (!$hash || !password_verify($current, $hash)) {
        throw new UserError('Current password is incorrect.');
    }
    if (strlen($new) < 8) {
        throw new UserError('Password must be at least 8 characters.');
    }

    $st = db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    $st->execute([password_hash($new, PASSWORD_DEFAULT), $u['id']]);
    log_action($u['username'], $u['role'], 'Password changed', 'User changed their own password');
    json_out(['ok' => true]);
}

throw new UserError('Unknown action.');
