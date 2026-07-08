// ===========================================
// ShiftPvP Admin Authentication
// ===========================================

const STORAGE_KEY = "loggedInAdmin";

// Check if admin is logged in
const session = sessionStorage.getItem(STORAGE_KEY);

if (!session) {
    window.location.href = "login.html";
} else {

    try {

        const admin = JSON.parse(session);

        // Show admin name
        const adminName = document.getElementById("adminName");

        if (adminName) {
            adminName.textContent =
                `Welcome, ${admin.displayName || admin.username}`;
        }

        // Logout button
        const logoutBtn = document.getElementById("logoutBtn");

        if (logoutBtn) {

            logoutBtn.addEventListener("click", function (e) {

                e.preventDefault();

                sessionStorage.removeItem(STORAGE_KEY);

                window.location.href = "login.html";

            });

        }

    } catch (error) {

        console.error("Invalid admin session:", error);

        sessionStorage.removeItem(STORAGE_KEY);

        window.location.href = "login.html";

    }

}
