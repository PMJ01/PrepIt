

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS study_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS coding_problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
    description TEXT NOT NULL
);

INSERT INTO study_notes (category, title, content)
SELECT 'Operating systems', 'Paging', 'Virtual memory maps process addresses to physical frames through page tables. Page faults trade speed for a larger address space.'
WHERE NOT EXISTS (SELECT 1 FROM study_notes WHERE title = 'Paging');

INSERT INTO study_notes (category, title, content)
SELECT 'Databases', 'Indexes', 'An index is an access path. Discuss selectivity, ordering, covering columns, and write amplification before calling it faster.'
WHERE NOT EXISTS (SELECT 1 FROM study_notes WHERE title = 'Indexes');

INSERT INTO coding_problems (title, difficulty, description)
SELECT 'Two Sum', 'Easy', 'Find two numbers in an array that add up to a target.'
WHERE NOT EXISTS (SELECT 1 FROM coding_problems WHERE title = 'Two Sum');

INSERT INTO coding_problems (title, difficulty, description)
SELECT 'Course Schedule', 'Medium', 'Determine whether all courses can be completed given prerequisite pairs.'
WHERE NOT EXISTS (SELECT 1 FROM coding_problems WHERE title = 'Course Schedule');




CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);