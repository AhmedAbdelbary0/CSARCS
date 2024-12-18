const backendUrl = "http://localhost:3000"; // Update with your backend URL
        const token = localStorage.getItem("token"); // Get token from localStorage
    
        // Redirect to login if token is missing
        if (!token) {
            window.location.href = "index.html";
        }
    
        // Fetch user details and update the page
       async function fetchUserDetails() {
        const backendUrl = "http://localhost:3000";
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No token found. Redirecting to login.");
            window.location.href = "index.html";
            return;
        }

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
                document.getElementById("username").innerText = user.username;
                document.getElementById("userId").innerText = `ID: ${user.id}`;
            } else {
                const error = await response.json();
                console.error("Failed to fetch user details:", error);
                window.location.href = "index.html";
            }
        } catch (err) {
            console.error("Error fetching user details:", err);
            window.location.href = "index.html";
        }
        }

        document.getElementById("logoutButton").addEventListener("click", function () {
        
            localStorage.clear(); 
            sessionStorage.clear(); 
        
            
            window.location.href = "index.html";
        });
        

    
        // Fetch user details when the page loads
        fetchUserDetails();