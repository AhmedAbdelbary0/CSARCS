const backendUrl = "http://localhost:3000"; // Backend base URL
        const token = localStorage.getItem("token"); // Retrieve token from localStorage

        // Redirect to login if no token is found
        if (!token) {
            console.error("No token found. Redirecting to login.");
            window.location.href = "index.html";
        }

        async function fetchCompletedSessions() {
            const container = document.getElementById("sessionsContainer");

            if (!container) {
                console.error("Container 'sessionsContainer' not found in the DOM.");
                return; // Exit if container is missing
            }

            try {
                const response = await fetch(`${backendUrl}/api/tasks/completed-sessions`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const tasks = await response.json();
                    container.innerHTML = ""; // Clear existing content

                    if (tasks.length > 0) {
                        tasks.forEach((task) => {
                            let feedbackHtml = "";

                            // Check and render feedback
                            if (Array.isArray(task.feedback) && task.feedback.length > 0) {
                                task.feedback.forEach((fb) => {
                                    feedbackHtml += `
                                        <div style="margin-bottom: 10px;">
                                            <p><strong>Reviewer:</strong> ${fb.reviewer || "Unknown"}</p>
                                            <p><strong>Rating:</strong> ${fb.rating || "Not Rated"}/5</p>
                                            <p><strong>Comments:</strong> ${fb.comments || "No comments provided"}</p>
                                        </div>
                                        <hr>
                                    `;
                                });
                            } else {
                                feedbackHtml = "<p>No feedback available for this task.</p>";
                            }

                            // Render the task based on its status
                            let taskCard = `
                                <div class="task-card">
                                    <p><strong>Title:</strong> ${task.title}</p>
                                    <p><strong>Description:</strong> ${task.description || "No description provided"}</p>
                                    <p><strong>Created:</strong> ${new Date(task.time_created).toLocaleString()}</p>
                                    <p><strong>Updated:</strong> ${new Date(task.time_updated).toLocaleString()}</p>
                            `;

                            // Status-specific rendering
                            if (task.status === 'approved') {
                                taskCard += `<p><strong>Status:</strong> Approved ✅</p>`;
                            } else if (task.status === 'declined') {
                                taskCard += `
                                    <p><strong>Status:</strong> Declined ❌</p>
                                    <p><strong>Reason:</strong> ${task.decline_message || "No reason provided"}</p>
                                `;
                            } else {
                                taskCard += `<p><strong>Status:</strong> Completed</p>`;
                            }

                            // Add feedback section
                            taskCard += `
                                <h4>Feedback:</h4>
                                <div>${feedbackHtml}</div>
                            </div>`;

                            // Append to container
                            container.innerHTML += taskCard;
                        });
                    } else {
                        container.innerHTML = "<p>No sessions found.</p>";
                    }
                } else {
                    const error = await response.json();
                    console.error("Failed to fetch sessions:", error);
                    container.innerHTML = "<p>Could not load sessions. Please try again later.</p>";
                }
            } catch (err) {
                console.error("Error fetching sessions:", err);
                container.innerHTML = "<p>Error connecting to the backend. Please try again later.</p>";
            }
        }



        // Fetch completed sessions on page load
        window.onload = fetchCompletedSessions;