<?php
/*
 * api/my-pin.php - a signed-in staff member changes their own PIN from Settings.
 * Needs: the current account password, then the new PIN typed twice.
 * Wrong passwords count toward the same lock as wrong PINs.
 */
require __DIR__ . '/config.php';
require_once __DIR__ . '/pin-rules.php';

$action = $_GET['action'] ?? '';
$in = read_body();
$me = require_login();

if ($action !== 'change') {
    throw new UserError('Unknown action.');
}

$pdo = db();
$st = $pdo->prepare('SELECT * FROM users WHERE username = ? AND is_active = 1');
$st->execute([$me['username']]);
$user = $st->fetch();
if (!$user) {
    json_out(['success' => false, 'message' => 'Please sign in again.'], 401);
}

// Wait if the account is locked by too many wrong attempts.
$lockStmt = $pdo->prepare('SELECT GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), pin_locked_until)) FROM users WHERE username = ?');
$lockStmt->execute([$user['username']]);
$wait = (int)$lockStmt->fetchColumn();
if ($wait > 0) {
    json_out(['success' => false, 'message' => 'Too many wrong attempts. Try again in ' . ceil($wait / 60) . ' minute(s).'], 429);
}

$currentPassword = (string)($in['currentPassword'] ?? '');
$newPin          = trim((string)($in['newPin'] ?? ''));
$confirm         = trim((string)($in['confirm'] ?? ''));

// 1. The account password must be right before anything changes.
if (!password_verify($currentPassword, $user['password_hash'])) {
    $fails = (int)$user['pin_fails'] + 1;
    if ($fails >= PIN_MAX_TRIES) {
        $pdo->prepare('UPDATE users SET pin_fails = 0, pin_locked_until = NOW() + INTERVAL ' . PIN_LOCK_MINUTES . ' MINUTE WHERE username = ?')
            ->execute([$user['username']]);
        log_action($user['username'], $user['role'], 'PIN locked', 'Too many wrong passwords (change PIN)');
        json_out(['success' => false, 'message' => 'Too many wrong attempts. Your PIN settings are locked for ' . PIN_LOCK_MINUTES . ' minutes.'], 429);
    }
    $pdo->prepare('UPDATE users SET pin_fails = ? WHERE username = ?')->execute([$fails, $user['username']]);
    log_action($user['username'], $user['role'], 'Login failed', 'Wrong password (change PIN)');
    json_out(['success' => false, 'message' => 'Your current password is wrong. ' . (PIN_MAX_TRIES - $fails) . ' tries left.'], 400);
}

// 2. The new PIN must be typed the same way twice and be hard to guess.
if (!preg_match('/^\d{4,6}$/', $newPin)) {
    json_out(['success' => false, 'message' => 'The new PIN must be 4 to 6 digits.'], 400);
}
if ($newPin !== $confirm) {
    json_out(['success' => false, 'message' => 'The two new PINs do not match. Type the same PIN in both boxes.'], 400);
}
if (pin_is_weak($newPin)) {
    json_out(['success' => false, 'message' => 'Choose a PIN that is harder to guess. Avoid repeated digits or counting numbers such as 1111 or 1234.'], 400);
}
if ($user['pin_hash'] !== null && password_verify($newPin, $user['pin_hash'])) {
    json_out(['success' => false, 'message' => 'Choose a PIN different from your current one.'], 400);
}

// 3. Save the new PIN and clear the counters.
$pdo->prepare('UPDATE users SET pin_hash = ?, pin_fails = 0, pin_locked_until = NULL WHERE username = ?')
    ->execute([password_hash($newPin, PASSWORD_DEFAULT), $user['username']]);
log_action($user['username'], $user['role'], 'PIN changed', 'User changed their own PIN');

json_out(['success' => true]);