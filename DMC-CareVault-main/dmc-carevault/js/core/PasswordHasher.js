/*
 * PasswordHasher.js
 * Purpose: turns a password into a scrambled value so we never store the plain password.
 *
 * WARNING: This is a simple DEMONSTRATION hash (djb2 with a salt).
 * It is NOT secure. A real system must hash passwords on the server
 * using bcrypt or argon2.
 */
class PasswordHasher {
    // A salt is random text added to the password so equal passwords give different hashes.
    createSalt() {
        return Math.random().toString(36).substring(2, 10);
    }

    hashPassword(plainPassword, salt) {
        const textToHash = salt + ":" + plainPassword;
        let hashValue = 5381;

        for (let i = 0; i < textToHash.length; i++) {
            const characterCode = textToHash.charCodeAt(i);
            hashValue = (hashValue * 33 + characterCode) % 4294967296;
        }

        return hashValue.toString(16);
    }

    isPasswordCorrect(plainPassword, salt, savedHash) {
        const newHash = this.hashPassword(plainPassword, salt);
        return newHash === savedHash;
    }
}

const passwordHasher = new PasswordHasher();
