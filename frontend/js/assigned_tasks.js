const backendUrl = "http://localhost:3000";
        const token = localStorage.getItem("token");

        // Redirect to login if token is not found
        if (!token) {
            window.location.href = "index.html";
        }

        // Fetch and display assigned tasks
        async function fetchAssignedTasks() {
            try {
                const response = await fetch(`${backendUrl}/api/tasks/assigned-tasks`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const container = document.getElementById("tasksContainer");

                if (response.ok) {
                    const tasks = await response.json();
                    container.innerHTML = ""; // Clear existing content

                    if (tasks.length > 0) {
                        tasks.forEach((task) => {
                            const taskCard = `
                                <div class="task-card">
                                    <p><strong>Task Title:</strong> ${task.title}</p>
                                    <p><strong>Description:</strong> ${task.description || "No description provided"}</p>
                                    <p><strong>Junior Student:</strong> ${task.junior_name || "Unknown"}</p>
                                    <p><strong>Mentor (Senior):</strong> ${task.senior_name || "Unknown"}</p>
                                    <p><strong>Created:</strong> ${new Date(task.time_created).toLocaleString()}</p>
                                    <p><strong>Updated:</strong> ${new Date(task.time_updated).toLocaleString()}</p>
                                </div>
                            `;
                            container.innerHTML += taskCard;
                        });
                    } else {
                        container.innerHTML = "<p>No assigned tasks found.</p>";
                    }
                } else {
                    const error = await response.json();
                    console.error("Failed to fetch assigned tasks:", error);
                    container.innerHTML = "<p>Could not load assigned tasks. Please try again later.</p>";
                }
            } catch (err) {
                console.error("Error fetching assigned tasks:", err);
                document.getElementById("tasksContainer").innerHTML =
                    "<p>Error connecting to the backend. Please try again later.</p>";
            }
        }

        // Fetch tasks when the page loads
        window.onload = fetchAssignedTasks;