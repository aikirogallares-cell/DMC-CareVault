<?php
/*
 * api/pin.php - the PIN step of staff sign-in (after the password).
 * status -> is a PIN already set, and is it locked?
 * set    -> first sign-in only: creates the PIN, then signs in
 * verify -> checks the PIN, then signs in
 */
require __DIR__ . '/config.php';
require_once __DIR__ . '/pin-rules.php';

start_session();
$action = $_GET['action'] ?? '';
$in = read_body();

const PENDING_MINUTES = 5;   // the password check counts for 5 minutes

// The staff member who passed the password check.
function pending_staff_row(): array {
    $name = $_SESSION['pending_user'] ?? null;
    if ($name === null || time() - (int)($_SESSION['pending_since'] ?? 0) > PENDING_MINUTES * 60) {
        unset($_SESSION['pending_user'], $_SESSION['pending_since']);
        json_out(['success' => false, 'message' => 'Your sign-in has expired. Please sign in again.'], 401);
    }
    $st = db()->prepare('SELECT * FROM users WHERE username = ? AND is_active = 1');
    $st->execute([$name]);
    $user = $st->fetch();
    if (!$user) {
        json_out(['success' => false, 'message' => 'Please sign in again.'], 401);
    }
    return $user;
}

// Seconds left on a PIN lock, or 0 when the PIN is not locked.
function pin_lock_seconds(string $username): int {
    $st = db()->prepare('SELECT GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), pin_locked_until)) FROM users WHERE username = ?');
    $st->execute([$username]);
    return (int)$st->fetchColumn();
}

// Signs the user in. Called only after the PIN is correct.
function finish_sign_in(array $user): void {
    session_regenerate_id(true);
    unset($_SESSION['pending_user'], $_SESSION['pending_since']);
    $_SESSION['username'] = $user['username'];
    db()->prepare('UPDATE users SET pin_fails = 0 WHERE username = ?')->execute([$user['username']]);
    log_action($user['username'], $user['role'], 'Login', 'Signed in with PIN');

    $pages = ['Admin' => 'admin-dashboard.html', 'Staff' => 'staff-dashboard.html', 'Doctor' => 'doctor-dashboard.html'];
    json_out([
        'success'  => true,
        'user'     => ['username' => $user['username'], 'fullName' => $user['full_name'], 'role' => $user['role']],
        'redirect' => 'pages/' . ($pages[$user['role']] ?? 'doctor-dashboard.html'),
    ]);
}

$user = pending_staff_row();

if ($action === 'status') {
    json_out([
        'success'     => true,
        'mode'        => $user['pin_hash'] === null ? 'set' : 'verify',
        'fullName'    => $user['full_name'],
        'lockSeconds' => pin_lock_seconds($user['username']),
    ]);
}

if ($action === 'set') {
    if ($user['pin_hash'] !== null) {
        json_out(['success' => false, 'message' => 'Your PIN is already set. Enter it instead.'], 400);
    }
    $pin     = trim((string)($in['pin'] ?? ''));
    $confirm = trim((string)($in['confirm'] ?? ''));
    if (!preg_match('/^\d{4,6}$/', $pin)) {
        json_out(['success' => false, 'message' => 'Your PIN must be 4 to 6 digits.'], 400);
    }
    if ($pin !== $confirm) {
        json_out(['success' => false, 'message' => 'The two PINs do not match.'], 400);
    }
    if (pin_is_weak($pin)) {
        json_out(['success' => false, 'message' => 'Choose a PIN that is harder to guess. Avoid repeated digits or counting numbers such as 1111 or 1234.'], 400);
    }

    db()->prepare('UPDATE users SET pin_hash = ?, pin_fails = 0, pin_locked_until = NULL WHERE username = ?')
        ->execute([password_hash($pin, PASSWORD_DEFAULT), $user['username']]);
    log_action($user['username'], $user['role'], 'PIN set', 'Personal PIN created');
    finish_sign_in($user);
}

if ($action === 'verify') {
    if ($user['pin_hash'] === null) {
        json_out(['success' => false, 'message' => 'Set your PIN first.'], 400);
    }
    $wait = pin_lock_seconds($user['username']);
    if ($wait > 0) {
        json_out(['success' => false, 'message' => 'Too many wrong PINs. Try again in ' . ceil($wait / 60) . ' minute(s).'], 429);
    }

    $pin = trim((string)($in['pin'] ?? ''));
    if (preg_match('/^\d{4,6}$/', $pin) && password_verify($pin, $user['pin_hash'])) {
        finish_sign_in($user);
    }

    $fails = (int)$user['pin_fails'] + 1;
    if ($fails >= PIN_MAX_TRIES) {
        db()->prepare('UPDATE users SET pin_fails = 0, pin_locked_until = NOW() + INTERVAL ' . PIN_LOCK_MINUTES . ' MINUTE WHERE username = ?')
            ->execute([$user['username']]);
        log_action($user['username'], $user['role'], 'PIN locked', 'Too many wrong PINs');
        json_out(['success' => false, 'message' => 'Too many wrong PINs. Your PIN is locked for ' . PIN_LOCK_MINUTES . ' minutes.'], 429);
    }

    db()->prepare('UPDATE users SET pin_fails = ? WHERE username = ?')->execute([$fails, $user['username']]);
    log_action($user['username'], $user['role'], 'Login failed', 'Wrong PIN');
    json_out(['success' => false, 'message' => 'Wrong PIN. ' . (PIN_MAX_TRIES - $fails) . ' tries left.'], 400);
}

throw new UserError('Unknown action.');