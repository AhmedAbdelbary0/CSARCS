async function handleFormSubmission(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const backendUrl = "http://localhost:3000";
    const token = localStorage.getItem("token"); // Retrieve token from localStorage

    // Redirect to login if token is missing
    if (!token) {
        alert("You are not logged in. Redirecting to login.");
        window.location.href = "index.html";
        return;
    }

    // Gather form data
    const title = document.getElementById("title").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const details = document.getElementById("details").value.trim();

    // Build the request payload
    const payload = {
        title: title,
        description: `${subject}: ${details}`, // Combine subject and details
        status: "open", // Default status for new tasks
    };

    try {
        // Send the request to the backend
        const response = await fetch(`${backendUrl}/api/tasks`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            // Redirect to dashboard with confirmation
            alert("Request submitted successfully!");
            window.location.href = "junior_dashboard.html?confirmation=true";
        } else {
            const error = await response.json();
            alert(`Failed to submit the request: ${error.message || "Unknown error"}`);
        }
    } catch (err) {
        console.error("Error submitting the request:", err);
        alert("Could not connect to the backend. Please try again later.");
    }
}

// Function to navigate back to the dashboard
function navigateToDashboard() {
    window.location.href = "junior_dashboard.html"; // Replace 'dashboard.html' with your dashboard page URL
}
