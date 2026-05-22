const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt'); // Added for password hashing

const app = express();

app.use(cors());
app.use(express.json());

// --- Database Connection ---
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Keep this empty for XAMPP
    database: 'studybot_db'
});

db.getConnection()
    .then(() => console.log("✅ Successfully connected to the MySQL database!"))
    .catch((err) => console.error("❌ Database connection failed:", err.message));

// --- API Routes ---

// 1. Test Route
app.get('/api/status', (req, res) => {
    res.json({ message: "StudyBot Backend is running!" });
});

// 2. User Signup Route
app.post('/api/signup', async (req, res) => {
    try {
        // Extract the data sent from your React frontend
        const { name, email, password, role, institution, major, study_year } = req.body;

        // Scramble the password before saving it to the database (Security!)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a unique ID for the user
        const userId = 'user-' + Date.now();
        
        // Give new users 20 bonus points (matching your React logic!)
        const initialPoints = 20;

        // Insert the new user into the MySQL database
        const [result] = await db.execute(
            `INSERT INTO users (id, name, email, password_hash, role, institution, major, study_year, points) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, name, email, hashedPassword, role || 'student', institution, major, study_year, initialPoints]
        );

        // Send a success response back to React
        res.status(201).json({ 
            message: "User account created successfully!",
            user: { id: userId, name, email, role, points: initialPoints }
        });

    } catch (error) {
        console.error("Signup Error:", error);
        // If the email already exists, MySQL throws an error code ER_DUP_ENTRY
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "An account with this email already exists." });
        }
        res.status(500).json({ message: "Server error during signup" });
    }
});

// 3. User Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Step A: Find the user in the database by their email
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        // If the array is empty, the email doesn't exist
        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = users; // Grab the first (and only) matched user

        // Step B: Compare the typed password with the scrambled hash in the database
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Step C: Remove the password hash from the object before sending it to the frontend (Security!)
        delete user.password_hash;

        // Send the success response and the user's profile data
        res.status(200).json({
            message: "Login successful!",
            user: user
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
});
// --- Start Server ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});