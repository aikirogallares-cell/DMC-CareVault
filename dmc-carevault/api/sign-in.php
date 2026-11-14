<?php
/*
 * api/sign-in.php - one login for everyone.
 * Staff (users table): password, then PIN (clinic-pin.html), then the dashboard.
 * Patients (patient_accounts table): password, then the patient page.
 */
require __DIR__ . '/config.php';

$in       = read_body();
$username = trim((string)($in['username'] ?? ''));
$password = (string)($in['password'] ?? '');

if ($username === '' || $password === '') {
    json_out(['success' => false, 'message' => 'Please enter your username and password.'], 400);
}

$pdo = db();

// 1. Staff accounts: Admin, Doctor or Staff, decided by the role saved in the database.
$st = $pdo->prepare('SELECT * FROM users WHERE username = ?');
$st->execute([$username]);
$staff = $st->fetch();

if ($staff && password_verify($password, $staff['password_hash'])) {
    if (!$staff['is_active']) {
        json_out(['success' => false, 'message' => 'This account is deactivated. Please contact the administrator.'], 403);
    }

    // Password is right. The user still has to enter the PIN.
    start_session();
    session_regenerate_id(true);
    unset($_SESSION['username']);
    $_SESSION['pending_user']  = $staff['username'];
    $_SESSION['pending_since'] = time();

    json_out(['success' => true, 'area' => 'staff', 'redirect' => 'clinic-pin.html']);
}

// 2. Patient accounts (their own session name, so they never mix with staff).
$st = $pdo->prepare('SELECT id, password_hash, is_active FROM patient_accounts WHERE username = ?');
$st->execute([$username]);
$patient = $st->fetch();

if ($patient && password_verify($password, $patient['password_hash'])) {
    if (!$patient['is_active']) {
        json_out(['success' => false, 'message' => 'This account is deactivated. Please contact the clinic.'], 403);
    }

    session_name('patient_session');
    session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'path' => '/']);
    session_start();
    session_regenerate_id(true);
    $_SESSION['patient_account_id'] = (int)$patient['id'];

    json_out(['success' => true, 'area' => 'patient', 'redirect' => 'patient/patientpage.html']);
}

// Same message for an unknown username and a wrong password, so usernames cannot be guessed.
log_action($username, 'unknown', 'Login failed', 'Wrong username or password');
json_out(['success' => false, 'message' => 'Wrong username or password.'], 401);