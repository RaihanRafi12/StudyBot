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
        // Notice we are grabbing 'year' instead of 'study_year' to match React
        const { name, email, password, role, institution, major, year } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userId = 'user-' + Date.now();
        const initialPoints = 20;

        // We use || null to ensure empty fields don't crash MySQL
        const [result] = await db.execute(
            `INSERT INTO users (id, name, email, password_hash, role, institution, major, study_year, points) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, 
                name, 
                email, 
                hashedPassword, 
                role || 'student', 
                institution || null, 
                major || null, 
                year || null, 
                initialPoints
            ]
        );

        res.status(201).json({ 
            message: "User account created successfully!",
            user: { id: userId, name, email, role, points: initialPoints }
        });

    } catch (error) {
        console.error("Signup Error:", error);
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

        if (!email || !password) {
            return res.status(400).json({ message: "Please enter both email and password." });
        }

        // MySQL returns an array of rows
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 🚨 THE FIX: Grab the first object out of the array
        const user = rows; 

        // SAFETY CHECK
        const savedPassword = user.password_hash || user.password;

        if (!savedPassword) {
            return res.status(500).json({ message: "Server error: Password column missing in database." });
        }

        // Compare the passwords safely
        const isMatch = await bcrypt.compare(password, savedPassword);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Prepare the user data to send back to React
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            institution: user.institution,
            major: user.major,
            year: user.study_year,
            points: user.points
        };

        res.status(200).json({
            message: "Login successful!",
            user: userResponse
        });

    } catch (error) {
        console.error("LOGIN FAILED:", error);
        res.status(500).json({ message: "Server error during login" });
    }
});

// 4. Upload Resource Route
app.post('/api/resources', async (req, res) => {
    try {
        const { title, category, description, isPublic, uploaderId } = req.body;
        
        // Generate a unique ID for the resource
        const resourceId = 'res-' + Date.now();

        // 1. Insert the new resource into the database
        await db.execute(
            `INSERT INTO resources (id, title, category, description, is_public, uploader_id) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [resourceId, title, category, description, isPublic, uploaderId]
        );

        // 2. Award the user +2 points for uploading
        await db.execute(
            `UPDATE users SET points = points + 2 WHERE id = ?`,
            [uploaderId]
        );

        res.status(201).json({ 
            message: "Resource uploaded successfully!", 
            resource: {
                id: resourceId,
                title,
                category,
                description,
                isPublic,
                uploaderId
            }
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Server error during upload" });
    }
});
// --- Start Server ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});