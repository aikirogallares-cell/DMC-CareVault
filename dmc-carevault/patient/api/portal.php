<?php
/*
 * patient/api/portal.php - the signed-in patient's own pages:
 * visit booking (free times), their visits, prescriptions and medicines.
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
    json_out(['success' => true, 'message' => 'Your visit is booked. Please arrive on time and bring a valid ID.']);
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
    if (!in_array($reason, VISIT_REASONS, true)) {
        throw new UserError('Choose the reason for your visit.');
    }

    // Check the chosen time again on the server, so a stale page cannot book a taken slot.
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

    $pdo->prepare("INSERT INTO patient_bookings (patient_account_id, patient_id, booking_date, slot_time, reason, status) VALUES (?, ?, ?, ?, ?, 'Booked')")
        ->execute([$account['id'], $account['patient_id'], $date, $time . ':00', $reason]);
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
    $st = db()->prepare("UPDATE patient_bookings SET status = 'Cancelled' WHERE id = ? AND patient_account_id = ? AND status = 'Booked' AND booking_date >= CURDATE()");
    $st->execute([$id, $account['id']]);
    if ($st->rowCount() === 0) {
        throw new UserError('This visit cannot be cancelled.');
    }
    log_action($account['username'], 'Patient', 'Visit cancelled', 'Booking #' . $id);
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

// The last day of a course. Day 1 is the prescription date, the same rule as MedicalRecordService.js.
function course_end(string $start, string $duration): ?string {
    if (!preg_match('/^(\d+)\s*(day|days|week|weeks|month|months)$/i', trim($duration), $m)) {
        return null;
    }
    $unitDays = stripos($m[2], 'day') === 0 ? 1 : (stripos($m[2], 'week') === 0 ? 7 : 30);
    return date('Y-m-d', strtotime($start . ' +' . ((int)$m[1] * $unitDays - 1) . ' days'));
}

// Every medicine with its status: Taking now, Finished, or Ask the clinic (unknown duration).
function medicine_list(array $records): array {
    $today = date('Y-m-d');
    $list = [];
    foreach ($records as $record) {
        foreach ($record['medicines'] as $m) {
            $end = course_end($record['date'], $m['duration']);
            if ($end === null) {
                $status = 'Ask the clinic';
                $until = '-';
            } elseif ($end >= $today) {
                $status = 'Taking now';
                $until = $end;
            } else {
                $status = 'Finished';
                $until = $end;
            }
            $list[] = $m + [
                'date'   => $record['date'],
                'doctor' => $record['doctor'],
                'source' => $record['source'],
                'status' => $status,
                'until'  => $until,
            ];
        }
    }
    $rank = ['Taking now' => 0, 'Ask the clinic' => 1, 'Finished' => 2];
    usort($list, function ($a, $b) use ($rank) {
        return [$rank[$a['status']], $b['date']] <=> [$rank[$b['status']], $a['date']];
    });
    return $list;
}