/*
 * PatientApprovalsPage.js
 * Purpose: Admin reviews new patient registrations and approves or rejects them.
 * Patients cannot sign in until their account is Approved.
 */
class PatientApprovalsPage {
    constructor() {
        this.mainElement = null;
        this.currentFilter = "Pending";
        this.filters = ["Pending", "Approved", "Rejected", "All"];
    }

    start() {
        const page = this;
        const layout = new PageLayout("patient-approvals");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.showPage();
        });
    }

    showPage() {
        this.mainElement.innerHTML =
            '<h2>Patient Account Approvals</h2>' +
            '<p style="color:var(--tx2);margin:0 0 14px">Review new patient registrations before they can sign in.</p>' +
            '<div class="toolbar" id="approvalTabs"></div>' +
            '<div id="approvalList"></div>';

        const page = this;
        document.getElementById("approvalTabs").addEventListener("click", function (event) {
            const button = event.target.closest("button[data-filter]");
            if (button !== null) {
                page.currentFilter = button.getAttribute("data-filter");
                page.refresh();
            }
        });

        document.getElementById("approvalList").addEventListener("click", function (event) {
            const button = event.target.closest("button[data-action]");
            if (button === null) {
                return;
            }
            const accountId = button.getAttribute("data-id");
            const action = button.getAttribute("data-action");

            if (action === "approve") {
                page.approve(accountId);
            } else if (action === "reject") {
                page.openRejectDialog(accountId);
            }
        });

        this.refresh();
    }

    refresh() {
        try {
            const data = patientApprovalService.getAccounts(this.currentFilter);
            this.renderTabs(data.counts);
            this.renderList(data.accounts);
        } catch (error) {
            notifier.showError(error.message);
        }
    }

    renderTabs(counts) {
        const safe = htmlHelper.escapeText;
        const total = counts.Pending + counts.Approved + counts.Rejected;
        let html = "";

        this.filters.forEach(function (name) {
            const number = name === "All" ? total : counts[name];
            const activeClass = name === this.currentFilter ? "btn" : "btn ghost";
            html += '<button class="' + activeClass + '" data-filter="' + safe(name) + '">' +
                safe(name) + " (" + number + ")</button> ";
        }, this);

        document.getElementById("approvalTabs").innerHTML = html;
    }

    renderList(accounts) {
        const list = document.getElementById("approvalList");
        if (accounts.length === 0) {
            list.innerHTML = '<div class="empty">No accounts here.</div>';
            return;
        }

        let html = "";
        accounts.forEach(function (account) {
            html += this.buildCardHtml(account);
        }, this);
        list.innerHTML = html;
    }

    buildCardHtml(account) {
        const safe = htmlHelper.escapeText;
        const age = patientService.getAgeInYears(account.birth_date);
        const isPending = account.status === "Pending";

        let html = '<div class="card">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">';
        html += "<h3>" + safe(account.full_name) + "</h3>";
        html += htmlHelper.buildStatusBadge(account.status);
        html += "</div>";

        html += '<dl class="kv" style="margin-top:12px">';
        html += "<dt>Username</dt><dd>" + safe(account.username) + "</dd>";
        html += "<dt>Contact number</dt><dd>" + safe(account.contact_number) + "</dd>";
        html += "<dt>Email</dt><dd>" + safe(account.email || "-") + "</dd>";
        html += "<dt>Date of birth</dt><dd>" + safe(account.birth_date) + " (age " + safe(age) + ")</dd>";
        html += "<dt>Registered</dt><dd>" + safe(account.created_at) + "</dd>";
        if (account.guardian_name) {
        html += "<dt>Guardian</dt><dd>" + safe(account.guardian_name) + " (" + safe(account.guardian_relationship) + ")</dd>";
        html += "<dt>Guardian contact</dt><dd>" + safe(account.guardian_contact) + "</dd>";
        }
        html += "</dl>";

        if (age !== null && age < 18) {
            html += '<p class="warn-text" style="margin-top:10px">This patient is under 18. Check the guardian details before approving.</p>';
        }
        if (account.status === "Rejected") {
            html += '<p style="color:var(--tx2);margin-top:10px">Reason shown to the patient: ' + safe(account.reject_reason) + "</p>";
        }
        if (!isPending && account.approved_by) {
            html += '<p style="color:var(--tx2);margin-top:6px">Decided by ' + safe(account.approved_by) +
                " on " + safe(account.approved_at) + "</p>";
        }

        if (isPending) {
            html += '<div class="popup-actions">';
            html += '<button class="btn" data-action="approve" data-id="' + safe(account.id) + '">Approve</button>';
            html += '<button class="btn danger" data-action="reject" data-id="' + safe(account.id) + '">Reject</button>';
            html += "</div>";
        }

        html += "</div>";
        return html;
    }

    approve(accountId) {
        try {
            patientApprovalService.approve(accountId);
            notifier.showSuccess("Account approved. The patient can now sign in.");
            this.refresh();
        } catch (error) {
            notifier.showError(error.message);
        }
    }

    openRejectDialog(accountId) {
        const page = this;
        const dialog = new ModalDialog("Reject Account",
            '<p class="popup-lead">The reason is shown to the patient when they try to sign in.</p>' +
            '<div class="fg"><label for="rejectReason">Reason</label>' +
            '<textarea id="rejectReason" rows="3" maxlength="255"></textarea></div>', {
            saveButtonText: "Confirm reject",
            onSave: function (openDialog) {
                const reason = openDialog.getElement().querySelector("#rejectReason").value;
                patientApprovalService.reject(accountId, reason);
                notifier.showSuccess("Account rejected.");
                page.refresh();
            }
        });
        dialog.open();
    }
}

const patientApprovalsPage = new PatientApprovalsPage();
patientApprovalsPage.start();