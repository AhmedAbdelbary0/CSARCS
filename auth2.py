import re
import json

USER_DB_FILE = "users_db.json"

def load_users_db():
    try:
        with open(USER_DB_FILE, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return {}

def save_users_db(users_db):
    with open(USER_DB_FILE, "w") as file:
        json.dump(users_db, file, indent=4)

users_db = load_users_db()

def validate_email(email):
    # Email regex pattern
    email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(email_pattern, email) is not None

def validate_password(password):
    if len(password) < 8:
        print("Password must be at least 8 characters long.")
        return False
    if not re.search(r"\d", password):
        print("Password must contain at least 1 digit.")
        return False
    if not re.search(r"[a-z]", password):
        print("Password must contain at least 1 lowercase letter.")
        return False
    if not re.search(r"[A-Z]", password):
        print("Password must contain at least 1 uppercase letter.")
        return False
    if not re.search(r"\W", password):
        print("Password must contain at least 1 non-alphanumeric character.")
        return False
    return True

def get_input(prompt, validation_func=None):
    # Keeps asking for input until the validation function returns True
    while True:
        user_input = input(prompt).strip()
        if user_input and (not validation_func or validation_func(user_input)):
            return user_input
        print("Invalid input. Please try again.")

def sign_up(username, password, email):
    # Loop to re-prompt for a new username if it’s already taken
    while username in users_db:
        print("Username already taken. Please choose a different one.")
        username = get_input("Enter your username: ")
    
    users_db[username] = {
        "password": password,
        "email": email,
    }
    save_users_db(users_db)
    return "Sign up successful!"

def login(username, password):
    while username not in users_db:
        print("Username not found. Please sign up first.")
        username = get_input("Enter your username: ") 

    while users_db[username]["password"] != password:
        print("Incorrect password. Please try again.")
        password = get_input("Enter your password: ")  

    return "Login successful!"


def main():
    action = input("Do you want to sign up or login? (signup/login): ").strip().lower()
    
    while action not in ["signup", "login"]:
        print("Invalid action. Please choose either 'signup' or 'login'.")
        action = input("Do you want to sign up or login? (signup/login): ").strip().lower()

    if action == "signup":
        username = get_input("Enter your username: ")
        password = get_input("Enter your password: ", validate_password)
        email = get_input("Enter your email: ", validate_email)
        
        print(sign_up(username, password, email))
        
        login_action = input("Do you want to log in now? (yes/no): ").strip().lower()
        
        if login_action == "yes":
            username = get_input("Enter your username: ")
            password = get_input("Enter your password: ")
            print(login(username, password))

    elif action == "login":
        while True:
            username = get_input("Enter your username: ")
            password = get_input("Enter your password: ")
            result = login(username, password)
            print(result)
            if result == "Login successful!":
                break

main()

