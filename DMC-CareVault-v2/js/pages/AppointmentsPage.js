/*
 * AppointmentsPage.js
 * Purpose: list, search, filter, create, edit and cancel appointments.
 * Doctors can view their own appointments but cannot change them.
 */
class AppointmentsPage {
    constructor() {
        this.mainElement = null;
        this.searchKeyword = "";
        this.filterDate = "";
        this.filterStatus = "";
    }

    start() {
        const page = this;
        const layout = new PageLayout("appointments");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.showPage();
        });
    }

    showPage() {
        let html = "<h2>Appointments</h2>";
        html += '<div class="toolbar">';
        html += '<input id="searchInput" placeholder="Search patient or reason...">';
        html += '<input id="dateFilter" type="date" title="Filter by date">';
        html += '<select id="statusFilter"><option value="">All statuses</option>';
        for (let i = 0; i < appointmentService.validStatuses.length; i++) {
            html += "<option>" + appointmentService.validStatuses[i] + "</option>";
        }
        html += "</select>";
        html += '<span class="sp"></span>';
        if (permissionService.userCan("appointments.manage")) {
            html += '<button class="btn" id="addAppointmentButton">+ New Appointment</button>';
        }
        html += "</div>";
        html += '<div class="card" id="appointmentTable"></div>';

        this.mainElement.innerHTML = html;
        this.connectEvents();
        this.refreshTable();
    }

    connectEvents() {
        const page = this;

        document.getElementById("searchInput").addEventListener("input", function (event) {
            page.searchKeyword = event.target.value.toLowerCase();
            page.refreshTable();
        });
        document.getElementById("dateFilter").addEventListener("change", function (event) {
            page.filterDate = event.target.value;
            page.refreshTable();
        });
        document.getElementById("statusFilter").addEventListener("change", function (event) {
            page.filterStatus = event.target.value;
            page.refreshTable();
        });

        const addButton = document.getElementById("addAppointmentButton");
        if (addButton !== null) {
            addButton.addEventListener("click", function () {
                page.openAppointmentForm(null);
            });
        }

        document.getElementById("appointmentTable").addEventListener("click", function (event) {
            page.handleTableButtonClick(event);
        });
    }

    // Applies the search text, date filter and status filter, one after another.
    getFilteredAppointments() {
        const allAppointments = appointmentService.getAppointmentsForCurrentUser();
        const result = [];

        for (let i = 0; i < allAppointments.length; i++) {
            const appointment = allAppointments[i];

            if (this.filterDate !== "" && appointment.date !== this.filterDate) {
                continue;
            }
            if (this.filterStatus !== "" && appointment.status !== this.filterStatus) {
                continue;
            }

            const searchableText = (patientService.getPatientNameById(appointment.patientId) + " " +
                appointment.patientId + " " + appointment.reason).toLowerCase();
            if (this.searchKeyword !== "" && !searchableText.includes(this.searchKeyword)) {
                continue;
            }

            result.push(appointment);
        }

        // Newest date and time first.
        result.sort(function (first, second) {
            return (second.date + second.time).localeCompare(first.date + first.time);
        });
        return result;
    }

    refreshTable() {
        const page = this;
        const columns = [
            { title: "ID", getCellHtml: function (item) { return item.id; } },
            { title: "Patient", getCellHtml: function (item) { return htmlHelper.escapeText(patientService.getPatientNameById(item.patientId)); } },
            { title: "Date", getCellHtml: function (item) { return item.date; } },
            { title: "Time", getCellHtml: function (item) { return item.time; } },
            { title: "Doctor", getCellHtml: function (item) { return htmlHelper.escapeText(userService.getFullNameByUsername(item.doctorUsername)); } },
            { title: "Reason", getCellHtml: function (item) { return htmlHelper.escapeText(item.reason); } },
            { title: "Status", getCellHtml: function (item) { return htmlHelper.buildStatusBadge(item.status); } }
        ];

        if (permissionService.userCan("appointments.manage")) {
            columns.push({ title: "Action", getCellHtml: function (item) { return page.buildActionButtons(item); } });
        }

        document.getElementById("appointmentTable").innerHTML =
            tableBuilder.buildTableHtml(columns, this.getFilteredAppointments(), "No appointments found.");
    }

    buildActionButtons(appointment) {
        let html = '<button class="btn sm ghost" data-action="edit" data-id="' + appointment.id + '">Edit</button>';

        const isFinished = appointment.status === "Completed" || appointment.status === "Cancelled";
        if (!isFinished) {
            html += '<button class="btn sm danger" data-action="cancel" data-id="' + appointment.id + '">Cancel</button>';
        }
        return html;
    }

    findAppointmentById(appointmentId) {
        const allAppointments = appointmentService.getAppointmentsForCurrentUser();
        for (let i = 0; i < allAppointments.length; i++) {
            if (allAppointments[i].id === appointmentId) {
                return allAppointments[i];
            }
        }
        return null;
    }

    handleTableButtonClick(event) {
        const button = event.target.closest("button[data-action]");
        if (button === null) {
            return;
        }

        const action = button.getAttribute("data-action");
        const appointment = this.findAppointmentById(button.getAttribute("data-id"));

        try {
            if (action === "edit") {
                this.openAppointmentForm(appointment);
            } else if (action === "cancel") {
                this.cancelAppointment(appointment);
            }
        } catch (error) {
            notifier.showError(error.message);
        }
    }

    cancelAppointment(appointment) {
        if (confirm("Cancel this appointment?") === false) {
            return;
        }
        appointmentService.changeStatus(appointment.id, "Cancelled");
        notifier.showSuccess("Appointment successfully cancelled.");
        this.refreshTable();
    }

    buildFormFields(isEditing) {
        const doctorOptions = [];
        const doctors = userService.getActiveDoctors();
        for (let i = 0; i < doctors.length; i++) {
            doctorOptions.push({ value: doctors[i].username, label: doctors[i].fullName });
        }

        const fields = [];
        fields.push({ name: "patientId", label: "Patient", type: "select", options: patientService.getPatientSelectOptions(), isFullWidth: true });
        fields.push({ name: "date", label: "Date", type: "date", isRequired: true, defaultValue: dateHelper.getTodayString() });
        fields.push({ name: "time", label: "Time", type: "time", isRequired: true });
        fields.push({ name: "doctorUsername", label: "Doctor", type: "select", options: doctorOptions, isFullWidth: true });
        fields.push({ name: "reason", label: "Reason", type: "text", isRequired: true, isFullWidth: true });

        if (isEditing) {
            fields.push({ name: "status", label: "Status", type: "select", isFullWidth: true,
                options: formBuilder.createOptionsFromTexts(appointmentService.validStatuses) });
        }
        return fields;
    }

    openAppointmentForm(appointmentToEdit) {
        const page = this;
        const isEditing = appointmentToEdit !== null;
        const fields = this.buildFormFields(isEditing);

        let existingValues = {};
        let dialogTitle = "New Appointment";
        if (isEditing) {
            existingValues = appointmentToEdit;
            dialogTitle = "Edit Appointment";
        }

        const dialog = new ModalDialog(dialogTitle, formBuilder.buildFormHtml(fields, existingValues), {
            onSave: function () {
                page.saveAppointmentFromForm(fields, appointmentToEdit);
            }
        });
        dialog.open();
    }

    saveAppointmentFromForm(fields, appointmentToEdit) {
        const formValues = formBuilder.readFormValues(fields);

        if (appointmentToEdit === null) {
            formValues.id = "";
            appointmentService.saveAppointment(formValues);
            notifier.showSuccess("Appointment successfully created.");
        } else {
            formValues.id = appointmentToEdit.id;

            // The status is changed with changeStatus() so queue numbers are handled correctly.
            const newStatus = formValues.status;
            delete formValues.status;
            appointmentService.saveAppointment(formValues);

            if (newStatus !== appointmentToEdit.status) {
                appointmentService.changeStatus(appointmentToEdit.id, newStatus);
            }
            notifier.showSuccess("Appointment updated successfully.");
        }
        this.refreshTable();
    }
}

const appointmentsPage = new AppointmentsPage();
appointmentsPage.start();
