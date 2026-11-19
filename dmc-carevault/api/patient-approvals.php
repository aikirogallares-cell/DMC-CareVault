<?php

// Returns the one Patient Records entry that matches ALL details of this account, or null.
// Used only when the match is exact. Any doubt (none found, or more than one) returns null.
function strong_match(PDO $pdo, array $acc): ?array {
    $parts = preg_split('/\s+/', trim((string)$acc['full_name']));
    if (count($parts) < 2) {
        return null;
    }
    $last  = strtolower((string)array_pop($parts));
    $given = strtolower(implode(' ', $parts));   // everything before the last name
    $email = strtolower(trim((string)($acc['email'] ?? '')));
    $phone = trim((string)($acc['contact_number'] ?? ''));
    $birth = (string)($acc['birth_date'] ?? '');

    if ($email === '' || $phone === '' || $birth === '') {
        return null;
    }

    $st = $pdo->prepare("SELECT id FROM patients
        WHERE is_archived = 0
          AND LOWER(last_name) = ?
          AND LOWER(CONCAT_WS(' ', first_name, middle_name)) = ?
          AND birth_date = ?
          AND contact_number = ?
          AND LOWER(email) = ?
          AND id NOT IN (SELECT patient_id FROM patient_accounts
                         WHERE patient_id IS NOT NULL AND id <> ?)");
    $st->execute([$last, $given, $birth, $phone, $email, (int)$acc['id']]);
    $rows = $st->fetchAll();

    return count($rows) === 1 ? $rows[0] : null;
}

// Finds existing Patient Records that may be the same person as this account.
// Strong signal: last name + birth date. Supporting signals: contact number, email.
// The admin always confirms; nothing is linked automatically.
function find_patient_matches(PDO $pdo, array $acc): array {
    $parts = preg_split('/\s+/', trim((string)$acc['full_name']));
    $lastName = strtolower((string)end($parts));
    $birth    = (string)$acc['birth_date'];
    $contact  = trim((string)($acc['contact_number'] ?? ''));
    $email    = strtolower(trim((string)($acc['email'] ?? '')));

    $where = [];
    $params = [];
    if ($lastName !== '' && $birth !== '') {
        $where[] = '(LOWER(last_name) = ? AND birth_date = ?)';
        $params[] = $lastName;
        $params[] = $birth;
    }
    if ($contact !== '') {
        $where[] = 'contact_number = ?';
        $params[] = $contact;
    }
    if ($email !== '') {
        $where[] = 'LOWER(email) = ?';
        $params[] = $email;
    }
    if (!$where) {
        return [];
    }

    $st = $pdo->prepare('SELECT id, first_name, middle_name, last_name, birth_date, contact_number, email
        FROM patients
        WHERE is_archived = 0 AND (' . implode(' OR ', $where) . ')
        ORDER BY last_name, first_name
        LIMIT 20');
    $st->execute($params);

    $matches = [];
    foreach ($st->fetchAll() as $row) {
        $reasons = [];
        if (strtolower((string)$row['last_name']) === $lastName && (string)$row['birth_date'] === $birth) {
            $reasons[] = 'Name and birth date';
        }
        if ($contact !== '' && (string)$row['contact_number'] === $contact) {
            $reasons[] = 'Contact number';
        }
        if ($email !== '' && strtolower((string)$row['email']) === $email) {
            $reasons[] = 'Email';
        }
        $row['reasons'] = $reasons;
        $matches[] = $row;
    }

    // Records that match on more signals come first.
    usort($matches, function ($a, $b) {
        return count($b['reasons']) <=> count($a['reasons']);
    });
    return $matches;
}

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
if (isset($_GET['matchFor'])) {
    $st = $pdo->prepare('SELECT full_name, birth_date, contact_number, email FROM patient_accounts WHERE id = ?');
    $st->execute([(int)$_GET['matchFor']]);
    $acc = $st->fetch();
    if (!$acc) {
        throw new UserError('Account not found.');
    }
    json_out(['success' => true, 'matches' => find_patient_matches($pdo, $acc)]);
}

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

    // Past history and family history share one field in Patient Records.
    $historyParts = [];
    if (!empty($account['past_medical_history'])) {
        $historyParts[] = 'Past: ' . $account['past_medical_history'];
    }
    if (!empty($account['family_history'])) {
        $historyParts[] = 'Family: ' . $account['family_history'];
    }
    $conditions = $historyParts ? implode(' | ', $historyParts) : 'None';
    $allergies = !empty($account['allergy_history']) ? $account['allergy_history'] : 'None';

    $pdo->prepare('INSERT INTO patients
        (id, first_name, middle_name, last_name, birth_date, gender, civil_status, contact_number, email, address,
        emergency_name, emergency_relationship, emergency_contact_number,
        blood_type, allergies, medical_conditions, current_medications,
        date_registered, last_visit, is_archived, is_pwd)
        VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, 0)')
        ->execute([
            $patientId,
            $firstName,
            $lastName,
            $account['birth_date'],
            $account['gender'],
            'Single',
            $account['contact_number'],
            $account['email'] !== null && $account['email'] !== '' ? strtolower($account['email']) : null,
            $account['address'] ?: null,
            $isGuardianNeeded ? $account['guardian_name'] : null,
            $isGuardianNeeded ? $account['guardian_relationship'] : null,
            $isGuardianNeeded ? $account['guardian_contact'] : null,
            'Unknown',
            $allergies,
            $conditions,
            'None',
            date('Y-m-d'),
    ]);

    return $patientId;
}

$in     = read_body();
$id     = (int)($in['id'] ?? 0);
$action = (string)($_GET['action'] ?? $in['action'] ?? '');

$st = $pdo->prepare('SELECT * FROM patient_accounts WHERE id = ?');
$st->execute([$id]);
$account = $st->fetch();
if (!$account) {
    throw new UserError('Account not found.');
}

if ($action === 'link') {
    $patientId = trim((string)($in['patientId'] ?? ''));
    $st = $pdo->prepare('SELECT id FROM patients WHERE id = ? AND is_archived = 0');
    $st->execute([$patientId]);
    if (!$st->fetch()) {
        throw new UserError('Patient record not found.');
    }
    $st = $pdo->prepare('SELECT id FROM patient_accounts WHERE patient_id = ? AND id <> ?');
    $st->execute([$patientId, $id]);
    if ($st->fetch()) {
        throw new UserError('That record is already linked to another account.');
    }
    $pdo->prepare("UPDATE patient_accounts SET status = 'Approved', reject_reason = NULL, approved_by = ?, approved_at = NOW(), patient_id = ? WHERE id = ?")
        ->execute([$user['username'], $patientId, $id]);
    log_action($user['username'], $user['role'], 'Patient account linked', $account['username'] . ' -> ' . $patientId);
    json_out(['success' => true, 'patientId' => $patientId]);
}

// Automatic link: only for approvals, and only when all four details match exactly one record.
if ($action === 'approve' && empty($account['patient_id'])) {
    $hit = strong_match($pdo, $account);
    if ($hit !== null) {
        $account['patient_id'] = $hit['id'];
    }
}

// Possible matches that are not exact: the admin chooses. Only for approvals.
if ($action === 'approve' && empty($account['patient_id']) && empty($in['createNew'])) {
    $found = find_patient_matches($pdo, $account);
    if ($found) {
        json_out(['success' => false, 'needsReview' => true, 'matches' => $found,
            'message' => 'A patient record may already exist. Link to it, or confirm this is a new patient.']);
    }
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