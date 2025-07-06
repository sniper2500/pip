/*
  # Create pipe excavation calculator database schema

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, references auth.users)

    - `project_parameters`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `section_name` (text)
      - `start_station` (text)
      - `end_station` (text)
      - `pipe_diameter` (numeric)
      - `pipe_depth` (numeric)
      - `excavation_width` (numeric)
      - `slope_ratio` (numeric)
      - `ground_level_start` (numeric)
      - `ground_level_end` (numeric)
      - `pipe_level_start` (numeric)
      - `pipe_level_end` (numeric)
      - `calculated_slope` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `project_structures`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `station` (text)
      - `structure_type` (text)
      - `invert_level` (numeric)
      - `ground_level` (numeric)
      - `excavation_depth` (numeric)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `surveyor_info`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `name` (text)
      - `title` (text)
      - `company` (text)
      - `phone` (text)
      - `email` (text)
      - `license` (text)
      - `signature_data` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create project_parameters table
CREATE TABLE IF NOT EXISTS project_parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  section_name text DEFAULT 'Section A-A',
  start_station text DEFAULT '0+000',
  end_station text DEFAULT '0+100',
  pipe_diameter numeric DEFAULT 300,
  pipe_depth numeric DEFAULT 2.5,
  excavation_width numeric DEFAULT 1.2,
  slope_ratio numeric DEFAULT 1.5,
  ground_level_start numeric DEFAULT 100.00,
  ground_level_end numeric DEFAULT 99.50,
  pipe_level_start numeric DEFAULT 97.50,
  pipe_level_end numeric DEFAULT 97.00,
  calculated_slope numeric DEFAULT 0.50,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_structures table
CREATE TABLE IF NOT EXISTS project_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  station text NOT NULL,
  structure_type text DEFAULT 'Manhole',
  invert_level numeric DEFAULT 0,
  ground_level numeric DEFAULT 0,
  excavation_depth numeric DEFAULT 0,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create surveyor_info table
CREATE TABLE IF NOT EXISTS surveyor_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text DEFAULT '',
  title text DEFAULT '',
  company text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  license text DEFAULT '',
  signature_data text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (only if not already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'projects' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'project_parameters' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE project_parameters ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'project_structures' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE project_structures ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'surveyor_info' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE surveyor_info ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for projects (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can view own projects'
  ) THEN
    CREATE POLICY "Users can view own projects"
      ON projects FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can insert own projects'
  ) THEN
    CREATE POLICY "Users can insert own projects"
      ON projects FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can update own projects'
  ) THEN
    CREATE POLICY "Users can update own projects"
      ON projects FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can delete own projects'
  ) THEN
    CREATE POLICY "Users can delete own projects"
      ON projects FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create policies for project_parameters (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_parameters' 
    AND policyname = 'Users can view own project parameters'
  ) THEN
    CREATE POLICY "Users can view own project parameters"
      ON project_parameters FOR SELECT
      TO authenticated
      USING (project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_parameters' 
    AND policyname = 'Users can insert own project parameters'
  ) THEN
    CREATE POLICY "Users can insert own project parameters"
      ON project_parameters FOR INSERT
      TO authenticated
      WITH CHECK (project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_parameters' 
    AND policyname = 'Users can update own project parameters'
  ) THEN
    CREATE POLICY "Users can update own project parameters"
      ON project_parameters FOR UPDATE
      TO authenticated
      USING (project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_parameters' 
    AND policyname = 'Users can delete own project parameters'
  ) THEN
    CREATE POLICY "Users can delete own project parameters"
      ON project_parameters FOR DELETE
      TO authenticated
      USING (project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

-- Create policies for project_structures (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_structures' 
    AND policyname = 'Users can view own project structures'
  ) THEN
    CREATE POLICY "Users can view own project structures"
      ON project_structures FOR SELECT
      TO authenticated
      USING (project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_structures' 
    AND policyname = 'Users can insert own project structures'
  ) THEN
    CREATE POLICY "Users can insert own project structures"
      ON project_structures FOR INSERT
      TO authenticated
      WITH CHECK (project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_structures' 
    AND policyname = 'Users can update own project structures'
  ) THEN
    CREATE POLICY "Users can update own project structures"
      ON project_structures FOR UPDATE
      TO authenticated
      USING (project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_structures' 
    AND policyname = 'Users can delete own project structures'
  ) THEN
    CREATE POLICY "Users can delete own project structures"
      ON project_structures FOR DELETE
      TO authenticated
      USING (project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

-- Create policies for surveyor_info (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'surveyor_info' 
    AND policyname = 'Users can view own surveyor info'
  ) THEN
    CREATE POLICY "Users can view own surveyor info"
      ON surveyor_info FOR SELECT
      TO authenticated
      USING (project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'surveyor_info' 
    AND policyname = 'Users can insert own surveyor info'
  ) THEN
    CREATE POLICY "Users can insert own surveyor info"
      ON surveyor_info FOR INSERT
      TO authenticated
      WITH CHECK (project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'surveyor_info' 
    AND policyname = 'Users can update own surveyor info'
  ) THEN
    CREATE POLICY "Users can update own surveyor info"
      ON surveyor_info FOR UPDATE
      TO authenticated
      USING (project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'surveyor_info' 
    AND policyname = 'Users can delete own surveyor info'
  ) THEN
    CREATE POLICY "Users can delete own surveyor info"
      ON surveyor_info FOR DELETE
      TO authenticated
      USING (project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

-- Create function to update updated_at timestamp (only if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_projects_updated_at'
  ) THEN
    CREATE TRIGGER update_projects_updated_at
      BEFORE UPDATE ON projects
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_project_parameters_updated_at'
  ) THEN
    CREATE TRIGGER update_project_parameters_updated_at
      BEFORE UPDATE ON project_parameters
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_project_structures_updated_at'
  ) THEN
    CREATE TRIGGER update_project_structures_updated_at
      BEFORE UPDATE ON project_structures
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_surveyor_info_updated_at'
  ) THEN
    CREATE TRIGGER update_surveyor_info_updated_at
      BEFORE UPDATE ON surveyor_info
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;