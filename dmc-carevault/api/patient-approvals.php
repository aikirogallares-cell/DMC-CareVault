<?php
/*
 * api/patient-approvals.php - the Admin lists, approves and rejects patient registrations.
 * Approving also creates the patient's record in Patient Records.
 */
require __DIR__ . '/config.php';

$user = require_login();
if ($user['role'] !== 'Admin') {
    json_out(['success' => false, 'message' => 'Only the administrator can review patient accounts.'], 403);
}

$pdo = db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $filter = $_GET['status'] ?? 'Pending';
    if (!in_array($filter, ['Pending', 'Approved', 'Rejected', 'All'], true)) {
        throw new UserError('Unknown filter.');
    }

    $columns = 'SELECT id, username, full_name, contact_number, birth_date, gender, email,
        guardian_name, guardian_contact, guardian_relationship, status, reject_reason,
        approved_by, approved_at, created_at, patient_id FROM patient_accounts';
    if ($filter === 'All') {
        $st = $pdo->query($columns . ' ORDER BY created_at DESC, id DESC');
    } else {
        $st = $pdo->prepare($columns . ' WHERE status = ? ORDER BY created_at DESC, id DESC');
        $st->execute([$filter]);
    }
    $accounts = $st->fetchAll();

    $counts = ['Pending' => 0, 'Approved' => 0, 'Rejected' => 0];
    foreach ($pdo->query('SELECT status, COUNT(*) AS n FROM patient_accounts GROUP BY status')->fetchAll() as $row) {
        $counts[$row['status']] = (int)$row['n'];
    }

    json_out(['success' => true, 'accounts' => $accounts, 'counts' => $counts]);
}

// Creates the Patient Records entry from the registration answers. Returns the new patient ID.
function create_patient_record(PDO $pdo, array $account): string {
    if (empty($account['gender'])) {
        throw new UserError('This account has no gender on file, so it cannot be approved. Reject it and ask the patient to register again.');
    }

    // The registration asks for one full name. The last word becomes the last name, the rest the first name.
    $parts = preg_split('/\s+/', trim($account['full_name']));
    $lastName = array_pop($parts);
    $firstName = $parts ? implode(' ', $parts) : $lastName;
    if (mb_strlen($firstName) > 60 || mb_strlen($lastName) > 60) {
        throw new UserError('The name is too long for Patient Records. Shorten it, then approve again.');
    }

    // Random ID such as P-483920, not used yet.
    do {
        $patientId = 'P-' . random_int(100000, 999999);
        $check = $pdo->prepare('SELECT COUNT(*) FROM patients WHERE id = ?');
        $check->execute([$patientId]);
    } while ((int)$check->fetchColumn() > 0);

    $isGuardianNeeded = !empty($account['guardian_name']);

    $pdo->prepare('INSERT INTO patients
        (id, first_name, middle_name, last_name, birth_date, gender, civil_status, contact_number,
         emergency_name, emergency_relationship, emergency_contact_number,
         blood_type, allergies, medical_conditions, current_medications,
         date_registered, last_visit, is_archived, is_pwd)
        VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, 0)')
        ->execute([
            $patientId,
            $firstName,
            $lastName,
            $account['birth_date'],
            $account['gender'],
            'Single',
            $account['contact_number'],
            $isGuardianNeeded ? $account['guardian_name'] : null,
            $isGuardianNeeded ? $account['guardian_relationship'] : null,
            $isGuardianNeeded ? $account['guardian_contact'] : null,
            'Unknown',
            'None',
            'None',
            'None',
            date('Y-m-d'),
        ]);

    return $patientId;
}

$in     = read_body();
$id     = (int)($in['id'] ?? 0);
$action = (string)($in['action'] ?? '');

$st = $pdo->prepare('SELECT * FROM patient_accounts WHERE id = ?');
$st->execute([$id]);
$account = $st->fetch();
if (!$account) {
    throw new UserError('Account not found.');
}

if ($action === 'approve') {
    $pdo->beginTransaction();
    try {
        // Only create a Patient Records entry the first time the account is approved.
        $patientId = $account['patient_id'] ?: create_patient_record($pdo, $account);

        $pdo->prepare("UPDATE patient_accounts SET status = 'Approved', reject_reason = NULL, approved_by = ?, approved_at = NOW(), patient_id = ? WHERE id = ?")
            ->execute([$user['username'], $patientId, $id]);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }

    log_action($user['username'], $user['role'], 'Patient account approved',
        $account['username'] . ' (' . $account['full_name'] . ') -> ' . $patientId);
    json_out(['success' => true, 'patientId' => $patientId]);
}

if ($action === 'reject') {
    $reason = trim((string)($in['reason'] ?? ''));
    if ($reason === '') {
        throw new UserError('Write a reason for rejecting this account.');
    }
    if (mb_strlen($reason) > 255) {
        throw new UserError('Reason is too long (255 characters at most).');
    }
    $pdo->prepare("UPDATE patient_accounts SET status = 'Rejected', reject_reason = ?, approved_by = ?, approved_at = NOW() WHERE id = ?")
        ->execute([$reason, $user['username'], $id]);
    log_action($user['username'], $user['role'], 'Patient account rejected', $account['username'] . ': ' . $reason);
    json_out(['success' => true]);
}

throw new UserError('Unknown action.');