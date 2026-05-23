/**
 * =============================================================================
 * server.js — StudyBot Application Backend
 * =============================================================================
 * This is the main entry point for the StudyBot Express server. It is
 * responsible for:
 *   1. Bootstrapping the Express application and applying global middleware.
 *   2. Establishing a pooled connection to the MySQL database via mysql2.
 *   3. Exposing RESTful API routes for user authentication (signup/login)
 *      and resource management (upload).
 *
 * Dependencies:
 *   - express    : Web framework for routing and middleware
 *   - cors       : Cross-Origin Resource Sharing middleware
 *   - mysql2     : Promise-based MySQL client with connection pooling
 *   - bcrypt     : Industry-standard library for password hashing
 * =============================================================================
 */

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt'); // Added for password hashing

// --- App Initialisation ---
// Create the core Express application instance. All middleware and routes
// will be registered on this object before the server begins listening.
const app = express();

// --- Global Middleware ---

/**
 * cors()
 * Enables Cross-Origin Resource Sharing for ALL incoming requests.
 * Without this, a browser would block our React frontend (e.g. running on
 * localhost:3000) from calling this API (running on localhost:5000), because
 * they have different port origins — a violation of the browser's Same-Origin
 * Policy. Applying cors() here as global middleware permits these cross-origin
 * requests by adding the appropriate "Access-Control-Allow-Origin" headers to
 * every response automatically.
 */
app.use(cors());

/**
 * express.json()
 * Parses incoming HTTP requests whose Content-Type is "application/json".
 * When a client (e.g. our React frontend) sends a POST request with a JSON
 * body, this middleware deserialises the raw JSON string and attaches the
 * resulting JavaScript object to req.body, making it accessible inside our
 * route handlers. Without this, req.body would be undefined.
 */
app.use(express.json());

// =============================================================================
// Database Connection
// =============================================================================

/**
 * mysql.createPool()
 * Instead of creating a single database connection, we create a CONNECTION
 * POOL — a cache of multiple reusable connections managed automatically by
 * the mysql2 library.
 *
 * Why a pool?
 *   - Opening a new TCP connection to MySQL on every request is expensive.
 *   - A pool keeps a set of connections alive and re-uses them across requests,
 *     dramatically improving performance under concurrent load.
 *   - If all pooled connections are in use, new requests queue automatically
 *     until one becomes free.
 *
 * Configuration options:
 *   - host     : The machine where MySQL is running (localhost = same machine).
 *   - user     : The MySQL user account to authenticate as.
 *   - password : Left empty because XAMPP's default root user has no password.
 *   - database : The specific schema/database to use for all queries.
 */
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Keep this empty for XAMPP
    database: 'studybot_db'
});

// Eagerly verify the pool can reach the database at startup. getConnection()
// borrows one connection from the pool to test connectivity, then releases it.
// If this fails (wrong credentials, MySQL not running, etc.), the error is
// logged immediately so the issue is visible before any request is served.
db.getConnection()
    .then(() => console.log("✅ Successfully connected to the MySQL database!"))
    .catch((err) => console.error("❌ Database connection failed:", err.message));


// =============================================================================
// API Routes
// =============================================================================

// -----------------------------------------------------------------------------
// 1. Health-Check / Status Route
// -----------------------------------------------------------------------------
// A simple GET endpoint used to confirm the server is online and reachable.
// Useful for uptime checks, deployment pipelines, or basic debugging.
app.get('/api/status', (req, res) => {
    res.json({ message: "StudyBot Backend is running!" });
});


// -----------------------------------------------------------------------------
// 2. User Signup Route  —  POST /api/signup
// -----------------------------------------------------------------------------
/**
 * Handles new user registration. The full flow is:
 *   1. Extract user fields from the parsed JSON request body (req.body).
 *   2. Hash the plain-text password with bcrypt before storing it.
 *   3. Generate a unique user ID using a timestamp suffix.
 *   4. Insert the new user record into the `users` table.
 *   5. Return the newly created (non-sensitive) user data to the client.
 *
 * Security: Passwords are NEVER stored as plain text. bcrypt is used to
 * produce a one-way hash that is computationally infeasible to reverse.
 */
app.post('/api/signup', async (req, res) => {
    try {
        // Destructure the expected fields from the request body.
        // NOTE: We read 'year' here (not 'study_year') to match the field
        // name sent by the React frontend form.
        const { name, email, password, role, institution, major, year } = req.body;

        // --- bcrypt: Salt Generation ---
        // A "salt" is a random string that is mixed into the password before
        // hashing. This ensures that two users with the same password will
        // produce completely different hashes, defeating rainbow-table attacks.
        // The argument (10) is the "cost factor" — it controls how many rounds
        // of processing bcrypt applies. 10 is the industry-standard default,
        // balancing security and server performance.
        const salt = await bcrypt.genSalt(10);

        // --- bcrypt: Password Hashing ---
        // bcrypt.hash() combines the plain-text password with the generated
        // salt and runs the one-way hashing algorithm. The resulting string
        // (e.g. "$2b$10$...") encodes the algorithm version, cost factor,
        // salt, and final hash together — everything needed to verify the
        // password later is stored in this single string.
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a simple unique ID by prefixing a Unix timestamp in
        // milliseconds. In a production system, a UUID library would be used.
        const userId = 'user-' + Date.now();

        // Award every new user a small welcome bonus of points upon signup.
        const initialPoints = 20;

        // --- Parameterised Query (SQL Injection Prevention) ---
        // The '?' placeholders are BOUND PARAMETERS. The mysql2 driver sends
        // the SQL template and the values array separately to the MySQL server.
        // MySQL treats each '?' value strictly as data, never as executable SQL.
        // This completely eliminates SQL Injection attacks — even if a user
        // submits a malicious string like "'; DROP TABLE users; --" as their
        // name, it will be stored as a literal string, not executed as a query.
        //
        // The values array maps left-to-right to each '?' in the query:
        //   userId → id
        //   name → name
        //   email → email
        //   hashedPassword → password_hash   ← hashed value, never plain text
        //   role || 'student' → role          ← defaults to 'student' if omitted
        //   institution || null → institution ← null prevents a MySQL error on
        //   major || null → major              ← empty optional fields
        //   year || null → study_year
        //   initialPoints → points
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

        // Respond with 201 Created and return only non-sensitive user fields.
        // The password hash is deliberately excluded from this response.
        res.status(201).json({ 
            message: "User account created successfully!",
            user: { id: userId, name, email, role, points: initialPoints }
        });

    } catch (error) {
        console.error("Signup Error:", error);

        // MySQL error code ER_DUP_ENTRY is thrown when a UNIQUE constraint is
        // violated — in this case, when the submitted email already exists in
        // the `users` table. We return a user-friendly 400 instead of a 500.
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "An account with this email already exists." });
        }
        res.status(500).json({ message: "Server error during signup" });
    }
});


// -----------------------------------------------------------------------------
// 3. User Login Route  —  POST /api/login
// -----------------------------------------------------------------------------
/**
 * Handles user authentication. The full flow is:
 *   1. Validate that both email and password fields are present in the body.
 *   2. Query the database for a user matching the submitted email.
 *   3. Use bcrypt.compare() to verify the submitted password against the
 *      stored hash — without ever decrypting it.
 *   4. Return safe user profile data on success.
 *
 * Security: We return the same generic "Invalid email or password" message
 * for both a missing user AND a wrong password. This is intentional — giving
 * different messages would allow attackers to enumerate valid email addresses.
 *
 * ⚠️  KNOWN BUG (line flagged below): The user object is assigned the full
 *     rows array instead of its first element. This causes all subsequent
 *     property lookups (user.id, user.name, etc.) to return undefined, which
 *     will break the login response payload. The fix is: const user = rows[0];
 */
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Guard clause: reject requests that are missing required credentials
        // before performing any database work.
        if (!email || !password) {
            return res.status(400).json({ message: "Please enter both email and password." });
        }

        // --- Parameterised Query (SQL Injection Prevention) ---
        // The email value is bound to the single '?' placeholder, ensuring it
        // is always treated as a string literal and never as part of the SQL
        // command itself. db.execute() always returns [rows, fields]; we
        // destructure to get only the rows array.
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        // If no rows were returned, no account exists for this email.
        // Respond with 401 Unauthorised and a generic message (see note above).
        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // ⚠️  BUG: rows is an array of row objects. To access a single user's
        // properties, this should be: const user = rows[0];
        // As written, 'user' holds the entire array, so user.password_hash,
        // user.id, etc. will all be undefined.
        const user = rows; 

        // Defensively retrieve the hashed password, checking both the expected
        // column name (password_hash) and a fallback (password) in case of a
        // schema mismatch. If neither exists, a 500 error is returned.
        const savedPassword = user.password_hash || user.password;

        if (!savedPassword) {
            return res.status(500).json({ message: "Server error: Password column missing in database." });
        }

        // --- bcrypt: Password Verification ---
        // bcrypt.compare() re-hashes the submitted plain-text password using
        // the salt that was embedded inside the stored hash string, then checks
        // if the two hashes match. Crucially, the original plain-text password
        // is NEVER stored or retrieved — comparison is always hash-to-hash.
        // Returns a boolean: true if they match, false otherwise.
        const isMatch = await bcrypt.compare(password, savedPassword);

        // If the hashes do not match, the submitted password is incorrect.
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Build a safe response object containing only the fields the frontend
        // needs. Sensitive fields like password_hash are deliberately omitted.
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


// -----------------------------------------------------------------------------
// 4. Upload Resource Route  —  POST /api/resources
// -----------------------------------------------------------------------------
/**
 * Handles the creation of a new study resource. The full flow is:
 *   1. Extract resource metadata and the uploader's ID from the request body.
 *   2. Generate a unique resource ID.
 *   3. Insert the resource record into the `resources` table.
 *   4. Award the uploader +2 gamification points for contributing content.
 *   5. Return the created resource details to the client.
 *
 * Note: Both database operations (INSERT + UPDATE) run sequentially. In a
 * production system, these would ideally be wrapped in a single database
 * transaction so that if the points UPDATE fails, the INSERT is rolled back,
 * keeping the database in a consistent state.
 */
app.post('/api/resources', async (req, res) => {
    try {
        const { title, category, description, isPublic, uploaderId } = req.body;
        
        // Generate a unique resource ID using a timestamp-based suffix.
        const resourceId = 'res-' + Date.now();

        // --- Parameterised Query: INSERT resource ---
        // All six '?' placeholders are bound to the values array in order,
        // preventing any user-supplied string (title, description, etc.) from
        // being interpreted as SQL. This is especially important for free-text
        // fields like 'description', which could otherwise be an injection vector.
        await db.execute(
            `INSERT INTO resources (id, title, category, description, is_public, uploader_id) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [resourceId, title, category, description, isPublic, uploaderId]
        );

        // --- Parameterised Query: UPDATE user points ---
        // Award the uploader +2 points. Using "points = points + 2" is an
        // atomic server-side increment — safer than reading the current value
        // in JavaScript and writing it back, which could cause a race condition
        // if two uploads happen simultaneously. The uploaderId is bound to '?'
        // to scope the update precisely to the correct user record.
        await db.execute(
            `UPDATE users SET points = points + 2 WHERE id = ?`,
            [uploaderId]
        );

        // Respond with 201 Created and echo back the resource metadata.
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


// =============================================================================
// Server Initialisation
// =============================================================================

/**
 * app.listen()
 * Binds the Express application to TCP port 5000 on all available network
 * interfaces of the host machine. Once bound, the server begins accepting
 * incoming HTTP connections. The callback fires once the port is successfully
 * reserved, confirming the server is ready to handle requests.
 */
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
