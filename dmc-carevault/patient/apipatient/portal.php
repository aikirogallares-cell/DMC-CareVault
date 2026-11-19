<?php
/*
 * patient/apipatient/portal.php - the signed-in patient's own pages:
 * visit booking (free times), their visits, prescriptions, medicines and records.
 * Every action only reads or changes the records of the patient who is signed in.
 */
require __DIR__ . '/../../api/config.php';

const SLOT_MINUTES = 30;
const MAX_BOOKINGS_PER_DAY = 1;
// 0 = Sunday ... 6 = Saturday. null = closed. Keep in step with the hours on the sign-in page.
const CLINIC_WEEK = [
    0 => null,
    1 => ['08:00', '16:00'],
    2 => ['08:00', '16:00'],
    3 => ['08:00', '16:00'],
    4 => ['08:00', '16:00'],
    5 => ['08:00', '16:00'],
    6 => ['08:00', '12:00'],
];
const VISIT_REASONS = ['Check-up', 'X-ray', 'Urine Test', 'Blood Test', 'Getting Blood', 'Getting Urine'];

if (session_status() === PHP_SESSION_NONE) {
    session_name('patient_session');
    session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'path' => '/']);
    session_start();
}

$action = $_GET['action'] ?? '';
$in = read_body();

// Signing out does not need a signed-in account.
if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    json_out(['ok' => true]);
}

$account = current_account();

if ($action === 'me') {
    json_out([
        'success'  => true,
        'fullName' => $account['full_name'],
        'username' => $account['username'],
        'linked'   => !empty($account['patient_id']),
    ]);
}

if ($action === 'slots') {
    $date = (string)($_GET['date'] ?? '');
    if (!valid_date($date)) {
        throw new UserError('Choose a valid date.');
    }
    json_out(['success' => true, 'slots' => slots_for($date)]);
}

if ($action === 'book') {
    book_visit($account, $in);
    json_out(['success' => true, 'message' => 'Your visit is booked. The clinic will assign your doctor on the day. Please arrive on time and bring a valid ID.']);
}

if ($action === 'bookings') {
    json_out(['success' => true, 'bookings' => list_bookings($account)]);
}

if ($action === 'cancel') {
    cancel_booking($account, (int)($in['id'] ?? 0));
    json_out(['success' => true]);
}

if ($action === 'prescriptions') {
    json_out(['success' => true, 'records' => load_records($account['patient_id'])]);
}

if ($action === 'medications') {
    json_out(['success' => true, 'medicines' => medicine_list(load_records($account['patient_id']))]);
}

if ($action === 'records') {
    json_out(['success' => true] + load_clinical_records($account['patient_id']));
}

if ($action === 'change_password') {
    change_password($account, $in);
    json_out(['success' => true, 'message' => 'Your password was changed. Use the new password the next time you sign in.']);
}

throw new UserError('Unknown action.');

/* ================= signed-in patient ================= */

function current_account(): array {
    $id = $_SESSION['patient_account_id'] ?? null;
    if ($id === null) {
        json_out(['success' => false, 'message' => 'Please sign in again.'], 401);
    }
    $st = db()->prepare("SELECT id, username, full_name, patient_id FROM patient_accounts WHERE id = ? AND is_active = 1 AND status = 'Approved'");
    $st->execute([(int)$id]);
    $row = $st->fetch();
    if (!$row) {
        json_out(['success' => false, 'message' => 'Please sign in again.'], 401);
    }
    return $row;
}

function valid_date(string $text): bool {
    return (bool)(preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $text, $m)
        && checkdate((int)$m[2], (int)$m[3], (int)$m[1]));
}

/* ================= visit booking ================= */

// The free times on one date: [ { time: "08:00", label: "8:00 am", available: true }, ... ]
function slots_for(string $date): array {
    $weekday = (int)date('w', strtotime($date));
    $hours = CLINIC_WEEK[$weekday] ?? null;
    if ($hours === null) {
        return [];
    }

    $st = db()->prepare("SELECT slot_time FROM patient_bookings WHERE booking_date = ? AND status = 'Booked'");
    $st->execute([$date]);
    $taken = array_column($st->fetchAll(), 'slot_time');

    $now = time();
    $slots = [];
    $start = strtotime($date . ' ' . $hours[0]);
    $end = strtotime($date . ' ' . $hours[1]);
    for ($t = $start; $t + SLOT_MINUTES * 60 <= $end; $t += SLOT_MINUTES * 60) {
        $slots[] = [
            'time'      => date('H:i', $t),
            'label'     => date('g:i a', $t),
            'available' => !in_array(date('H:i:s', $t), $taken, true) && $t > $now,
        ];
    }
    return $slots;
}

// A queue ID such as A-483920 that is not used yet (queue_entries.id is 10 characters at most).
function new_queue_id(PDO $pdo): string {
    do {
        $id = 'A-' . random_int(100000, 999999);
        $st = $pdo->prepare('SELECT COUNT(*) FROM queue_entries WHERE id = ?');
        $st->execute([$id]);
    } while ((int)$st->fetchColumn() > 0);
    return $id;
}

// Books the visit and creates the Scheduled queue entry. No doctor is chosen here.
function book_visit(array $account, array $in): void {
    $date   = (string)($in['date'] ?? '');
    $time   = (string)($in['time'] ?? '');
    $reason = (string)($in['reason'] ?? '');

    if (!valid_date($date)) {
        throw new UserError('Choose a valid date.');
    }
    if ($date < date('Y-m-d')) {
        throw new UserError('You cannot book a date in the past.');
    }
    if ((int)date('w', strtotime($date)) === 0) {
        throw new UserError('The clinic is closed on Sundays. Please choose another day.');
    }
    if (!in_array($reason, VISIT_REASONS, true)) {
        throw new UserError('Choose the reason for your visit.');
    }
    if (empty($account['patient_id'])) {
        throw new UserError('Your account is not linked to a patient record yet. Please visit the clinic front desk.');
    }

    $isFree = false;
    foreach (slots_for($date) as $slot) {
        if ($slot['time'] === $time && $slot['available']) {
            $isFree = true;
        }
    }
    if (!$isFree) {
        throw new UserError('That time is not available. Please choose another time.');
    }

    $pdo = db();
    $st = $pdo->prepare("SELECT COUNT(*) FROM patient_bookings WHERE patient_account_id = ? AND booking_date = ? AND status = 'Booked'");
    $st->execute([$account['id'], $date]);
    if ((int)$st->fetchColumn() >= MAX_BOOKINGS_PER_DAY) {
        throw new UserError('You already have a visit booked on that day.');
    }

    $slotTime = $time . ':00';
    $pdo->beginTransaction();
    try {
        // Locks the slot so two patients cannot take the same time at the same moment.
        $lock = $pdo->prepare("SELECT id FROM patient_bookings WHERE booking_date = ? AND slot_time = ? AND status = 'Booked' FOR UPDATE");
        $lock->execute([$date, $slotTime]);
        if ($lock->fetch()) {
            throw new UserError('That time was just taken. Please choose another time.');
        }

        $queueId = new_queue_id($pdo);
        $pdo->prepare("INSERT INTO queue_entries
                (id, patient_id, doctor_username, visit_date, reason, priority, status,
                 queue_number, queued_at, started_at, completed_at, slot_start)
            VALUES (?, ?, NULL, ?, ?, 'Scheduled', 'Scheduled', NULL, NULL, NULL, NULL, ?)")
            ->execute([$queueId, $account['patient_id'], $date, $reason, $slotTime]);

        $pdo->prepare("INSERT INTO patient_bookings
                (patient_account_id, patient_id, doctor_username, queue_entry_id, booking_date, slot_time, reason, status)
            VALUES (?, ?, NULL, ?, ?, ?, ?, 'Booked')")
            ->execute([$account['id'], $account['patient_id'], $queueId, $date, $slotTime, $reason]);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }

    log_action($account['username'], 'Patient', 'Visit booked', $date . ' ' . $time . ' (' . $reason . ')');
}

function list_bookings(array $account): array {
    $st = db()->prepare("SELECT id, booking_date, slot_time, reason, status FROM patient_bookings WHERE patient_account_id = ? ORDER BY booking_date DESC, slot_time DESC LIMIT 50");
    $st->execute([$account['id']]);
    $list = [];
    foreach ($st->fetchAll() as $row) {
        $list[] = [
            'id'           => (int)$row['id'],
            'booking_date' => $row['booking_date'],
            'label'        => date('g:i a', strtotime($row['slot_time'])),
            'reason'       => $row['reason'],
            'status'       => $row['status'],
        ];
    }
    return $list;
}

function cancel_booking(array $account, int $id): void {
    $pdo = db();
    $st = $pdo->prepare("SELECT id, queue_entry_id FROM patient_bookings WHERE id = ? AND patient_account_id = ? AND status = 'Booked' AND booking_date >= CURDATE()");
    $st->execute([$id, $account['id']]);
    $booking = $st->fetch();
    if (!$booking) {
        throw new UserError('This visit cannot be cancelled.');
    }

    $pdo->beginTransaction();
    try {
        if (!empty($booking['queue_entry_id'])) {
            // Only a visit that has not been checked in yet can be cancelled here.
            $queue = $pdo->prepare("UPDATE queue_entries SET status = 'Cancelled' WHERE id = ? AND status = 'Scheduled'");
            $queue->execute([$booking['queue_entry_id']]);
            if ($queue->rowCount() === 0) {
                throw new UserError('You have already checked in at the clinic, so this visit cannot be cancelled here. Please tell the front desk.');
            }
        }
        $pdo->prepare("UPDATE patient_bookings SET status = 'Cancelled' WHERE id = ?")->execute([$id]);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    log_action($account['username'], 'Patient', 'Visit cancelled', 'Booking #' . $id);
}

/* ================= clinical records (visits, check-ups, test results) ================= */

// The clinical records the patient may see: every completed visit (with its test results),
// the doctor's check-up notes, and the test results. Prescriptions have their own tab.
function load_clinical_records(?string $patientId): array {
    if ($patientId === null || $patientId === '') {
        return ['linked' => false, 'visits' => [], 'checkups' => [], 'tests' => []];
    }
    $pdo = db();

    // Every completed visit, newest first.
    $st = $pdo->prepare("SELECT id, visit_date, reason, queue_number
        FROM queue_entries
        WHERE patient_id = ? AND status = 'Completed'
        ORDER BY visit_date DESC, queue_number ASC");
    $st->execute([$patientId]);
    $visits = $st->fetchAll();

    // Test results, grouped under the visit they belong to.
    $st = $pdo->prepare('SELECT queue_entry_id, test_name, result_text, recorded_at
        FROM test_results WHERE patient_id = ? ORDER BY recorded_at DESC');
    $st->execute([$patientId]);
    $testsByVisit = [];
    foreach ($st->fetchAll() as $t) {
        $testsByVisit[$t['queue_entry_id']][] = $t;
    }
    foreach ($visits as &$v) {
        $v['tests'] = $testsByVisit[$v['id']] ?? [];
    }
    unset($v);

    // Doctor's check-up notes.
    $st = $pdo->prepare("SELECT c.consult_date, c.chief_complaint, c.blood_pressure, c.heart_rate,
            c.temperature, c.respiratory_rate, c.weight, c.height, c.diagnosis, c.treatment,
            u.full_name AS doctor_name
        FROM consultations c
        LEFT JOIN users u ON u.username = c.doctor_username
        WHERE c.patient_id = ? AND c.status = 'Completed'
        ORDER BY c.consult_date DESC, c.id DESC");
    $st->execute([$patientId]);
    $checkups = $st->fetchAll();

    // Test results that are not tied to a visit.
    $tests = $testsByVisit[''] ?? [];

    return ['linked' => true, 'visits' => $visits, 'checkups' => $checkups, 'tests' => $tests];
}

/* ================= prescriptions and medicines ================= */

function medicine_rows(array $rows): array {
    return array_map(function ($r) {
        return [
            'name'         => (string)$r['medicine_name'],
            'dosage'       => (string)($r['dosage'] ?? ''),
            'frequency'    => (string)($r['frequency'] ?? ''),
            'duration'     => (string)($r['duration'] ?? ''),
            'quantity'     => (string)($r['quantity'] ?? ''),
            'instructions' => (string)($r['instructions'] ?? ''),
        ];
    }, $rows);
}

// Every prescription on record for the patient: clinic prescriptions and restored paper ones.
function load_records(?string $patientId): array {
    if ($patientId === null || $patientId === '') {
        return [];
    }
    $pdo = db();
    $records = [];

    $visits = $pdo->prepare('SELECT p.id, p.prescribed_date, u.full_name AS doctor_name FROM prescriptions p LEFT JOIN users u ON u.username = p.doctor_username WHERE p.patient_id = ?');
    $visits->execute([$patientId]);
    $itemsOf = $pdo->prepare('SELECT medicine_name, dosage, frequency, duration, quantity, instructions FROM prescription_items WHERE prescription_id = ? ORDER BY id');
    foreach ($visits->fetchAll() as $row) {
        $itemsOf->execute([$row['id']]);
        $records[] = [
            'date'      => $row['prescribed_date'],
            'doctor'    => $row['doctor_name'] ?: 'Doctor',
            'source'    => 'Clinic prescription',
            'medicines' => medicine_rows($itemsOf->fetchAll()),
        ];
    }

    $papers = $pdo->prepare('SELECT id, prescribed_date, doctor_name FROM archived_prescriptions WHERE patient_id = ?');
    $papers->execute([$patientId]);
    $paperItems = $pdo->prepare('SELECT medicine_name, dosage, frequency, duration, quantity, instructions FROM archived_prescription_items WHERE archived_id = ? ORDER BY id');
    foreach ($papers->fetchAll() as $row) {
        $paperItems->execute([$row['id']]);
        $records[] = [
            'date'      => $row['prescribed_date'],
            'doctor'    => $row['doctor_name'],
            'source'    => 'Paper record (restored by clinic)',
            'medicines' => medicine_rows($paperItems->fetchAll()),
        ];
    }

    usort($records, function ($a, $b) {
        return strcmp($b['date'], $a['date']);
    });
    return $records;
}

// Reads the course length from the duration text: "15", "15 days", "2 weeks" or "1 month".
// A bare number counts as days. Returns null when no number can be read.
function course_days(string $duration): ?int {
    if (!preg_match('/(\d+)\s*(day|days|week|weeks|month|months)?/i', trim($duration), $m)) {
        return null;
    }
    $number = (int)$m[1];
    $unit = strtolower($m[2] ?? 'day');
    if (str_starts_with($unit, 'week')) {
        return $number * 7;
    }
    if (str_starts_with($unit, 'month')) {
        return $number * 30;
    }
    return $number;
}

// Taking now, Finished, Starts later, or unknown. Day 1 is the prescription date.
function medicine_course_status(string $prescribedDate, string $duration): array {
    $days = course_days($duration);
    if ($days === null || $days < 1) {
        return ['status' => 'unknown', 'label' => 'Ask the clinic (course length not set)'];
    }

    $start = new DateTime($prescribedDate);
    $end   = (clone $start)->modify('+' . ($days - 1) . ' days');
    $today = new DateTime('today');
    $dayNumber = (int)$start->diff($today)->format('%r%a') + 1;

    if ($dayNumber < 1) {
        return ['status' => 'future', 'label' => 'Starts ' . $start->format('Y-m-d')];
    }
    if ($today > $end) {
        return ['status' => 'finished', 'label' => 'Finished on ' . $end->format('Y-m-d')];
    }
    return [
        'status' => 'taking',
        'label'  => 'Taking now · Day ' . $dayNumber . ' of ' . $days . ' · until ' . $end->format('Y-m-d'),
    ];
}

    /* ================= change password ================= */

    // The signed-in patient changes their own password. The current password must be right first.
    function change_password(array $account, array $in): void {
        $current = (string)($in['currentPassword'] ?? '');
        $new     = (string)($in['newPassword'] ?? '');
        $confirm = (string)($in['confirmPassword'] ?? '');

        $st = db()->prepare('SELECT password_hash FROM patient_accounts WHERE id = ?');
        $st->execute([$account['id']]);
        $hash = $st->fetchColumn();

        if ($hash === false || !password_verify($current, $hash)) {
            log_action($account['username'], 'Patient', 'Login failed', 'Wrong current password (change password)');
            throw new UserError('Your current password is wrong.');
        }
        if (strlen($new) < 8 || strlen($new) > 72) {
            throw new UserError('The new password must be 8 to 72 characters.');
        }
        if ($new !== $confirm) {
            throw new UserError('The two new passwords do not match. Type the same password in both boxes.');
        }
        if (password_verify($new, $hash)) {
            throw new UserError('Choose a password that is different from your current one.');
        }

        db()->prepare('UPDATE patient_accounts SET password_hash = ? WHERE id = ?')
            ->execute([password_hash($new, PASSWORD_DEFAULT), $account['id']]);

        // A new session ID after a sensitive change makes it harder for an old session to be reused.
        session_regenerate_id(true);
        log_action($account['username'], 'Patient', 'Password changed', 'Patient changed their own password');
    }

// Every medicine with its course status, shown on the Medicines tab.
function medicine_list(array $records): array {
    $list = [];
    foreach ($records as $record) {
        foreach ($record['medicines'] as $m) {
            $course = medicine_course_status($record['date'], $m['duration']);
            $list[] = $m + [
                'date'         => $record['date'],
                'doctor'       => $record['doctor'],
                'source'       => $record['source'],
                'courseStatus' => $course['status'],
                'courseLabel'  => $course['label'],
            ];
        }
    }

    // Taking now first, then unknown, starting later, and finished. Newest prescriptions first within each group.
    $rank = ['taking' => 0, 'unknown' => 1, 'future' => 2, 'finished' => 3];
    usort($list, function ($a, $b) use ($rank) {
        return [$rank[$a['courseStatus']], $b['date']] <=> [$rank[$b['courseStatus']], $a['date']];
    });
    return $list;
}