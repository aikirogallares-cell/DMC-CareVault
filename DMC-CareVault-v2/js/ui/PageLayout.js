/*
 * PageLayout.js
 * Purpose: the frame shared by every page after login: sidebar, top header and the access check.
 * Because all pages use this class, the navigation and the permission check are written only once.
 *
 * Usage inside a page:
 *   const layout = new PageLayout("patients");
 *   layout.show(function (mainElement, currentUser) { ...fill mainElement... });
 */
class PageLayout {
    constructor(pageId) {
        this.pageId = pageId;
    }

    show(contentBuilder) {
        // 1. Nobody logged in -> go to the login page.
        const currentUser = authService.getCurrentUser();
        if (currentUser === null) {
            window.location.replace("../index.html");
            return;
        }

        const settings = settingsService.getSettings();
        const pageInfo = pageRegistry.findPageById(this.pageId);

        // 2. Draw the sidebar and header.
        document.getElementById("app").innerHTML = this.buildLayoutHtml(currentUser, settings);
        this.connectLayoutButtons();

        const mainElement = document.getElementById("main");

        // 3. Page-level permission check (stops people who type a page address manually).
        if (pageInfo === null || !this.userMayOpenPage(pageInfo)) {
            mainElement.innerHTML = this.buildAccessDeniedHtml(currentUser);
            auditLogService.recordAction("Access denied", "Tried to open page: " + this.pageId);
            return;
        }

        document.title = pageInfo.title + " - DMC CareVault";
        contentBuilder(mainElement, currentUser);
    }

    userMayOpenPage(pageInfo) {
        if (pageInfo.permission === null) {
            return true;
        }
        return permissionService.userCan(pageInfo.permission);
    }

    buildLayoutHtml(currentUser, settings) {
        let html = '<div class="layout">';
        html += '<aside class="sidebar" id="sidebar">';
        html += '<div class="brand">✚ ' + htmlHelper.escapeText(settings.systemName) + "</div>";
        html += this.buildMenuHtml();
        html += '<hr><a href="#" id="logoutLink"><i>⎋</i>Logout</a>';
        html += "</aside>";

        html += '<div class="main-wrap">';
        html += '<header class="topbar">';
        html += '<button class="burger" id="menuButton">☰</button>';
        html += '<div class="t"><b>' + htmlHelper.escapeText(settings.systemName) + "</b>";
        html += "<small>" + htmlHelper.escapeText(settings.clinicName) + "</small></div>";
        html += '<div class="sp"></div>';
        html += this.buildBellHtml();
        html += '<div class="user">' + htmlHelper.escapeText(currentUser.fullName);
        html += "<br><small>" + currentUser.role + "</small></div>";
        html += "</header>";
        html += '<main id="main"></main>';
        html += "</div></div>";
        html += '<div id="toasts"></div>';
        return html;
    }

    // Shows only the menu items the current user is allowed to open.
    buildMenuHtml() {
        const allPages = pageRegistry.getAllPages();
        let html = "";

        for (let i = 0; i < allPages.length; i++) {
            const page = allPages[i];

            if (!this.userMayOpenPage(page)) {
                continue;
            }

            let activeClass = "";
            if (page.id === this.pageId) {
                activeClass = "on";
            }

            html += '<a href="' + page.fileName + '" class="' + activeClass + '">';
            html += "<i>" + page.icon + "</i>" + page.title + "</a>";
        }
        return html;
    }

    // The bell shows how many patients are waiting in the queue today.
    getWaitingCount() {
        if (!permissionService.userCan("appointments.view")) {
            return 0;
        }
        const todayAppointments = appointmentService.getTodayAppointments();
        return appointmentService.countByStatus(todayAppointments, "Waiting");
    }

    buildBellHtml() {
        const waitingCount = this.getWaitingCount();
        let badgeHtml = "";
        if (waitingCount > 0) {
            badgeHtml = "<em>" + waitingCount + "</em>";
        }
        return '<button class="bell" id="bellButton" title="Notifications">🔔' + badgeHtml + "</button>";
    }

    buildAccessDeniedHtml(currentUser) {
        let html = '<div class="denied"><h2>Access Denied</h2>';
        html += "<p>You do not have permission to access this page.</p>";
        html += '<a class="btn" href="' + authService.getDashboardFileName(currentUser.role) + '">Back to my dashboard</a></div>';
        return html;
    }

    connectLayoutButtons() {
        const waitingCount = this.getWaitingCount();

        document.getElementById("menuButton").addEventListener("click", function () {
            document.getElementById("sidebar").classList.toggle("open");
        });

        document.getElementById("bellButton").addEventListener("click", function () {
            if (waitingCount > 0) {
                notifier.showWarning(waitingCount + " patient(s) waiting in the queue.");
            } else {
                notifier.showSuccess("No new notifications.");
            }
        });

        document.getElementById("logoutLink").addEventListener("click", function (event) {
            event.preventDefault();
            authService.logout();
            window.location.href = "../index.html";
        });
    }
}
