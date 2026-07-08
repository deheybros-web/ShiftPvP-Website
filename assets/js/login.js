document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document
            .getElementById("username")
            .value
            .trim();

        const password = document
            .getElementById("password")
            .value;

        const error = document.getElementById("loginError");
        error.textContent = "";

        try {

            const response = await fetch("data/admins.json");

            if (!response.ok)
                throw new Error("Cannot load admins.json");

            const data = await response.json();

            const admin = data.admins.find(a =>
                a.username === username &&
                a.password === password &&
                a.status === "Active"
            );

            if (admin) {

                sessionStorage.setItem(
                    "loggedInAdmin",
                    JSON.stringify(admin)
                );

                window.location.href = "admin.html";

            } else {

                error.textContent =
                    "Invalid username or password.";

            }

        } catch (err) {

            console.error(err);

            error.textContent =
                "Failed to load admin database.";

        }

    });

});
