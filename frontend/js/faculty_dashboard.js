const backendUrl = "http://localhost:3000"; // Replace with your backend URL
        const token = localStorage.getItem("token");

        // Redirect to login if token is not found
        if (!token) {
            window.location.href = "index.html";
        }

        // Fetch user details from the backend
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
                    // Update the profile card with user details
                    document.getElementById("username").innerText = user.username;
                    document.getElementById("userId").innerText = `ID: ${user.id}`;
                    document.getElementById("userEmail").innerText = `Email: ${user.email}`;
                } else {
                    const error = await response.json();
                    console.error("Failed to fetch user details:", error);
                    alert("Session expired. Please log in again.");
                    window.location.href = "index.html";
                }
            } catch (err) {
                console.error("Error fetching user details:", err);
                alert("Could not connect to the backend. Please try again later.");
                window.location.href = "index.html";
            }
        }

        // Logout functionality
        document.getElementById("logoutButton").addEventListener("click", function () {
            // Clear the token and redirect to login
            localStorage.removeItem("token");
            alert("You have been logged out.");
            window.location.href = "index.html";
        });


        
        
        

        // Call fetchUserDetails when the page loads
        window.onload = fetchUserDetails;