<?php
/*
 * patient/api/account.php - patient registration, "who is logged in", and logout.
 * New accounts start as Pending. Patients aged 18 or younger must give a guardian.
 */
require __DIR__ . '/../../api/config.php';

const GUARDIAN_AGE_LIMIT = 18;

function patient_session_start(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_name('patient_session');
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'path' => '/']);
        session_start();
    }
}

function clean_text($value): string {
    return trim((string)($value ?? ''));
}

// The public details of an approved, active patient account, or null.
function patient_summary(int $accountId): ?array {
    $st = db()->prepare("SELECT username, full_name FROM patient_accounts WHERE id = ? AND is_active = 1 AND status = 'Approved'");
    $st->execute([$accountId]);
    $row = $st->fetch();
    if (!$row) {
        return null;
    }
    return ['username' => $row['username'], 'fullName' => $row['full_name']];
}

patient_session_start();
$action = $_GET['action'] ?? '';
$in = read_body();

if ($action === 'register') {
    $username             = clean_text($in['username'] ?? '');
    $password             = (string)($in['password'] ?? '');
    $fullName             = clean_text($in['fullName'] ?? '');
    $birthDate            = clean_text($in['birthDate'] ?? '');
    $gender               = clean_text($in['gender'] ?? '');
    $contact              = clean_text($in['contactNumber'] ?? '');
    $email                = clean_text($in['email'] ?? '');
    $guardianName         = clean_text($in['guardianName'] ?? '');
    $guardianContact      = clean_text($in['guardianContact'] ?? '');
    $guardianRelationship = clean_text($in['guardianRelationship'] ?? '');

    if (!preg_match('/^[a-zA-Z0-9_.]{3,20}$/', $username)) {
        throw new UserError('Username must be 3 to 20 characters (letters, numbers, _ or .).');
    }
    if (strlen($password) < 8) {
        throw new UserError('Password must be at least 8 characters.');
    }
    if (strlen($password) > 72) {
        throw new UserError('Password is too long (72 characters at most).');
    }
    if (!preg_match('/^\p{L}[\p{L}\p{M}\s.\'\-]*$/u', $fullName) || mb_strlen($fullName) > 100) {
        throw new UserError('Full name must contain letters only (no numbers or special characters).');
    }
    $dateIsValid = preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $birthDate, $m)
        && checkdate((int)$m[2], (int)$m[3], (int)$m[1]);
    if (!$dateIsValid) {
        throw new UserError('Date of birth is not valid.');
    }
    if ($birthDate > date('Y-m-d')) {
        throw new UserError('Date of birth cannot be in the future.');
    }
    if (!in_array($gender, ['Male', 'Female'], true)) {
        throw new UserError('Choose Male or Female.');
    }
    if (!preg_match('/^09[0-9]{9}$/', $contact)) {
        throw new UserError('Contact number must be 11 digits and start with 09 (example: 09171234567).');
    }
    if ($email !== '' && (mb_strlen($email) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL))) {
        throw new UserError('Email address is not valid.');
    }

    // Guardian rules: required automatically when the patient is 18 or younger.
    $age = (new DateTime($birthDate))->diff(new DateTime('today'))->y;
    if ($age <= GUARDIAN_AGE_LIMIT) {
        if ($guardianName === '') {
            throw new UserError('A parent or guardian name is required for patients aged ' . GUARDIAN_AGE_LIMIT . ' or younger.');
        }
        if (!preg_match('/^\p{L}[\p{L}\p{M}\s.\'\-]*$/u', $guardianName) || mb_strlen($guardianName) > 100) {
            throw new UserError('Guardian name must contain letters only (no numbers or special characters).');
        }
        if (!preg_match('/^09[0-9]{9}$/', $guardianContact)) {
            throw new UserError('Guardian contact number must be 11 digits and start with 09 (example: 09171234567).');
        }
        $allowedRelationships = ['Parent', 'Guardian', 'Grandparent', 'Sibling', 'Relative'];
        if (!in_array($guardianRelationship, $allowedRelationships, true)) {
            throw new UserError('Choose the guardian\'s relationship to the patient.');
        }
    } else {
        // Adults do not need a guardian, so nothing is saved.
        $guardianName = '';
        $guardianContact = '';
        $guardianRelationship = '';
    }

    $pdo = db();

    // The username must be free in both the patient and the staff tables.
    $check = $pdo->prepare('SELECT id FROM patient_accounts WHERE username = ?');
    $check->execute([$username]);
    if ($check->fetch()) {
        throw new UserError('That username is already taken.');
    }
    $staffCheck = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $staffCheck->execute([$username]);
    if ($staffCheck->fetch()) {
        throw new UserError('That username is already taken.');
    }

    try {
        $insert = $pdo->prepare("INSERT INTO patient_accounts
            (username, password_hash, full_name, birth_date, gender, contact_number, email,
             guardian_name, guardian_contact, guardian_relationship, status, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 1)");
        $insert->execute([
            $username,
            password_hash($password, PASSWORD_DEFAULT),
            $fullName,
            $birthDate,
            $gender,
            $contact,
            $email === '' ? null : $email,
            $guardianName === '' ? null : $guardianName,
            $guardianContact === '' ? null : $guardianContact,
            $guardianRelationship === '' ? null : $guardianRelationship,
        ]);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            throw new UserError('That username is already taken.');
        }
        throw $e;
    }

    // No session is started here. The patient must wait for approval.
    json_out([
        'success' => true,
        'pending' => true,
        'message' => 'Your account was created and is waiting for approval by the clinic. You can sign in once it is approved.',
    ]);
}

if ($action === 'me') {
    $accountId = $_SESSION['patient_account_id'] ?? null;
    $account = $accountId === null ? null : patient_summary((int)$accountId);
    if ($account === null) {
        unset($_SESSION['patient_account_id']);
    }
    json_out(['loggedIn' => $account !== null, 'account' => $account]);
}

if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    json_out(['ok' => true]);
}

throw new UserError('Unknown action.');