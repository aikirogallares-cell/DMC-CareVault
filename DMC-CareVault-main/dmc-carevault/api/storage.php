<?php
/*
 * storage.php - reads and saves the lists that now live in MySQL:
 *   users, patients, consultations, prescriptions, medications, bills, appointments (queue), auditLogs
 *
 * GET  storage.php?name=patients            -> { list: [...] } in the shape the JavaScript expects
 * POST storage.php?name=patients            -> body { items: [...changed items], newIds: [...] }
 * POST storage.php?name=auditLogs           -> body { action, details }  (adds one log line)
 */
require __DIR__ . '/config.php';

$user   = require_login();
$name   = $_GET['name'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

$readers = [
    'users' => 'read_users', 'patients' => 'read_patients', 'consultations' => 'read_consultations',
    'prescriptions' => 'read_prescriptions', 'medications' => 'read_medications', 'bills' => 'read_bills',
    'appointments' => 'read_appointments', 'auditLogs' => 'read_audit_logs',
];
// Who may WRITE each list (the server repeats the permission checks of the JavaScript).
$writers = [
    'users' => ['Admin'], 'patients' => ['Admin', 'Staff', 'Doctor'], 'consultations' => ['Doctor'],
    'prescriptions' => ['Doctor'], 'medications' => ['Admin', 'Staff'], 'bills' => ['Admin', 'Staff'],
    'appointments' => ['Admin', 'Staff', 'Doctor'],
];
$noPermission = ['message' => 'You do not have permission to perform this action.'];

if (!isset($readers[$name])) {
    throw new UserError('Unknown list.');
}

if ($method === 'GET') {
    if ($name === 'auditLogs' && $user['role'] !== 'Admin') {
        json_out($noPermission, 403);
    }
    // Money is not shown to doctors.
    if ($name === 'bills' && !in_array($user['role'], ['Admin', 'Staff'], true)) {
        json_out($noPermission, 403);
    }
    json_out(['list' => $readers[$name]($user)]);
}

$in = read_body();

if ($name === 'auditLogs') {
    log_action($user['username'], $user['role'], (string)($in['action'] ?? ''), (string)($in['details'] ?? ''));
    json_out(['ok' => true]);
}

if (!in_array($user['role'], $writers[$name], true)) {
    json_out($noPermission, 403);
}

$items  = is_array($in['items'] ?? null) ? $in['items'] : [];
$newIds = is_array($in['newIds'] ?? null) ? $in['newIds'] : [];
$saver  = 'save_' . $name;
$pdo    = db();

$pdo->beginTransaction();
try {
    foreach ($items as $item) {
        $saver($pdo, $item, in_array($item['id'] ?? '', $newIds, true), $user);
    }
    if ($name === 'users') {
        $admins = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'Admin' AND is_active = 1")->fetchColumn();
        if ($admins < 1) {
            throw new UserError('At least one active Admin account is required.');
        }
    }
    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    if ($e->getCode() === '23000') {
        if (stripos($e->getMessage(), 'foreign key') !== false) {
            throw new UserError('This record links to information that is not in the database yet. Please tell the developer.');
        }
        throw new UserError('That ID or username is already used. Please try again.');
    }
    throw $e;
} catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
}

json_out(['list' => $readers[$name]($user)]);

/* ================= small helpers ================= */

function sv(array $item, string $key): string {
    return trim((string)($item[$key] ?? ''));
}

function nz(string $value): ?string {
    return $value === '' ? null : $value;
}

function need(string $value, string $label): string {
    if ($value === '') {
        throw new UserError($label . ' is required.');
    }
    return $value;
}

function check_date(string $value, string $label, bool $required): ?string {
    if ($value === '') {
        if ($required) {
            throw new UserError($label . ' is required.');
        }
        return null;
    }
    $ok = preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $value, $m) && checkdate((int)$m[2], (int)$m[3], (int)$m[1]);
    if (!$ok) {
        throw new UserError($label . ' is not a valid date.');
    }
    return $value;
}

// Turns a browser date and time (ISO text such as 2026-10-30T01:19:00.000Z) into MySQL's format,
// in the clinic's time zone. Empty text gives null.
function to_datetime(string $value): ?string {
    if ($value === '') {
        return null;
    }
    $time = strtotime($value);
    if ($time === false) {
        throw new UserError('A date and time could not be read.');
    }
    return date('Y-m-d H:i:s', $time);
}

function number_or_null(string $value, string $label, bool $integer): ?string {
    if ($value === '') {
        return null;
    }
    if (!is_numeric($value) || ($integer && !ctype_digit($value))) {
        throw new UserError($label . ' must be a number.');
    }
    return $value;
}

function check_len(array $row, array $limits): void {
    foreach ($limits as $column => $max) {
        if (isset($row[$column]) && is_string($row[$column]) && mb_strlen($row[$column]) > $max) {
            throw new UserError(ucfirst(str_replace('_', ' ', $column)) . ' is too long (' . $max . ' characters at most).');
        }
    }
}

// INSERT for a new row, UPDATE for an existing one. Column names come from this file only.
function upsert(PDO $pdo, string $table, array $row, bool $isNew): void {
    $columns = array_keys($row);
    if ($isNew) {
        $sql = 'INSERT INTO ' . $table . ' (' . implode(', ', $columns) . ') VALUES (:' . implode(', :', $columns) . ')';
    } else {
        $sets = [];
        foreach ($columns as $column) {
            if ($column !== 'id') {
                $sets[] = $column . ' = :' . $column;
            }
        }
        $sql = 'UPDATE ' . $table . ' SET ' . implode(', ', $sets) . ' WHERE id = :id';
    }
    $pdo->prepare($sql)->execute($row);
}

/* ================= users ================= */

function read_users(array $user): array {
    $rows = db()->query('SELECT id, username, full_name, role, is_active FROM users ORDER BY id')->fetchAll();
    $list = [];
    foreach ($rows as $r) {
        // Password data is never sent to the browser.
        $list[] = ['id' => $r['id'], 'username' => $r['username'], 'fullName' => $r['full_name'],
            'role' => $r['role'], 'isActive' => (bool)$r['is_active'], 'salt' => '', 'passwordHash' => ''];
    }
    return $list;
}

function save_users(PDO $pdo, array $u, bool $isNew, array $me): void {
    $username = sv($u, 'username');
    $role = sv($u, 'role');
    $active = !empty($u['isActive']);

    if (!preg_match('/^[a-zA-Z0-9_.]{3,20}$/', $username)) {
        throw new UserError('Username must be 3 to 20 characters (letters, numbers, _ or .).');
    }
    if (!in_array($role, ['Admin', 'Staff', 'Doctor'], true)) {
        throw new UserError('Invalid role selected.');
    }
    if (sv($u, 'id') === $me['id'] && !$active) {
        throw new UserError('You cannot deactivate your own account.');
    }
    $row = ['id' => need(sv($u, 'id'), 'User ID'), 'full_name' => need(sv($u, 'fullName'), 'Full name'),
        'role' => $role, 'is_active' => $active ? 1 : 0];
    check_len($row, ['full_name' => 100]);

    $password = (string)($u['plainPassword'] ?? '');
    if ($isNew) {
        if (strlen($password) < 8) {
            throw new UserError('Password must be at least 8 characters.');
        }
        $row['username'] = $username;
        $row['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
    } elseif ($password !== '') {
        if (strlen($password) < 8) {
            throw new UserError('Password must be at least 8 characters.');
        }
        $row['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
    }
    upsert($pdo, 'users', $row, $isNew);
}

/* ================= patients ================= */

// Age in whole years. Decides the Senior Citizen category (60 and above).
function age_in_years(string $birthDate): int {
    return (new DateTime($birthDate))->diff(new DateTime('today'))->y;
}

// True for a "Yes" value sent by the browser: true, 1, "1" or "Yes".
function is_yes($value): bool {
    return $value === true || $value === 1 || $value === '1' || $value === 'Yes';
}

function read_patients(array $user): array {
    // Staff never receive the sensitive medical fields.
    $showMedical = in_array($user['role'], ['Admin', 'Doctor'], true);
    $rows = db()->query('SELECT * FROM patients ORDER BY id')->fetchAll();
    $list = [];

    foreach ($rows as $r) {
        $isPwd = (int)$r['is_pwd'] === 1;
        $p = [
            'id' => $r['id'], 'firstName' => $r['first_name'], 'middleName' => $r['middle_name'] ?? '',
            'lastName' => $r['last_name'], 'birthDate' => $r['birth_date'], 'gender' => $r['gender'],
            'civilStatus' => $r['civil_status'] ?? '', 'contactNumber' => $r['contact_number'] ?? '',
            'lotNo' => $r['lot_no'] ?? '', 'barangay' => $r['barangay'] ?? '', 'city' => $r['city'] ?? '',
            'address' => $r['address'] ?? '', 'emergencyName' => $r['emergency_name'] ?? '',
            'emergencyRelationship' => $r['emergency_relationship'] ?? '',
            'emergencyContactNumber' => $r['emergency_contact_number'] ?? '',
            'bloodType' => $r['blood_type'] ?? '', 'allergies' => $r['allergies'] ?? '',
            'dateRegistered' => $r['date_registered'], 'lastVisit' => $r['last_visit'] ?? '',
            'isArchived' => (bool)$r['is_archived'],
            // Current names.
            'isPwd' => $isPwd, 'pwdId' => $r['pwd_id'] ?? '', 'seniorId' => $r['senior_id'] ?? '',
            // Older browser files use these names, so they are sent too.
            'pwd' => $isPwd ? 'Yes' : 'No', 'pwdNumber' => $r['pwd_id'] ?? '', 'seniorNumber' => $r['senior_id'] ?? '',
            'seniorCitizen' => age_in_years($r['birth_date']) >= 60 ? 'Yes' : 'No',
        ];
        if ($showMedical) {
            $p['medicalConditions'] = $r['medical_conditions'] ?? '';
            $p['currentMedications'] = $r['current_medications'] ?? '';
        }
        $list[] = $p;
    }
    return $list;
}

function save_patients(PDO $pdo, array $p, bool $isNew, array $user): void {
    $id = need(sv($p, 'id'), 'Patient ID');

    // A doctor may only update the "last visit" date (done when a consultation is saved).
    if ($user['role'] === 'Doctor') {
        if ($isNew) {
            throw new UserError('You do not have permission to perform this action.');
        }
        $pdo->prepare('UPDATE patients SET last_visit = ? WHERE id = ?')
            ->execute([check_date(sv($p, 'lastVisit'), 'Last visit', false), $id]);
        return;
    }

    $gender = sv($p, 'gender');
    if (!in_array($gender, ['Male', 'Female'], true)) {
        throw new UserError('Gender must be Male or Female.');
    }

    // PWD and Senior ID. The browser may send them under either name.
    $pwdSent = array_key_exists('isPwd', $p) || array_key_exists('pwd', $p);
    $seniorSent = array_key_exists('seniorId', $p) || array_key_exists('seniorNumber', $p);
    $archivedSent = array_key_exists('isArchived', $p);

    $pwdValue = array_key_exists('isPwd', $p) ? $p['isPwd'] : ($p['pwd'] ?? false);
    $isPwd = is_yes($pwdValue);
    $pwdIdText = array_key_exists('pwdId', $p) ? sv($p, 'pwdId') : sv($p, 'pwdNumber');
    $seniorIdText = array_key_exists('seniorId', $p) ? sv($p, 'seniorId') : sv($p, 'seniorNumber');

    $row = [
        'id' => $id,
        'first_name' => need(sv($p, 'firstName'), 'First name'),
        'middle_name' => nz(sv($p, 'middleName')),
        'last_name' => need(sv($p, 'lastName'), 'Last name'),
        'birth_date' => check_date(sv($p, 'birthDate'), 'Date of birth', true),
        'gender' => $gender,
        'civil_status' => nz(sv($p, 'civilStatus')),
        'contact_number' => nz(sv($p, 'contactNumber')),
        'lot_no' => nz(sv($p, 'lotNo')),
        'barangay' => nz(sv($p, 'barangay')),
        'city' => nz(sv($p, 'city')),
        'address' => nz(sv($p, 'address')),
        'emergency_name' => nz(sv($p, 'emergencyName')),
        'emergency_relationship' => nz(sv($p, 'emergencyRelationship')),
        'emergency_contact_number' => nz(sv($p, 'emergencyContactNumber')),
        'blood_type' => nz(sv($p, 'bloodType')),
        'allergies' => nz(sv($p, 'allergies')),
        'last_visit' => check_date(sv($p, 'lastVisit'), 'Last visit', false),
        'is_archived' => !empty($p['isArchived']) ? 1 : 0,
        'is_pwd' => $isPwd ? 1 : 0,
        'pwd_id' => ($isPwd && $pwdIdText !== '') ? $pwdIdText : null,
        'senior_id' => nz($seniorIdText),
    ];
    check_len($row, ['id' => 10, 'first_name' => 60, 'middle_name' => 60, 'last_name' => 60, 'civil_status' => 20,
        'contact_number' => 11, 'lot_no' => 20, 'barangay' => 60, 'city' => 60, 'address' => 255,
        'emergency_name' => 100, 'emergency_relationship' => 50, 'emergency_contact_number' => 11,
        'blood_type' => 5, 'pwd_id' => 30, 'senior_id' => 30]);

    if ($isNew) {
        $row['date_registered'] = check_date(sv($p, 'dateRegistered'), 'Date registered', true);
    }
    // Medical fields: Admin can write them. Staff cannot (new patients get "None", old values stay).
    if ($user['role'] === 'Admin') {
        $row['medical_conditions'] = nz(sv($p, 'medicalConditions'));
        $row['current_medications'] = nz(sv($p, 'currentMedications'));
    } elseif ($isNew) {
        $row['medical_conditions'] = 'None';
        $row['current_medications'] = 'None';
    }

    // When a patient is edited, any field the browser did not send keeps its saved value.
    if (!$isNew) {
        if (!$pwdSent) {
            unset($row['is_pwd'], $row['pwd_id']);
        }
        if (!$seniorSent) {
            unset($row['senior_id']);
        }
        if (!$archivedSent) {
            unset($row['is_archived']);
        }
    }
    upsert($pdo, 'patients', $row, $isNew);
}

/* ================= consultations ================= */

function read_consultations(array $user): array {
    $rows = db()->query('SELECT * FROM consultations ORDER BY consult_date DESC, id DESC')->fetchAll();
    $text = function ($v) { return $v === null ? '' : (string)$v; };
    $list = [];

    foreach ($rows as $r) {
        $list[] = [
            'id' => $r['id'], 'patientId' => $r['patient_id'], 'doctorUsername' => $r['doctor_username'],
            'date' => $r['consult_date'], 'status' => $r['status'], 'complaint' => $r['chief_complaint'],
            'symptoms' => $text($r['symptoms']), 'bloodPressure' => $text($r['blood_pressure']),
            'heartRate' => $text($r['heart_rate']), 'temperature' => $text($r['temperature']),
            'respiratoryRate' => $text($r['respiratory_rate']), 'weight' => $text($r['weight']),
            'height' => $text($r['height']), 'diagnosis' => $r['diagnosis'], 'treatment' => $text($r['treatment']),
            'notes' => $text($r['notes']), 'followUpDate' => $text($r['follow_up_date']),
        ];
    }
    return $list;
}

function save_consultations(PDO $pdo, array $c, bool $isNew, array $user): void {
    $id = need(sv($c, 'id'), 'Consultation ID');
    $status = sv($c, 'status');
    if (!in_array($status, ['In Progress', 'Completed'], true)) {
        throw new UserError('Choose a valid consultation status.');
    }

    if (!$isNew) {
        $st = $pdo->prepare('SELECT doctor_username FROM consultations WHERE id = ?');
        $st->execute([$id]);
        $owner = $st->fetchColumn();
        if ($owner === false) {
            throw new UserError('Consultation not found.');
        }
        if ($owner !== $user['username']) {
            throw new UserError('You can only edit your own consultations.');
        }
    }

    $row = [
        'id' => $id,
        'patient_id' => need(sv($c, 'patientId'), 'Patient'),
        'consult_date' => check_date(sv($c, 'date'), 'Date', true),
        'status' => $status,
        'chief_complaint' => need(sv($c, 'complaint'), 'Chief complaint'),
        'symptoms' => nz(sv($c, 'symptoms')),
        'blood_pressure' => nz(sv($c, 'bloodPressure')),
        'heart_rate' => number_or_null(sv($c, 'heartRate'), 'Heart rate', true),
        'temperature' => number_or_null(sv($c, 'temperature'), 'Temperature', false),
        'respiratory_rate' => number_or_null(sv($c, 'respiratoryRate'), 'Respiratory rate', true),
        'weight' => number_or_null(sv($c, 'weight'), 'Weight', false),
        'height' => number_or_null(sv($c, 'height'), 'Height', false),
        'diagnosis' => need(sv($c, 'diagnosis'), 'Diagnosis'),
        'treatment' => nz(sv($c, 'treatment')),
        'notes' => nz(sv($c, 'notes')),
        'follow_up_date' => check_date(sv($c, 'followUpDate'), 'Follow-up date', false),
    ];
    check_len($row, ['id' => 10, 'blood_pressure' => 10, 'chief_complaint' => 255, 'diagnosis' => 255]);
    if ($isNew) {
        $row['doctor_username'] = $user['username'];
    }
    upsert($pdo, 'consultations', $row, $isNew);
}

/* ================= prescriptions ================= */

function read_prescriptions(array $user): array {
    $pdo = db();
    $rows = $pdo->query('SELECT * FROM prescriptions ORDER BY prescribed_date DESC, id DESC')->fetchAll();
    $itemRows = $pdo->query('SELECT * FROM prescription_items ORDER BY id')->fetchAll();
    $text = function ($v) { return $v === null ? '' : (string)$v; };

    $byPrescription = [];
    foreach ($itemRows as $i) {
        $byPrescription[$i['prescription_id']][] = [
            'name' => $i['medicine_name'], 'dosage' => $text($i['dosage']), 'frequency' => $text($i['frequency']),
            'duration' => $text($i['duration']), 'quantity' => (int)$i['quantity'], 'instructions' => $text($i['instructions']),
        ];
    }

    $list = [];
    foreach ($rows as $r) {
        $list[] = ['id' => $r['id'], 'patientId' => $r['patient_id'], 'doctorUsername' => $r['doctor_username'],
            'date' => $r['prescribed_date'], 'medicines' => $byPrescription[$r['id']] ?? []];
    }
    return $list;
}

function save_prescriptions(PDO $pdo, array $rx, bool $isNew, array $user): void {
    $id = need(sv($rx, 'id'), 'Prescription ID');
    $medicines = is_array($rx['medicines'] ?? null) ? $rx['medicines'] : [];
    if (count($medicines) === 0) {
        throw new UserError('Add at least one medicine.');
    }

    $row = ['id' => $id, 'patient_id' => need(sv($rx, 'patientId'), 'Patient'),
        'prescribed_date' => check_date(sv($rx, 'date'), 'Date', true)];
    if ($isNew) {
        $row['doctor_username'] = $user['username'];
    }
    upsert($pdo, 'prescriptions', $row, $isNew);

    $pdo->prepare('DELETE FROM prescription_items WHERE prescription_id = ?')->execute([$id]);
    $insert = $pdo->prepare('INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, quantity, instructions) VALUES (?, ?, ?, ?, ?, ?, ?)');

    foreach ($medicines as $m) {
        $item = ['medicine_name' => need(sv($m, 'name'), 'Medicine name'), 'dosage' => sv($m, 'dosage'),
            'frequency' => sv($m, 'frequency'), 'duration' => sv($m, 'duration'), 'instructions' => sv($m, 'instructions')];
        check_len($item, ['medicine_name' => 150, 'dosage' => 50, 'frequency' => 50, 'duration' => 50, 'instructions' => 255]);
        $insert->execute([$id, $item['medicine_name'], nz($item['dosage']), nz($item['frequency']), nz($item['duration']),
            (int)($m['quantity'] ?? 0), nz($item['instructions'])]);
    }
}

/* ================= medications ================= */

function read_medications(array $user): array {
    $rows = db()->query('SELECT * FROM medications ORDER BY id')->fetchAll();
    $text = function ($v) { return $v === null ? '' : (string)$v; };
    $list = [];

    foreach ($rows as $r) {
        $list[] = [
            'id' => $r['id'], 'genericName' => $r['generic_name'], 'brandName' => $text($r['brand_name']),
            'strength' => $text($r['strength']), 'form' => $text($r['form']), 'category' => $text($r['category']),
            'route' => $text($r['route']), 'stock' => (int)$r['stock'], 'unit' => $text($r['unit']),
            'reorderLevel' => (int)$r['reorder_level'], 'unitPrice' => (int)$r['unit_price'],
            'batchNumber' => $text($r['batch_number']), 'expiryDate' => $text($r['expiry_date']),
            'supplier' => $text($r['supplier']), 'indications' => $text($r['indications']),
            'warnings' => $text($r['warnings']), 'storageInstructions' => $text($r['storage_instructions']),
            'isArchived' => (bool)$r['is_archived'],
        ];
    }
    return $list;
}

function save_medications(PDO $pdo, array $m, bool $isNew, array $user): void {
    $row = [
        'id' => need(sv($m, 'id'), 'Medicine ID'),
        'generic_name' => need(sv($m, 'genericName'), 'Generic name'),
        'brand_name' => nz(sv($m, 'brandName')),
        'strength' => nz(sv($m, 'strength')),
        'form' => nz(sv($m, 'form')),
        'category' => nz(sv($m, 'category')),
        'route' => nz(sv($m, 'route')),
        'stock' => max(0, (int)($m['stock'] ?? 0)),
        'unit' => nz(sv($m, 'unit')),
        'reorder_level' => max(0, (int)($m['reorderLevel'] ?? 0)),
        'unit_price' => max(0, (int)($m['unitPrice'] ?? 0)),
        'batch_number' => nz(sv($m, 'batchNumber')),
        'expiry_date' => check_date(sv($m, 'expiryDate'), 'Expiry date', false),
        'supplier' => nz(sv($m, 'supplier')),
        'indications' => nz(sv($m, 'indications')),
        'warnings' => nz(sv($m, 'warnings')),
        'storage_instructions' => nz(sv($m, 'storageInstructions')),
        'is_archived' => !empty($m['isArchived']) ? 1 : 0,
    ];
    check_len($row, ['id' => 10, 'generic_name' => 100, 'brand_name' => 100, 'strength' => 50, 'form' => 30,
        'category' => 60, 'route' => 30, 'unit' => 20, 'batch_number' => 50, 'supplier' => 100, 'storage_instructions' => 255]);
    upsert($pdo, 'medications', $row, $isNew);
}

/* ================= queue (appointments) and vital signs ================= */

function read_appointments(array $user): array {
    $pdo = db();

    // Doctors only receive the queue entries of their own patients.
    if ($user['role'] === 'Doctor') {
        $st = $pdo->prepare('SELECT * FROM queue_entries WHERE doctor_username = ? ORDER BY visit_date DESC, queue_number ASC, id ASC');
        $st->execute([$user['username']]);
        $rows = $st->fetchAll();
    } else {
        $rows = $pdo->query('SELECT * FROM queue_entries ORDER BY visit_date DESC, queue_number ASC, id ASC')->fetchAll();
    }

    // Vital signs for these queue entries only.
    $entryIds = array_flip(array_column($rows, 'id'));
    $vitalsById = [];
    foreach ($pdo->query('SELECT * FROM vitals')->fetchAll() as $v) {
        if (!isset($entryIds[$v['queue_entry_id']])) {
            continue;
        }
        $vitalsById[$v['queue_entry_id']] = [
            'bloodPressure' => $v['blood_pressure'], 'heartRate' => (int)$v['heart_rate'],
            'temperature' => (float)$v['temperature'], 'respiratoryRate' => (int)$v['respiratory_rate'],
            'weight' => (float)$v['weight'], 'height' => $v['height'] === null ? '' : (float)$v['height'],
            'recordedBy' => $v['recorded_by'], 'recordedAt' => date('c', strtotime($v['recorded_at'])),
        ];
    }

    // Turns a saved date and time into the text the browser code expects, or null when empty.
    $iso = function ($value) { return $value ? date('c', strtotime($value)) : null; };

    $list = [];
    foreach ($rows as $r) {
        $list[] = [
            'id' => $r['id'], 'patientId' => $r['patient_id'], 'doctorUsername' => $r['doctor_username'],
            'date' => $r['visit_date'], 'reason' => $r['reason'], 'priority' => $r['priority'],
            'status' => $r['status'], 'queueNumber' => $r['queue_number'] === null ? null : (int)$r['queue_number'],
            'queuedAt' => $iso($r['queued_at']), 'startedAt' => $iso($r['started_at']),
            'completedAt' => $iso($r['completed_at']), 'doctorFinishedAt' => $iso($r['doctor_finished_at']),
            'doctorFinishedBy' => $r['doctor_finished_by'] ?? '', 'missingAt' => $iso($r['missing_at']),
            'returnedAt' => $iso($r['returned_at']), 'vitals' => $vitalsById[$r['id']] ?? null,
        ];
    }
    return $list;
}

function save_appointments(PDO $pdo, array $a, bool $isNew, array $user): void {
    $id = need(sv($a, 'id'), 'Queue ID');

    $statuses = ['Scheduled', 'Confirmed', 'Waiting', 'Missing', 'In Consultation', 'Completed', 'Cancelled'];
    $status = sv($a, 'status');
    if (!in_array($status, $statuses, true)) {
        throw new UserError('Choose a valid queue status.');
    }
    $doctor = need(sv($a, 'doctorUsername'), 'Doctor');

    // Doctors may not add queue entries, and may only change the visits of their own patients.
    if ($user['role'] === 'Doctor') {
        if ($isNew) {
            throw new UserError('You do not have permission to perform this action.');
        }
        if ($doctor !== $user['username']) {
            throw new UserError('You can only change your own patients.');
        }
    }
    if (!$isNew) {
        $st = $pdo->prepare('SELECT doctor_username FROM queue_entries WHERE id = ?');
        $st->execute([$id]);
        $owner = $st->fetchColumn();
        if ($owner === false) {
            throw new UserError('Queue entry not found.');
        }
        if ($user['role'] === 'Doctor' && $owner !== $user['username']) {
            throw new UserError('You can only change your own patients.');
        }
    }

    $priority = sv($a, 'priority');
    if (!in_array($priority, ['Regular', 'Senior Citizen', 'PWD', 'Emergency'], true)) {
        $priority = 'Regular';
    }

    $queueNumber = $a['queueNumber'] ?? null;
    $row = [
        'id' => $id,
        'patient_id' => need(sv($a, 'patientId'), 'Patient'),
        'doctor_username' => $doctor,
        'visit_date' => check_date(sv($a, 'date'), 'Date', true),
        'reason' => need(sv($a, 'reason'), 'Reason'),
        'priority' => $priority,
        'status' => $status,
        'queue_number' => ($queueNumber === null || $queueNumber === '') ? null : (int)$queueNumber,
        'queued_at' => to_datetime(sv($a, 'queuedAt')),
        'started_at' => to_datetime(sv($a, 'startedAt')),
        'completed_at' => to_datetime(sv($a, 'completedAt')),
        'doctor_finished_at' => to_datetime(sv($a, 'doctorFinishedAt')),
        'doctor_finished_by' => nz(sv($a, 'doctorFinishedBy')),
        'missing_at' => to_datetime(sv($a, 'missingAt')),
        'returned_at' => to_datetime(sv($a, 'returnedAt')),
    ];
    check_len($row, ['id' => 10, 'patient_id' => 10, 'doctor_username' => 20, 'reason' => 100, 'doctor_finished_by' => 20]);
    upsert($pdo, 'queue_entries', $row, $isNew);

    // Doctors change the status and times of their own patients, but not the vital signs.
    if ($user['role'] === 'Doctor') {
        return;
    }

    // Vital signs are saved after the queue entry, because the vitals table points to it.
    // They are only written when they are sent, so an older browser copy cannot erase them.
    $vitals = $a['vitals'] ?? null;
    if (is_array($vitals)) {
        $heightText = sv($vitals, 'height');
        $pdo->prepare('REPLACE INTO vitals (queue_entry_id, blood_pressure, heart_rate, temperature, respiratory_rate, weight, height, recorded_by, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
            ->execute([
                $id,
                need(sv($vitals, 'bloodPressure'), 'Blood pressure'),
                (int)($vitals['heartRate'] ?? 0),
                (float)($vitals['temperature'] ?? 0),
                (int)($vitals['respiratoryRate'] ?? 0),
                (float)($vitals['weight'] ?? 0),
                $heightText === '' ? null : (float)$heightText,
                need(sv($vitals, 'recordedBy'), 'Recorded by'),
                to_datetime(sv($vitals, 'recordedAt')) ?? date('Y-m-d H:i:s'),
            ]);
    }
}

/* ================= bills ================= */

// A bill with its items. The browser keeps one object per bill, with the items inside it.
function read_bills(array $user): array {
    $pdo = db();
    $rows = $pdo->query('SELECT * FROM bills ORDER BY id')->fetchAll();
    $itemRows = $pdo->query('SELECT * FROM bill_items ORDER BY id')->fetchAll();
    $text = function ($v) { return $v === null ? '' : (string)$v; };

    $itemsByBill = [];
    foreach ($itemRows as $i) {
        $itemsByBill[$i['bill_id']][] = [
            'id' => $i['id'], 'type' => $i['item_type'], 'name' => $i['name'],
            'prescriptionId' => $i['prescription_id'], 'medicationId' => $i['medication_id'],
            'quantity' => (int)$i['quantity'], 'unitPrice' => (int)$i['unit_price'], 'amount' => (int)$i['amount'],
            'decision' => $i['decision'], 'sellable' => (int)$i['sellable'] === 1, 'note' => $text($i['note']),
        ];
    }

    $list = [];
    foreach ($rows as $r) {
        $items = $itemsByBill[$r['id']] ?? [];

        // Services first, then medicines (in the order they were added).
        usort($items, function ($first, $second) {
            return ($first['type'] === 'service' ? 0 : 1) <=> ($second['type'] === 'service' ? 0 : 1);
        });

        // The prescriptions already on this bill, so they are not added twice.
        $prescriptionIds = [];
        foreach ($items as $item) {
            if ($item['prescriptionId'] !== null && !in_array($item['prescriptionId'], $prescriptionIds, true)) {
                $prescriptionIds[] = $item['prescriptionId'];
            }
        }

        $list[] = [
            'id' => $r['id'], 'queueEntryId' => $r['queue_entry_id'], 'patientId' => $r['patient_id'],
            'doctorUsername' => $r['doctor_username'], 'visitDate' => $r['visit_date'],
            'createdAt' => $r['created_at'] ? date('c', strtotime($r['created_at'])) : '',
            'prescriptionIds' => $prescriptionIds, 'items' => $items, 'status' => $r['status'],
            'subtotal' => (int)$r['subtotal'], 'discountType' => $r['discount_type'],
            'discountIdNumber' => $text($r['discount_id_number']), 'discountAmount' => (int)$r['discount_amount'],
            'total' => (int)$r['total'], 'paymentMethod' => $text($r['payment_method']),
            'cashReceived' => $r['cash_received'] === null ? null : (int)$r['cash_received'],
            'change' => $r['change_amount'] === null ? null : (int)$r['change_amount'],
            'paidDate' => $text($r['paid_date']),
            'paidAt' => $r['paid_at'] ? date('c', strtotime($r['paid_at'])) : '',
            'paidBy' => $text($r['paid_by']),
        ];
    }
    return $list;
}

function save_bills(PDO $pdo, array $b, bool $isNew, array $user): void {
    $id = need(sv($b, 'id'), 'Bill ID');

    $status = sv($b, 'status');
    if (!in_array($status, ['Open', 'Paid'], true)) {
        throw new UserError('Choose a valid bill status.');
    }
    $discountType = sv($b, 'discountType');
    if ($discountType === '') {
        $discountType = 'None';
    }
    if (!in_array($discountType, ['None', 'Senior Citizen', 'PWD'], true)) {
        throw new UserError('Choose a valid discount.');
    }

    // Every item is checked before anything is written.
    $items = is_array($b['items'] ?? null) ? $b['items'] : [];
    if (count($items) === 0) {
        throw new UserError('A bill must have at least one item.');
    }
    $itemValues = [];
    foreach ($items as $item) {
        $type = sv($item, 'type');
        if (!in_array($type, ['service', 'medicine'], true)) {
            throw new UserError('A bill item has an unknown type.');
        }
        $decision = sv($item, 'decision');
        if (!in_array($decision, ['Included', 'Buy here', 'Not buying'], true)) {
            throw new UserError('A bill item has an unknown decision.');
        }
        $itemName = need(sv($item, 'name'), 'Item name');
        if (mb_strlen($itemName) > 150) {
            throw new UserError('Item name is too long (150 characters at most).');
        }
        $itemValues[] = [
            need(sv($item, 'id'), 'Item ID'), $id, $type, $itemName,
            nz(sv($item, 'prescriptionId')), nz(sv($item, 'medicationId')),
            (int)($item['quantity'] ?? 1), (int)($item['unitPrice'] ?? 0), (int)($item['amount'] ?? 0),
            $decision, !empty($item['sellable']) ? 1 : 0, nz(mb_substr(sv($item, 'note'), 0, 255)),
        ];
    }

    $row = [
        'id' => $id,
        'queue_entry_id' => need(sv($b, 'queueEntryId'), 'Visit'),
        'patient_id' => need(sv($b, 'patientId'), 'Patient'),
        'doctor_username' => need(sv($b, 'doctorUsername'), 'Doctor'),
        'visit_date' => check_date(sv($b, 'visitDate'), 'Visit date', true),
        'created_at' => to_datetime(sv($b, 'createdAt')) ?? date('Y-m-d H:i:s'),
        'status' => $status,
        'total' => (int)($b['total'] ?? 0),
        'payment_method' => nz(sv($b, 'paymentMethod')),
        'cash_received' => isset($b['cashReceived']) ? (int)$b['cashReceived'] : null,
        'change_amount' => isset($b['change']) ? (int)$b['change'] : null,
        'paid_date' => check_date(sv($b, 'paidDate'), 'Paid date', false),
        'paid_at' => to_datetime(sv($b, 'paidAt')),
        'paid_by' => nz(sv($b, 'paidBy')),
        'subtotal' => (int)($b['subtotal'] ?? 0),
        'discount_type' => $discountType,
        'discount_id_number' => nz(sv($b, 'discountIdNumber')),
        'discount_amount' => (int)($b['discountAmount'] ?? 0),
    ];
    check_len($row, ['id' => 10, 'queue_entry_id' => 10, 'patient_id' => 10, 'doctor_username' => 20,
        'payment_method' => 10, 'paid_by' => 20, 'discount_id_number' => 30]);

    upsert($pdo, 'bills', $row, $isNew);

    // The items are replaced as a whole, so the bill in the database always matches the browser.
    $pdo->prepare('DELETE FROM bill_items WHERE bill_id = ?')->execute([$id]);
    $insert = $pdo->prepare('INSERT INTO bill_items (id, bill_id, item_type, name, prescription_id, medication_id, quantity, unit_price, amount, decision, sellable, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    foreach ($itemValues as $values) {
        $insert->execute($values);
    }
}

/* ================= audit logs ================= */

function read_audit_logs(array $user): array {
    $rows = db()->query('SELECT * FROM audit_logs ORDER BY created_at DESC, id DESC LIMIT 500')->fetchAll();
    $list = [];
    foreach ($rows as $r) {
        $list[] = ['time' => date('c', strtotime($r['created_at'])), 'username' => $r['username'],
            'role' => $r['role'] ?? '', 'action' => $r['action_name'], 'details' => $r['details'] ?? ''];
    }
    return $list;
}