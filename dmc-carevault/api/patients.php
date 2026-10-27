<?php
// api/patients.php - patient records in the dmc_carevault database.
//   GET                                    -> every patient, as a list
//   POST {"action":"save","data":{...}}    -> adds a patient (no id) or updates one (with an id)
//   POST {"action":"archive","id":"P-..."} -> hides a patient; the record is kept
require_once __DIR__ . "/../config/db.php";

// Browser name => database column.
const PATIENT_COLUMNS = [
    "firstName" => "first_name",
    "middleName" => "middle_name",
    "lastName" => "last_name",
    "birthDate" => "birth_date",
    "gender" => "gender",
    "civilStatus" => "civil_status",
    "contactNumber" => "contact_number",
    "lotNo" => "lot_no",
    "barangay" => "barangay",
    "city" => "city",
    "address" => "address",
    "emergencyName" => "emergency_name",
    "emergencyRelationship" => "emergency_relationship",
    "emergencyContactNumber" => "emergency_contact_number",
    "bloodType" => "blood_type",
    "allergies" => "allergies",
    "medicalConditions" => "medical_conditions",
    "currentMedications" => "current_medications",
    "dateRegistered" => "date_registered",
    "lastVisit" => "last_visit",
];

// Columns that may be empty. Empty values are saved as NULL.
const NULLABLE_COLUMNS = [
    "middle_name", "civil_status", "contact_number", "lot_no", "barangay", "city", "address",
    "emergency_name", "emergency_relationship", "emergency_contact_number", "blood_type",
    "allergies", "medical_conditions", "current_medications", "last_visit",
];

// Database row -> the patient object the browser code uses.
function rowToPatient(array $row): array
{
    $patient = ["id" => $row["id"]];
    foreach (PATIENT_COLUMNS as $browserName => $column) {
        $patient[$browserName] = $row[$column] ?? "";
    }
    $patient["isPwd"] = (int)$row["is_pwd"] === 1;
    $patient["pwdId"] = $row["pwd_id"] ?? "";
    $patient["isArchived"] = (int)$row["is_archived"] === 1;
    return $patient;
}

function findPatientRow(PDO $pdo, string $id): ?array
{
    $statement = $pdo->prepare("SELECT * FROM patients WHERE id = ?");
    $statement->execute([$id]);
    $row = $statement->fetch();
    return $row === false ? null : $row;
}

// A new patient number that no patient has yet, for example P-483920.
function newPatientId(PDO $pdo): string
{
    do {
        $id = "P-" . random_int(100000, 999999);
    } while (findPatientRow($pdo, $id) !== null);
    return $id;
}

function savePatient(PDO $pdo, array $data): array
{
    $isNew = empty($data["id"]);
    $existing = [];

    if ($isNew) {
        $id = newPatientId($pdo);
    } else {
        $id = (string)$data["id"];
        $row = findPatientRow($pdo, $id);
        if ($row === null) {
            sendJson(["error" => "Patient record not found."], 404);
        }
        $existing = rowToPatient($row);
    }

    // Values the form did not send (for example hidden medical fields) keep their saved values.
    $defaults = [
        "dateRegistered" => date("Y-m-d"),
        "lastVisit" => "",
        "isArchived" => false,
        "isPwd" => false,
        "pwdId" => "",
    ];
    $merged = array_merge($defaults, $existing, $data);

    // The browser checks these first. The server checks them again.
    $problems = [];
    if (trim((string)($merged["firstName"] ?? "")) === "") {
        $problems[] = "First name is required.";
    }
    if (trim((string)($merged["lastName"] ?? "")) === "") {
        $problems[] = "Last name is required.";
    }
    $birth = DateTime::createFromFormat("!Y-m-d", (string)($merged["birthDate"] ?? ""));
    if ($birth === false) {
        $problems[] = "Date of birth is required.";
    } elseif ($birth > new DateTime("today")) {
        $problems[] = "Date of birth cannot be in the future.";
    }
    if (!in_array($merged["gender"] ?? "", ["Male", "Female"], true)) {
        $problems[] = "Gender must be Male or Female.";
    }
    $contact = trim((string)($merged["contactNumber"] ?? ""));
    if ($contact !== "" && !preg_match('/^09\d{9}$/', $contact)) {
        $problems[] = "Contact number must be 11 digits and start with 09.";
    }
    if (count($problems) > 0) {
        sendJson(["error" => implode(" ", $problems)], 400);
    }

    // Build the column values.
    $values = [];
    foreach (PATIENT_COLUMNS as $browserName => $column) {
        $value = trim((string)($merged[$browserName] ?? ""));
        if ($value === "" && in_array($column, NULLABLE_COLUMNS, true)) {
            $values[$column] = null;
        } else {
            $values[$column] = $value;
        }
    }

    $isPwd = ($merged["isPwd"] === true || $merged["isPwd"] === 1 || $merged["isPwd"] === "Yes");
    $pwdId = trim((string)($merged["pwdId"] ?? ""));
    $values["is_pwd"] = $isPwd ? 1 : 0;
    $values["pwd_id"] = ($isPwd && $pwdId !== "") ? $pwdId : null;
    $values["is_archived"] = ($merged["isArchived"] === true || $merged["isArchived"] === 1) ? 1 : 0;

    if ($isNew) {
        $columns = array_keys($values);
        $placeholders = implode(", ", array_fill(0, count($columns), "?"));
        $sql = "INSERT INTO patients (id, " . implode(", ", $columns) . ") VALUES (?, " . $placeholders . ")";
        $pdo->prepare($sql)->execute(array_merge([$id], array_values($values)));
    } else {
        $assignments = implode(", ", array_map(function ($column) {
            return $column . " = ?";
        }, array_keys($values)));
        $pdo->prepare("UPDATE patients SET " . $assignments . " WHERE id = ?")
            ->execute(array_merge(array_values($values), [$id]));
    }

    return rowToPatient(findPatientRow($pdo, $id));
}

function archivePatient(PDO $pdo, string $id): void
{
    if (findPatientRow($pdo, $id) === null) {
        sendJson(["error" => "Patient record not found."], 404);
    }
    $pdo->prepare("UPDATE patients SET is_archived = 1 WHERE id = ?")->execute([$id]);
    sendJson(["ok" => true]);
}

// ---- Main: decide what the request asks for ----

$pdo = getDatabase();
$method = $_SERVER["REQUEST_METHOD"];

try {
    if ($method === "GET") {
        $rows = $pdo->query("SELECT * FROM patients ORDER BY last_name, first_name")->fetchAll();
        sendJson(array_map("rowToPatient", $rows));
    }

    if ($method === "POST") {
        $body = json_decode(file_get_contents("php://input"), true);
        if (!is_array($body)) {
            sendJson(["error" => "The request could not be read."], 400);
        }

        $action = $body["action"] ?? "";
        if ($action === "save") {
            sendJson(savePatient($pdo, (array)($body["data"] ?? [])));
        }
        if ($action === "archive") {
            archivePatient($pdo, (string)($body["id"] ?? ""));
        }
        sendJson(["error" => "Unknown action."], 400);
    }

    sendJson(["error" => "This request method is not allowed."], 405);
} catch (PDOException $e) {
    sendJson(["error" => "Database error: " . $e->getMessage()], 500);
}