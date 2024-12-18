const backendUrl = "http://localhost:3000"; // Backend base URL
        const token = localStorage.getItem("token"); // Retrieve token from localStorage
    
        // Redirect to login if no token is found
        if (!token) {
            console.error("No token found. Redirecting to login.");
            window.location.href = "index.html";
        }
    
        // Fetch available tasks and render them
        async function fetchAvailableTasks() {
            try {
                const response = await fetch(`${backendUrl}/api/tasks/available`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
    
                if (response.ok) {
                    const tasks = await response.json();
                    const tasksContainer = document.getElementById("tasksContainer");
                    tasksContainer.innerHTML = ""; // Clear any placeholder text
    
                    if (tasks.length > 0) {
                        tasks.forEach(task => {
                            const taskItem = `
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <h5 class="card-title">${task.title}</h5>
                                        <p class="card-text">${task.description}</p>
                                        <p class="text-muted">Posted on: ${new Date(task.time_created).toLocaleString()}</p>
                                        <button class="btn btn-primary" onclick="acceptTask(${task.id})">Accept Task</button>
                                    </div>
                                </div>
                            `;
                            tasksContainer.innerHTML += taskItem;
                        });
                    } else {
                        tasksContainer.innerHTML = `<p>No available requests at the moment.</p>`;
                    }
                } else {
                    console.error("Failed to fetch tasks.");
                    alert("Could not fetch tasks. Please try again later.");
                }
            } catch (err) {
                console.error("Error fetching tasks:", err);
                alert("Could not connect to the backend. Please try again later.");
            }
        }
    
        // Accept task function
        async function acceptTask(taskId) {
            const backendUrl = "http://localhost:3000"; // Backend base URL
            const token = localStorage.getItem("token"); // Retrieve token from localStorage

            try {
                const response = await fetch(`${backendUrl}/api/tasks/${taskId}/status`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status: "assigned" }), // Correct status
                });

                if (response.ok) {
                    alert("Task assigned successfully!");
                    fetchAvailableTasks(); // Refresh the list after acceptance
                } else {
                    const error = await response.json();
                    console.error("Failed to accept task:", error);
                    alert(`Could not accept task: ${error.errors[0]?.msg || "Unknown error"}`);
                }
            } catch (err) {
                console.error("Error accepting task:", err);
                alert("Could not connect to the backend. Please try again later.");
            }
        }


    
        // Fetch tasks on page load
        window.onload = fetchAvailableTasks;