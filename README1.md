# 📚 StudyBot Backend

StudyBot is a RESTful API backend powering a university student resource-sharing platform, enabling students and educators to sign up, authenticate securely, and collaboratively upload academic materials. Built with Node.js and Express, it uses a MySQL database with a connection pool architecture and enforces security best practices including bcrypt password hashing and parameterised SQL queries.

---

## 🛠️ Tech Stack

| Technology | Role |
|---|---|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Web framework for routing and middleware |
| **MySQL** (`mysql2/promise`) | Relational database with async/await connection pooling |
| **bcrypt** | Industry-standard one-way password hashing |
| **cors** | Cross-Origin Resource Sharing middleware |
| **nodemon** | Auto-restarts the server on file changes during development |

---

## ⚙️ Local Installation & Setup

Follow these steps precisely to get the development server running on your local machine.

### Prerequisites

Ensure the following are installed before you begin:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [XAMPP](https://www.apachefriends.org/) (or any local MySQL server)
- [Git](https://git-scm.com/)
- A REST client for testing, such as [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/)

---

### Step 1 — Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/your-username/StudyBot-backend.git
cd StudyBot-backend
```

---

### Step 2 — Install Dependencies

Inside the project root, install all required Node.js packages:

```bash
npm install
```

This will install `express`, `mysql2`, `bcrypt`, `cors`, `nodemon`, and all other dependencies listed in `package.json`.

---

### Step 3 — Set Up the MySQL Database

1. Start **Apache** and **MySQL** from your XAMPP Control Panel.
2. Open your browser and navigate to `http://localhost/phpmyadmin`.
3. Click **New** in the left sidebar and create a database named exactly:

```
studybot_db
```

4. Select the `studybot_db` database, open the **SQL** tab, and run the following schema to create the required tables:

```sql
-- Users table
CREATE TABLE users (
    id           VARCHAR(50)  PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role         VARCHAR(50)  DEFAULT 'student',
    institution  VARCHAR(150),
    major        VARCHAR(100),
    study_year   VARCHAR(20),
    points       INT          DEFAULT 0
);

-- Resources table
CREATE TABLE resources (
    id           VARCHAR(50)  PRIMARY KEY,
    title        VARCHAR(150) NOT NULL,
    category     VARCHAR(100),
    description  TEXT,
    is_public    BOOLEAN      DEFAULT TRUE,
    uploader_id  VARCHAR(50),
    FOREIGN KEY (uploader_id) REFERENCES users(id)
);
```

> **Note:** The database host is `localhost`, the user is `root`, and the password is left **empty** — this matches the default XAMPP configuration and is already set in `server.js`.

---

### Step 4 — Start the Development Server

Run the following command to start the server using `nodemon`. It will automatically restart whenever you save changes to any file:

```bash
npm run dev
```

If everything is configured correctly, your terminal will display:

```
✅ Successfully connected to the MySQL database!
Server is running on http://localhost:5000
```

The API is now live and ready to accept requests at `http://localhost:5000`.

---

## 📡 API Endpoints

All endpoints accept and return **JSON**. Set the `Content-Type: application/json` header on all requests with a body.

**Base URL (local):** `http://localhost:5000`

---

### Endpoint Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/status` | `GET` | Health check — confirms the server is running |
| `/api/signup` | `POST` | Registers a new user and awards 20 welcome points |
| `/api/login` | `POST` | Authenticates a user by verifying their bcrypt password hash |
| `/api/resources` | `POST` | Uploads a new resource and awards the uploader +2 points |

---

### `POST /api/signup`

Registers a new user account. The submitted password is salted and hashed using `bcrypt` before being stored — the plain-text password is **never** saved to the database. The new user is awarded **20 bonus points** on creation.

**Request Body:**

```json
{
  "name": "Rafi Ahmed",
  "email": "rafi@university.edu",
  "password": "mySecurePassword123",
  "role": "student",
  "institution": "BRAC University",
  "major": "Computer Science",
  "year": "3rd Year"
}
```

> `role`, `institution`, `major`, and `year` are optional fields. `role` defaults to `"student"` if omitted.

**Success Response — `201 Created`:**

```json
{
  "message": "User account created successfully!",
  "user": {
    "id": "user-1718123456789",
    "name": "Rafi Ahmed",
    "email": "rafi@university.edu",
    "role": "student",
    "points": 20
  }
}
```

**Error Responses:**

| Status Code | Cause |
|---|---|
| `400 Bad Request` | An account with the submitted email already exists |
| `500 Internal Server Error` | Unexpected server or database error |

---

### `POST /api/login`

Authenticates an existing user. `bcrypt.compare()` is used to verify the submitted plain-text password against the stored hash without ever decrypting it. Both "user not found" and "wrong password" cases return the same generic `401` response to prevent email enumeration attacks.

**Request Body:**

```json
{
  "email": "rafi@university.edu",
  "password": "mySecurePassword123"
}
```

**Success Response — `200 OK`:**

```json
{
  "message": "Login successful!",
  "user": {
    "id": "user-1718123456789",
    "name": "Rafi Ahmed",
    "email": "rafi@university.edu",
    "role": "student",
    "institution": "BRAC University",
    "major": "Computer Science",
    "year": "3rd Year",
    "points": 20
  }
}
```

**Error Responses:**

| Status Code | Cause |
|---|---|
| `400 Bad Request` | Email or password field is missing from the request body |
| `401 Unauthorized` | Email not found, or password does not match the stored hash |
| `500 Internal Server Error` | Unexpected server or database error |

---

### `POST /api/resources`

Uploads a new study resource and associates it with the authenticated uploader. Upon successful insertion, the uploader's points balance is incremented by **+2** using an atomic server-side SQL update.

**Request Body:**

```json
{
  "title": "Data Structures Cheat Sheet",
  "category": "Computer Science",
  "description": "A concise reference covering arrays, linked lists, trees, and graphs.",
  "isPublic": true,
  "uploaderId": "user-1718123456789"
}
```

**Success Response — `201 Created`:**

```json
{
  "message": "Resource uploaded successfully!",
  "resource": {
    "id": "res-1718123499001",
    "title": "Data Structures Cheat Sheet",
    "category": "Computer Science",
    "description": "A concise reference covering arrays, linked lists, trees, and graphs.",
    "isPublic": true,
    "uploaderId": "user-1718123456789"
  }
}
```

**Error Responses:**

| Status Code | Cause |
|---|---|
| `500 Internal Server Error` | Unexpected server or database error |

---

## 🔐 Security Notes

- **Password Hashing:** All passwords are hashed using `bcrypt` with a cost factor of `10` before database insertion. Plain-text passwords are never persisted or logged.
- **SQL Injection Prevention:** All database queries use `?` bound parameters via `mysql2`'s `db.execute()`. User-supplied values are always treated as data, never as executable SQL.
- **Sensitive Field Exclusion:** `password_hash` is never included in any API response payload.

---

## 📁 Project Structure

```
StudyBot-backend/
├── server.js        # Main entry point: Express setup, DB pool, and all API routes
├── package.json     # Project metadata and dependency definitions
└── README.md        # This file
```

---

## 👨‍💻 Author

Developed as a university full-stack engineering project.
