CREATE TABLE Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('junior', 'senior', 'faculty'))
);

CREATE TABLE Tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'assigned', 'completed','approved')),
  request_id INTEGER NOT NULL REFERENCES Users(id),
  accept_id INTEGER REFERENCES Users(id),
  time_created DATETIME DEFAULT CURRENT_TIMESTAMP,
  time_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES Tasks(id),
  user_id INTEGER NOT NULL REFERENCES Users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments TEXT
);

CREATE TABLE Notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES Users(id),
  message TEXT NOT NULL,
  time_created DATETIME DEFAULT CURRENT_TIMESTAMP
);
