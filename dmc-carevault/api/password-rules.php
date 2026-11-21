<?php
/*
 * api/password-rules.php - the password policy for Admin, Staff and Doctor accounts.
 * The browser checks the same rules in js/core/Validator.js. Keep the two lists the same.
 */

// Returns an error message when the password breaks a rule, or null when it is fine.
function password_rule_error(string $password): ?string {
    $missing = [];

    if (mb_strlen($password) < 8) {
        $missing[] = 'at least 8 characters';
    }
    if (!preg_match('/[A-Z]/', $password)) {
        $missing[] = '1 uppercase letter (A-Z)';
    }
    if (!preg_match('/[a-z]/', $password)) {
        $missing[] = '1 lowercase letter (a-z)';
    }
    if (!preg_match('/[0-9]/', $password)) {
        $missing[] = '1 number (0-9)';
    }
    if (!preg_match('/[!@#$%&*]/', $password)) {
        $missing[] = '1 special character (! @ # $ % & *)';
    }

    if ($missing) {
        return 'Password must have ' . implode(', ', $missing) . '.';
    }
    return null;
}
