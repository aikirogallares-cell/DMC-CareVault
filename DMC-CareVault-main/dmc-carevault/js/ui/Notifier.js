/*
 * Notifier.js
 * Purpose: small pop-up messages (toasts) in the top-right corner.
 * Types: "success" (green), "warning" (yellow), "error" (red).
 */
class Notifier {
    showMessage(messageText, messageType) {
        let container = document.getElementById("toasts");

        // Create the container the first time a message is shown.
        if (container === null) {
            container = document.createElement("div");
            container.id = "toasts";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = "toast";

        if (messageType === "error") {
            toast.className = "toast bad";
        } else if (messageType === "warning") {
            toast.className = "toast warning";
        }

        toast.textContent = messageText;
        container.appendChild(toast);

        // Remove the message after 3.5 seconds.
        setTimeout(function () {
            toast.remove();
        }, 3500);
    }

    showSuccess(messageText) {
        this.showMessage(messageText, "success");
    }

    showWarning(messageText) {
        this.showMessage(messageText, "warning");
    }

    showError(messageText) {
        this.showMessage(messageText, "error");
    }
}

const notifier = new Notifier();
