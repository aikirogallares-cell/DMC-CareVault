/*
 * StorageService.js
 * Purpose: the ONLY place that touches the browser's localStorage.
 *
 * PROTOTYPE NOTE: localStorage is temporary storage for demonstration.
 * When a real database is added, the other services keep calling these
 * methods, and only this file is replaced with calls to a backend API.
 */
class StorageService {
    constructor() {
        // Prefix keeps our data separate from other websites/projects.
        this.keyPrefix = "dmcv2_";
    }

    // Load a list (array) such as "patients". Returns an empty array if nothing is saved yet.
    loadList(listName) {
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

    saveList(listName, list) {
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
}

const storageService = new StorageService();
