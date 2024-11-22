                                        CS ARCS API Documentation
                                        Base URL: http://localhost:3000/api
Authentication
Login
Endpoint: /auth/login
Method: POST
Description: Logs in a user and returns a JWT token.
Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}
Response:
Success:
{
  "message": "Login successful",
  "token": "jwt_token"
}
Failure:
{
  "error": "Invalid email or password"
}
Register
Endpoint: /auth/register
Method: POST
Description: Registers a new user.
Request Body:
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "securepassword",
  "role": "junior"
}
Response:
Success:
{
  "message": "User created successfully",
  "id": 1
}
Failure:
{
  "error": "Error creating user",
  "details": "Specific error message"
}
Users
Get All Users
Endpoint: /users
Method: GET
Authentication: Required (Bearer Token)
Role: Admin-only (requires roleMiddleware(['admin'])).
Query Parameters:
None.
Response:
Success:

[
  {
    "id": 1,
    "username": "johndoe",
    "email": "johndoe@example.com",
    "role": "junior"
  },
  {
    "id": 2,
    "username": "janedoe",
    "email": "janedoe@example.com",
    "role": "senior"
  }
]
Tasks
Get All Tasks
Endpoint: /tasks
Method: GET
Authentication: Required (Bearer Token)
Role: Senior students only (requires roleMiddleware(['senior'])).
Response:
Success:
[
  {
    "id": 1,
    "title": "Help with Java",
    "description": "I need help with Java basics",
    "status": "open",
    "request_id": 1,
    "accept_id": null,
    "time_created": "2024-11-20T08:00:00.000Z"
  }
]
Create Task
Endpoint: /tasks
Method: POST
Authentication: Required (Bearer Token)
Role: Junior students only (requires roleMiddleware(['junior'])).
Request Body:
{
  "title": "New Task",
  "description": "Task details",
  "status": "open",
  "request_id": 1
}
Response:
Success:
{
  "message": "Task created successfully",
  "id": 1
}
Update Task Status
Endpoint: /tasks/:id/status
Method: PUT
Authentication: Required (Bearer Token)
Role: Senior or Faculty.
Request Body:
{
  "status": "completed"
}
Response:
Success:
{
  "message": "Task status updated successfully"
}
Failure:
{
  "error": "Error updating task status"
}
Notifications
Get All Notifications
Endpoint: /notifications
Method: GET
Authentication: Required (Bearer Token)
Description: Fetches all notifications for the logged-in user.
Response:
Success:
[
  {
    "id": 1,
    "user_id": 1,
    "message": "You have a new task assigned",
    "time_created": "2024-11-20T10:00:00.000Z"
  }
]
Feedback
Fetch Feedback by Task ID
Endpoint: /feedback/task/:task_id
Method: GET
Authentication: Required (Bearer Token)
Role: Faculty (requires roleMiddleware(['faculty'])).
Response:
Success:
[
  {
    "id": 1,
    "task_id": 1,
    "user_id": 1,
    "rating": 5,
    "comments": "Great work!",
    "time_created": "2024-11-20T10:00:00.000Z"
  }
]
Fetch Feedback by User ID
Endpoint: /feedback/user/:user_id
Method: GET
Authentication: Required (Bearer Token)
Role: Faculty.
Response:
Success:
[
  {
    "id": 1,
    "task_id": 1,
    "user_id": 2,
    "rating": 4,
    "comments": "Good effort.",
    "time_created": "2024-11-20T09:00:00.000Z"
  }
]
