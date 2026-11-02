/*
 * StorageService.js
 * Purpose: the ONLY place that stores data.
 *
 * Lists in `serverLists` are saved in the MySQL database through the PHP files in /api.
 * Everything else (appointments, vitals, doctor availability, settings...) is still
 * in the browser's localStorage until those services are moved to the database too.
 *
 * The other services did not have to change: loadList() and saveList() work the same.
 * The page waits for the server (synchronous requests), which keeps all existing code working.
 */
class StorageService {
    constructor() {
        this.keyPrefix = "dmcv2_";

        // These lists live in the database.
            this.serverLists = ["users", "patients", "consultations", "prescriptions", "medications", "auditLogs", "bills", "appointments"];

        // A loaded list is reused for a few seconds so a page does not ask the server hundreds of times.
        this.cacheSeconds = 3;
        this.cache = {};
        // What the server last sent for each item, so saveList() only sends what changed.
        this.snapshots = {};

        this.isInsidePagesFolder = window.location.pathname.indexOf("/pages/") !== -1;
        this.apiPath = this.isInsidePagesFolder ? "../api/" : "api/";
        this.loginPagePath = this.isInsidePagesFolder ? "../index.html" : "index.html";
    }

    // ----- Talking to the PHP server -----

    // Sends one request and waits for the answer. Returns the reply object or throws an Error.
    sendRequest(method, fileAndQuery, bodyObject) {
        const request = new XMLHttpRequest();
        request.open(method, this.apiPath + fileAndQuery, false);

        let bodyText = null;
        if (bodyObject !== undefined) {
            request.setRequestHeader("Content-Type", "application/json");
            bodyText = JSON.stringify(bodyObject);
        }

        try {
            request.send(bodyText);
        } catch (error) {
            throw new Error("Cannot reach the server. Check that Apache and MySQL are running in XAMPP.");
        }

        let reply = null;
        try {
            reply = JSON.parse(request.responseText);
        } catch (error) {
            throw new Error("The server sent an unexpected reply (HTTP " + request.status + "). Open the api file in your browser to see the PHP error.");
        }

        // Not logged in on the server (for example the PHP session ended).
        if (request.status === 401 && fileAndQuery.indexOf("auth.php") !== 0) {
            sessionStorage.removeItem("dmcv2_session");
            if (this.isInsidePagesFolder) {
                sessionStorage.setItem("dmcv2_flashMessage", "Please log in again.");
                window.location.replace(this.loginPagePath);
                throw new Error("Please log in again.");
            }
            // On the login screen there is nobody to log out: behave like an empty database.
            return { list: [] };
        }

        if (request.status >= 400) {
            throw new Error(reply.message || "Server error.");
        }
        return reply;
    }

    // ----- Lists -----

    loadList(listName) {
        if (this.serverLists.indexOf(listName) === -1) {
            return this.loadLocalList(listName);
        }

        const cached = this.cache[listName];
        if (cached !== undefined && Date.now() - cached.time < this.cacheSeconds * 1000) {
            return JSON.parse(cached.text);
        }

        const reply = this.sendRequest("GET", "storage.php?name=" + encodeURIComponent(listName));
        this.rememberList(listName, reply.list);
        return JSON.parse(this.cache[listName].text);
    }

    saveList(listName, list) {
        if (this.serverLists.indexOf(listName) === -1) {
            this.saveLocalList(listName, list);
            return;
        }

        // Only new or changed items are sent to the server.
        const snapshot = this.snapshots[listName] || {};
        const changedItems = [];
        const newIds = [];

        for (let i = 0; i < list.length; i++) {
            const knownText = snapshot[list[i].id];
            if (knownText === undefined) {
                newIds.push(list[i].id);
                changedItems.push(list[i]);
            } else if (knownText !== JSON.stringify(list[i])) {
                changedItems.push(list[i]);
            }
        }
        if (changedItems.length === 0) {
            return;
        }

        let reply = null;
        try {
            reply = this.sendRequest("POST", "storage.php?name=" + encodeURIComponent(listName), { items: changedItems, newIds: newIds });
        } catch (error) {
            delete this.cache[listName];
            throw error;
        }
        this.rememberList(listName, reply.list);
    }

    rememberList(listName, list) {
        this.cache[listName] = { time: Date.now(), text: JSON.stringify(list) };

        const snapshot = {};
        for (let i = 0; i < list.length; i++) {
            snapshot[list[i].id] = JSON.stringify(list[i]);
        }
        this.snapshots[listName] = snapshot;
    }

    // Adds one line to the activity log (stored in the audit_logs table).
    appendAuditLog(action, details) {
        try {
            this.sendRequest("POST", "storage.php?name=auditLogs", { action: action, details: details });
            delete this.cache.auditLogs;
        } catch (error) {
            console.error("Could not write the activity log.", error);
        }
    }

    // ----- Browser-only lists (not in the database yet) -----

    loadLocalList(listName) {
        const savedText = localStorage.getItem(this.keyPrefix + listName);

        if (savedText === null) {
            return [];
        }

        try {
            return JSON.parse(savedText);
        } catch (error) {
            console.error("Could not read saved list: " + listName, error);
            return [];
        }
    }

    saveLocalList(listName, list) {
        localStorage.setItem(this.keyPrefix + listName, JSON.stringify(list));
    }

    // Load a single object such as "settings". Returns defaultValue if nothing is saved.
    loadObject(objectName, defaultValue) {
        const savedText = localStorage.getItem(this.keyPrefix + objectName);

        if (savedText === null) {
            return defaultValue;
        }

        try {
            return JSON.parse(savedText);
        } catch (error) {
            console.error("Could not read saved object: " + objectName, error);
            return defaultValue;
        }
    }

    saveObject(objectName, objectValue) {
        localStorage.setItem(this.keyPrefix + objectName, JSON.stringify(objectValue));
    }

    // ----- IDs -----

    // Creates IDs like P-0001, P-0002 by finding the highest number already used.
    generateNextId(prefix, list) {
        let highestNumber = 0;

        for (let i = 0; i < list.length; i++) {
            const idParts = String(list[i].id).split("-");
            const numberPart = parseInt(idParts[1]);

            if (!isNaN(numberPart) && numberPart > highestNumber) {
                highestNumber = numberPart;
            }
        }

        const nextNumber = highestNumber + 1;
        return prefix + "-" + String(nextNumber).padStart(4, "0");
    }

    // Creates a random ID such as P-483920 (prefix + random digits) that is not used yet.
    generateRandomId(prefix, list, digits) {
        const usedIds = {};
        for (let i = 0; i < list.length; i++) {
            usedIds[list[i].id] = true;
        }

        const lowestNumber = Math.pow(10, digits - 1);
        const numberOfChoices = 9 * lowestNumber;
        let newId = "";

        do {
            const randomNumber = lowestNumber + Math.floor(Math.random() * numberOfChoices);
            newId = prefix + "-" + String(randomNumber);
        } while (usedIds[newId] === true);

        return newId;
    }
}

const storageService = new StorageService();