/*
  # Create Audit Logs Table

  ## Overview
  Creates an audit_logs table to track all admin actions and changes made through the admin panel.

  ## Changes Made

  ### 1. New Tables
    - `audit_logs`
      - `id` (uuid, primary key) - Unique identifier for the audit log entry
      - `admin_id` (uuid, foreign key) - Reference to the admin who performed the action
      - `action` (text) - Description of the action performed (e.g., CREATE_DEVELOPER, UPDATE_PROJECT)
      - `table_name` (text, nullable) - Name of the table affected
      - `record_id` (text, nullable) - ID of the record affected
      - `old_values` (jsonb, nullable) - Previous values before the change
      - `new_values` (jsonb, nullable) - New values after the change
      - `ip_address` (text, nullable) - IP address of the admin who performed the action
      - `user_agent` (text, nullable) - User agent string of the admin's browser
      - `created_at` (timestamptz) - Timestamp when the action was performed

  ### 2. Indexes
    - Index on `admin_id` for fast lookup of actions by admin
    - Index on `table_name` for fast lookup of actions by table
    - Index on `created_at` for chronological sorting

  ### 3. Security
    - Enable RLS on `audit_logs` table
    - Add policy for authenticated users to read audit logs
    - Add policy for authenticated users to create audit logs
    - Audit logs cannot be updated or deleted to maintain integrity
*/

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_logs table
-- Authenticated users can read all audit logs
CREATE POLICY "Authenticated users can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert audit logs
CREATE POLICY "Authenticated users can create audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- No one can update or delete audit logs to maintain integrity
-- (No UPDATE or DELETE policies means these operations are blocked)
