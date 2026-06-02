CREATE DATABASE IF NOT EXISTS studybot_db;
USE studybot_db;

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'faculty', 'researcher', 'visitor', 'admin') DEFAULT 'student',
    institution VARCHAR(150),
    major VARCHAR(100),
    study_year VARCHAR(50),
    points INT DEFAULT 0,
    monthly_access_limit INT DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resources (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category ENUM('Courses', 'Projects', 'Research', 'Documents') NOT NULL,
    uploader_id VARCHAR(50) NOT NULL,
    description TEXT,
    full_details TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    external_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE resource_topics (
    resource_id VARCHAR(50) NOT NULL,
    topic_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (resource_id, topic_name),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

CREATE TABLE resource_files (
    id VARCHAR(50) PRIMARY KEY,
    resource_id VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size VARCHAR(50),
    file_type VARCHAR(50),
    file_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

CREATE TABLE user_resource_access (
    user_id VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50) NOT NULL,
    points_spent INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, resource_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    id VARCHAR(50) PRIMARY KEY,
    resource_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    rating INT CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(resource_id, user_id)
);

CREATE TABLE calendar_events (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type ENUM('exam', 'deadline', 'reminder', 'class') NOT NULL,
    event_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE activity_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    activity_type ENUM('request', 'review', 'upload') NOT NULL,
    message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);