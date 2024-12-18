const backendUrl = "http://localhost:3000"; // Update with your backend URL

            document.getElementById("loginForm").addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevent page refresh

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                const response = await fetch(`${backendUrl}/api/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });

                if (response.ok) {
                    const data = await response.json();

                    // Log the response to debug
                    console.log("Login Response:", data);

                    // Check if the response contains token and role
                    if (data.token && data.role) {
                        // Save to localStorage
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("role", data.role);

                        // Redirect based on role
                        if (data.role === "junior") {
                            window.location.href = "junior_dashboard.html";
                        } else if (data.role === "senior") {
                            window.location.href = "senior_dashboard.html";
                        } else if (data.role === "faculty") {
                            window.location.href = "faculty_dashboard.html";
                        }
                    } else {
                        console.error("Invalid response format:", data);
                        alert("Login failed: Invalid server response.");
                    }
                } else {
                    const error = await response.json();
                    alert("Login failed: " + error.message);
                }
            } catch (err) {
                console.error("Error connecting to backend:", err);
                alert("Could not connect to the backend. Please try again later.");
            }
            });