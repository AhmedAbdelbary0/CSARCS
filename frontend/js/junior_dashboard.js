    const backendUrl = "http://localhost:3000"; // Update with your backend URL
        const token = localStorage.getItem("token"); // Retrieve token from localStorage

        // Redirect to login if no token is found
        if (!token) {
            console.error("No token found. Redirecting to login.");
            window.location.href = "index.html";
        }

        // Fetch and display user details
        async function fetchUserDetails() {
            try {
                const response = await fetch(`${backendUrl}/api/auth/me`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const user = await response.json();
                    console.log("User Details:", user);

                    // Update the profile card with user details
                    document.querySelector(".profile-card p:nth-child(2)").innerHTML = `<strong>Name:</strong> ${user.username}`;
                    document.querySelector(".profile-card p:nth-child(3)").innerHTML = `<strong>ID:</strong> ${user.id}`;
                } else {
                    console.error("Failed to fetch user details.");
                    alert("Session expired. Please log in again.");
                    window.location.href = "index.html";
                }
            } catch (err) {
                console.error("Error fetching user details:", err);
                alert("Could not connect to the backend. Please try again later.");
                window.location.href = "index.html";
            }
        }

        // Fetch and display user's active requests
        async function fetchUserRequests() {
            try {
                const response = await fetch(`${backendUrl}/api/tasks/my-requests`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
        
                const requestsContainer = document.querySelector(".requests");
        
                if (response.ok) {
                    const requests = await response.json();
                    requestsContainer.innerHTML = ""; // Clear existing requests
        
                    if (requests.length > 0) {
                        requests.forEach((request) => {
                            // Create card container
                            const card = document.createElement("div");
                            card.className = "request-card";
                            card.style.cssText = `
                                border: 1px solid #ccc;
                                border-radius: 8px;
                                background-color: #fff;
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                padding: 15px;
                                margin-bottom: 15px;
                                transition: transform 0.2s ease, box-shadow 0.3s ease;
                            `;
        
                            // Add hover effect
                            card.onmouseover = () => card.style.transform = "scale(1.02)";
                            card.onmouseout = () => card.style.transform = "scale(1)";
        
                            // Card content
                            card.innerHTML = `
                                <h5 style="margin: 0; color: #007bff;">${request.title}</h5>
                                <p style="margin: 10px 0; color: #555;"><strong>Status:</strong> ${request.status}</p>
                                <p style="margin: 0; font-size: 14px; color: #666;">
                                    <strong>Created:</strong> ${new Date(request.time_created).toLocaleString()}
                                </p>
                                ${request.status === 'assigned' ? `
                                    <button onclick="showSeniorDetails(${request.id})" class="details-button" style="
                                        margin-top: 10px; background-color: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                                        Show Details
                                    </button>
                                    <button onclick="endSessionPrompt(${request.id})" class="details-button" style="
                                        margin-top: 10px; margin-left: 5px; background-color: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                                        End Session
                                    </button>
                                    <div id="senior-details-${request.id}" style="display: none; margin-top: 10px;"></div>
                                ` : ''}
                            `;
        
                            // Append card to the requests container
                            requestsContainer.appendChild(card);
                        });
                    } else {
                        // Display no requests message
                        requestsContainer.innerHTML = `
                            <div style="text-align: center; color: #777;">
                                <p>No active requests found.</p>
                            </div>
                        `;
                    }
                } else {
                    const error = await response.json();
                    console.error("Error Fetching Requests:", error);
                    requestsContainer.innerHTML = `
                        <div style="color: #dc3545;">
                            <p>Could not load requests. Please try again later.</p>
                        </div>
                    `;
                }
            } catch (err) {
                console.error("Error Fetching Requests:", err);
                requestsContainer.innerHTML = `
                    <div style="color: #dc3545;">
                        <p>Error connecting to the backend.</p>
                    </div>
                `;
            }
        }
        


        async function showSeniorDetails(taskId) {
            const detailsDiv = document.getElementById(`senior-details-${taskId}`);
            if (detailsDiv.style.display === 'block') {
                detailsDiv.style.display = 'none'; // Hide details if already visible
                return;
            }

            try {
                const response = await fetch(`${backendUrl}/api/tasks/${taskId}/senior-details`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const senior = await response.json();
                    detailsDiv.innerHTML = `
                        <strong>Senior Details:</strong><br>
                        Name: ${senior.username}<br>
                        ID: ${senior.id}<br>
                        Email: ${senior.email}
                    `;
                    detailsDiv.style.display = 'block';
                } else {
                    const error = await response.json();
                    console.error("Error fetching senior details:", error);
                    alert("Could not fetch senior details. Please try again later.");
                }
            } catch (err) {
                console.error("Error fetching senior details:", err);
                alert("Could not connect to the backend. Please try again later.");
            }
        }

        async function endSessionPrompt(taskId) {
            const feedback = prompt("Please provide your feedback for this session:");

            if (feedback === null || feedback.trim() === "") {
                alert("Feedback is required to end the session.");
                return;
            }

            const rating = prompt("Please provide a rating for this session (1-5):");

            if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
                alert("Please provide a valid rating between 1 and 5.");
                return;
            }

            try {
                const response = await fetch(`${backendUrl}/api/tasks/${taskId}/end-session`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        feedback,
                        rating: parseInt(rating, 10),
                    }),
                });

                if (response.ok) {
                    alert("Session ended successfully!");
                    fetchUserRequests(); // Refresh the list of active requests
                } else {
                    const error = await response.json();
                    console.error("Error ending session:", error);
                    alert(`Could not end session: ${error.message || "Unknown error"}`);
                }
            } catch (err) {
                console.error("Error ending session:", err);
                alert("Could not connect to the backend. Please try again later.");
            }
        }




         // Execute functions on page load
         window.onload = () => {
            fetchUserDetails();
            fetchUserRequests();

            // Attach the logout event listener after the DOM is fully loaded
            const logoutButton = document.getElementById("logoutButton");
            if (logoutButton) {
                logoutButton.addEventListener("click", function () {
                    const confirmLogout = confirm("Are you sure you want to log out?");
                    if (confirmLogout) {
                        localStorage.clear(); 
                        sessionStorage.clear(); 
                        alert("You have successfully logged out.");
                        window.location.href = "index.html"; // Redirect to login page
                    }
                });
            }
        };


        
    