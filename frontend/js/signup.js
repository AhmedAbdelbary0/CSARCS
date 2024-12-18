const backendUrl = "http://localhost:3000"; // Backend base URL

        document.getElementById("signupForm").addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevent page refresh

            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const role = document.getElementById("role").value;

            try {
                const response = await fetch(`${backendUrl}/api/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username, email, password, role }),
                });

                if (response.ok) {
                    alert("Registration successful! Redirecting to login page.");
                    window.location.href = "index.html";
                } else {
                    const error = await response.json();
                    alert("Registration failed: " + error.message);
                }
            } catch (err) {
                console.error("Error connecting to backend:", err);
                alert("Could not connect to the backend. Please try again later.");
            }
        });