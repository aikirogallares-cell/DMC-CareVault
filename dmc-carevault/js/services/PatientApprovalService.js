/*
 * PatientApprovalService.js
 * Purpose: the Admin's requests for reviewing patient registrations.
 * The server (api/patient-approvals.php) repeats the Admin check.
 */
class PatientApprovalService {
    // statusFilter: "Pending", "Approved", "Rejected" or "All".
    // Returns { accounts: [...], counts: { Pending, Approved, Rejected } }.
    getAccounts(statusFilter) {
        permissionService.requirePermission("users.manage");

        const reply = storageService.sendRequest("GET", "patient-approvals.php?status=" + encodeURIComponent(statusFilter));
        return { accounts: reply.accounts, counts: reply.counts };
    }

    approve(accountId) {
        permissionService.requirePermission("users.manage");
        storageService.sendRequest("POST", "patient-approvals.php", { id: accountId, action: "approve" });
    }

    // The reason is required and is shown to the patient.
    reject(accountId, reason) {
        permissionService.requirePermission("users.manage");

        const cleanReason = String(reason || "").trim();
        if (cleanReason === "") {
            throw new Error("Write a reason for rejecting this account.");
        }
        storageService.sendRequest("POST", "patient-approvals.php", { id: accountId, action: "reject", reason: cleanReason });
    }
}

const patientApprovalService = new PatientApprovalService();