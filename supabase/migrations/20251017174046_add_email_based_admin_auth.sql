/*
  # Add Email-Based Admin Authentication

  1. Changes
    - Create new RPC function `authenticate_admin_by_email` for email-based authentication
    - Keeps existing `authenticate_admin` function for backward compatibility
    - Uses bcrypt password verification via pgcrypto extension

  2. Security
    - Password verification using crypt() function
    - Returns minimal user information (id, username, email)
    - Authenticated flag indicates successful login
*/

-- Create email-based admin authentication function
CREATE OR REPLACE FUNCTION authenticate_admin_by_email(
  email_input text,
  password_input text
)
RETURNS TABLE (
  id uuid,
  username text,
  email text,
  authenticated boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.username,
    a.email,
    (a.password = crypt(password_input, a.password)) as authenticated
  FROM admins a
  WHERE a.email = email_input;
END;
$$;