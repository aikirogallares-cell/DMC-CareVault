<?php
/*
 * api/pin-rules.php - rules shared by the sign-in PIN and the Settings PIN change.
 */
const PIN_MAX_TRIES    = 5;    // wrong PINs allowed before the lock
const PIN_LOCK_MINUTES = 15;   // how long the lock lasts

// Rejects PINs that are easy to guess: one repeated digit, or counting in order.
function pin_is_weak(string $pin): bool {
    if (preg_match('/^(\d)\1+$/', $pin)) {
        return true;
    }
    return strpos('0123456789', $pin) !== false || strpos('9876543210', $pin) !== false;
}