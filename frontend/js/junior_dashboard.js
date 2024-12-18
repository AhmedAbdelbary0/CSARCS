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

        const requestsContainer = document.querySelector(".requests ul");

        if (response.ok) {
            const requests = await response.json();
            requestsContainer.innerHTML = ""; // Clear existing requests

            if (requests.length > 0) {
                requests.forEach((request) => {
                    const requestItem = `
                        <li>
                            <strong>${request.title}</strong> - ${request.status} <br>
                            <small>Created: ${new Date(request.time_created).toLocaleString()}</small>
                            ${request.status === 'assigned' ? `
                                <button onclick="showSeniorDetails(${request.id})" class="details-button">Show Details</button>
                                <div id="senior-details-${request.id}" style="display: none; margin-top: 10px;"></div>
                                <button onclick="endSessionPrompt(${request.id})" class="details-button btn-danger">End Session</button>
                            ` : ''}
                        </li>
                    `;
                    requestsContainer.innerHTML += requestItem;
                });
            } else {
                requestsContainer.innerHTML = "<li>No active requests found.</li>";
            }
        } else {
            const error = await response.json();
            console.error("Error Fetching Requests:", error);
            requestsContainer.innerHTML = "<li>Could not load requests. Please try again later.</li>";
        }
    } catch (err) {
        console.error("Error Fetching Requests:", err);
        document.querySelector(".requests ul").innerHTML = "<li>Error connecting to the backend.</li>";
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



