-- Optional seed data (run after schema_postgresql.sql)
-- Default admin: admin@example.com / adminpass

INSERT INTO users (id, name, email, password_hash, role, points, is_active)
VALUES (
    'a0000000-0000-4000-8000-000000000001',
    'Platform Admin',
    'admin@example.com',
    '$2b$12$HXPCWQkRJONcxokfOup72upFFp3MHa5FAFU/3BrzLmyBS3bEtMeEC',
    'admin',
    0,
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Sample faculty uploader
INSERT INTO users (id, name, email, password_hash, role, institution, points, is_active)
VALUES (
    'b0000000-0000-4000-8000-000000000002',
    'Dr. Sarah Chen',
    'faculty@example.com',
    '$2b$12$HXPCWQkRJONcxokfOup72upFFp3MHa5FAFU/3BrzLmyBS3bEtMeEC',
    'faculty',
    'University of Technology',
    20,
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Sample approved public resource
INSERT INTO resources (
    id, title, description, full_details, category, uploader_id,
    is_public, topics, is_approved, rating, review_count
)
VALUES (
    'c0000000-0000-4000-8000-000000000001',
    'Introduction to Computer Networks',
    'Comprehensive course materials covering OSI model, TCP/IP, routing, and network security.',
    'Full syllabus and lecture notes for CS401.',
    'Courses',
    'b0000000-0000-4000-8000-000000000002',
    TRUE,
    ARRAY['networking', 'tcp-ip', 'security'],
    TRUE,
    4.5,
    12
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO resource_files (id, resource_id, name, size, file_type, file_url)
VALUES (
    'd0000000-0000-4000-8000-000000000001',
    'c0000000-0000-4000-8000-000000000001',
    'Syllabus.pdf',
    '2.4 MB',
    'pdf',
    'https://example.com/syllabus.pdf'
)
ON CONFLICT (id) DO NOTHING;
