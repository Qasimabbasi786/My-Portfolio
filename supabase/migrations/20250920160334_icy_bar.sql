/*
  # Seed Admin User

  1. Create initial admin user for testing
    - Username: admin
    - Email: admin@globex.com  
    - Password: admin123 (hashed)

  Note: Change the password after first login in production!
*/

-- Insert admin user with hashed password (admin123)
-- Password hash generated with bcrypt, cost 12
INSERT INTO admins (username, email, password) 
VALUES (
  'admin',
  'admin@globex.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXig/pPOYHDi'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample developers
INSERT INTO developers (name, email, github, linkedin, title, skills, bio) VALUES
(
  'Muhammad Qasim',
  'qasim.tanveer81755@gmail.com',
  'https://github.com/Qasimabbasi786',
  'https://www.linkedin.com/in/muhammad-qasim-418372347/',
  'Full Stack Web Developer',
  ARRAY['React', 'Node.js', 'TypeScript', 'Python', 'MongoDB', 'PostgreSQL'],
  'Experienced Full Stack Web Developer specializing in modern web technologies. I build robust, scalable applications with a focus on clean code and exceptional user experiences.'
),
(
  'Azmat Mustafa',
  'azmatmustafa979@gmail.com',
  'https://github.com/drago09t',
  'https://www.linkedin.com/in/azmat-mustafa-05b991264/',
  'Full Stack Web Developer',
  ARRAY['React', 'JavaScript', 'Node.js', 'CSS', 'Tailwind CSS', 'MongoDB'],
  'Skilled Full Stack Web Developer with expertise in creating dynamic, responsive web applications. I combine technical proficiency with creative problem-solving to deliver outstanding digital solutions.'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample projects
WITH dev_ids AS (
  SELECT id, name FROM developers WHERE name IN ('Muhammad Qasim', 'Azmat Mustafa')
),
project_data AS (
  INSERT INTO projects (title, description, technologies, github_link, live_demo_link, featured, status) VALUES
  (
    'E-Commerce Platform',
    'A full-featured e-commerce platform with user authentication, payment processing, and admin dashboard.',
    ARRAY['React', 'Node.js', 'MongoDB', 'Stripe'],
    'https://github.com/Qasimabbasi786/ecommerce-platform',
    'https://demo-ecommerce.com',
    true,
    'active'
  ),
  (
    'Task Management App',
    'A collaborative task management application with real-time updates and team collaboration features.',
    ARRAY['React', 'TypeScript', 'Socket.io', 'PostgreSQL'],
    'https://github.com/Qasimabbasi786/task-manager',
    'https://demo-taskmanager.com',
    true,
    'active'
  ),
  (
    'Weather Dashboard',
    'A comprehensive weather dashboard with location-based forecasts and interactive charts.',
    ARRAY['React', 'Chart.js', 'Weather API', 'Tailwind CSS'],
    'https://github.com/Qasimabbasi786/weather-dashboard',
    null,
    false,
    'active'
  )
  ON CONFLICT DO NOTHING
  RETURNING id, title
)
-- Link projects to developers
INSERT INTO project_developers (project_id, developer_id, role)
SELECT 
  p.id,
  d.id,
  'developer'
FROM project_data p
CROSS JOIN dev_ids d
WHERE 
  (p.title IN ('E-Commerce Platform', 'Task Management App') AND d.name IN ('Muhammad Qasim', 'Azmat Mustafa'))
  OR (p.title = 'Weather Dashboard' AND d.name = 'Azmat Mustafa')
ON CONFLICT (project_id, developer_id) DO NOTHING;