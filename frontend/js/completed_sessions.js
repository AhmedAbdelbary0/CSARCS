const backendUrl = "http://localhost:3000";
        const token = localStorage.getItem("token");
        // Redirect to login if token is not found
        if (!token) {
            window.location.href = "index.html";
        }
        // Fetch and display completed sessions
        async function fetchCompletedSessions() {
            try {
                const response = await fetch(`${backendUrl}/api/tasks/faculty-completed-sessions`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                const container = document.getElementById("sessionsContainer");
                if (response.ok) {
                    const tasks = await response.json();
                    container.innerHTML = ""; // Clear existing content
                    if (tasks.length > 0) {
                        tasks.forEach((task) => {
                            let feedbackHtml = "";
                            if (Array.isArray(task.feedback) && task.feedback.length > 0) {
                                task.feedback.forEach((fb) => {
                                    feedbackHtml += `
                                        <p><strong>Reviewer:</strong> ${fb.reviewer || "Unknown"}</p>
                                        <p><strong>Rating:</strong> ${fb.rating || "Not Rated"}/5</p>
                                        <p><strong>Comments:</strong> ${fb.comments || "No comments provided"}</p>
                                        <hr>
                                    `;
                                });
                            } else {
                                feedbackHtml = "<p>No feedback available for this task.</p>";
                            }
                            const taskCard = `
                                <div class="session-card">
                                    <p><strong>Title:</strong> ${task.title}</p>
                                    <p><strong>Description:</strong> ${task.description || "No description provided"}</p>
                                    <p><strong>Created:</strong> ${new Date(task.time_created).toLocaleString()}</p>
                                    <p><strong>Updated:</strong> ${new Date(task.time_updated).toLocaleString()}</p>
                                    <p><strong>Junior:</strong> ${task.junior_name || "Unknown"}</p>
                                    <p><strong>Senior:</strong> ${task.senior_name || "Unknown"}</p>
                                    <h4>Feedback:</h4>
                                    <div>${feedbackHtml}</div>
                                    <button class="btn btn-success" onclick="approveTask(${task.id})">Approve Task</button>
                                    <button class="btn btn-danger" onclick="declineTask(${task.id})">Decline Task</button>
                                </div>
                            `;
                            container.innerHTML += taskCard;
                        });
                    } else {
                        container.innerHTML = "<p>No completed sessions found.</p>";
                    }
                } else {
                    const error = await response.json();
                    console.error("Failed to fetch completed sessions:", error);
                    container.innerHTML = "<p>Could not load completed sessions. Please try again later.</p>";
                }
            } catch (err) {
                console.error("Error fetching completed sessions:", err);
                document.getElementById("sessionsContainer").innerHTML =
                    "<p>Error connecting to the backend. Please try again later.</p>";
            }
        }
        async function approveTask(taskId) {
            const confirmApproval = confirm(`Are you sure you want to approve task ID: ${taskId}?`);
            if (!confirmApproval) return;
            try {
                const response = await fetch(`${backendUrl}/api/tasks/${taskId}/approve`, {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                if (response.ok) {
                    alert("Task approved successfully!");
                    fetchCompletedSessions(); // Refresh the list
                } else {
                    const error = await response.json();
                    alert(`Error approving task: ${error.message || "Unknown error"}`);
                }
            } catch (err) {
                console.error("Error approving task:", err);
                alert("Could not connect to the backend. Please try again later.");
            }
        }
        async function declineTask(taskId) {
            const declineReason = prompt(`Enter the reason for declining task ID: ${taskId}:`);
            if (declineReason === null || declineReason.trim() === "") {
                alert("A reason is required to decline the task.");
                return;
            }
            try {
                const response = await fetch(`${backendUrl}/api/tasks/${taskId}/decline`, {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ message: declineReason }),
                });
                if (response.ok) {
                    alert("Task declined successfully!");
                    fetchCompletedSessions(); // Refresh the list
                } else {
                    const error = await response.json();
                    alert(`Error declining task: ${error.message || "Unknown error"}`);
                }
            } catch (err) {
                console.error("Error declining task:", err);
                alert("Could not connect to the backend. Please try again later.");
            }
        }
        // Fetch sessions when the page loads
        window.onload = function() {
            fetchCompletedSessions();
        };
