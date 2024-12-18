const backendUrl = "http://localhost:3000"; // Backend base URL
        const token = localStorage.getItem("token"); // Retrieve token from localStorage

        // Redirect to login if no token is found
        if (!token) {
            console.error("No token found. Redirecting to login.");
            window.location.href = "index.html";
        }

        async function fetchActiveSessions() {
            try {
                const response = await fetch(`${backendUrl}/api/tasks/active-sessions`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const container = document.getElementById("activeSessionsContainer");

                if (response.ok) {
                    const tasks = await response.json();
                    container.innerHTML = ""; // Clear loading message

                    if (tasks.length > 0) {
                        tasks.forEach((task) => {
                            const taskCard = `
                                <div class="task-card">
                                    <h5>${task.title}</h5>
                                    <p>${task.description}</p>
                                    <p><strong>Created:</strong> ${new Date(task.time_created).toLocaleString()}</p>
                                    <p><strong>Updated:</strong> ${new Date(task.time_updated).toLocaleString()}</p>
                                    <button class="btn btn-danger" onclick="endSession(${task.id})">End Session</button>
                                </div>
                            `;
                            container.innerHTML += taskCard;
                        });
                    } else {
                        container.innerHTML = "<p>No active sessions at the moment.</p>";
                    }
                } else {
                    console.error("Failed to fetch active sessions.");
                    container.innerHTML = "<p>Could not load active sessions. Please try again later.</p>";
                }
            } catch (err) {
                console.error("Error fetching active sessions:", err);
                document.getElementById("activeSessionsContainer").innerHTML =
                    "<p>Error connecting to the backend. Please try again later.</p>";
            }
        }
        
        async function endSession(taskId) {
            const backendUrl = "http://localhost:3000"; // Backend base URL
            const token = localStorage.getItem("token"); // Retrieve token from localStorage

            try {
                const response = await fetch(`${backendUrl}/api/tasks/${taskId}/status`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status: "completed" }), // Mark task as completed
                });

                if (response.ok) {
                    alert("Session ended successfully!");
                    fetchActiveSessions(); // Refresh the list of active sessions
                } else {
                    const error = await response.json();
                    console.error("Failed to end session:", error);
                    alert(`Could not end session: ${error.message || "Unknown error"}`);
                }
            } catch (err) {
                console.error("Error ending session:", err);
                alert("Could not connect to the backend. Please try again later.");
            }
        }


        // Fetch active sessions on page load
        window.onload = fetchActiveSessions;