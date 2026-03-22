-- 1. Ensure the user_role type exists
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('student', 'tutor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Ensure public.users table exists and is correctly linked to auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role public.user_role DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add first_name and last_name columns safely (in case they don't exist)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 4. Create an absolutely bulletproof trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  extracted_role public.user_role;
BEGIN
  -- Safely extract and cast role from metadata, default to 'student'
  BEGIN
    extracted_role := COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role);
  EXCEPTION WHEN OTHERS THEN
    extracted_role := 'student'::public.user_role;
  END;

  -- Safely insert the user with all their registration data
  INSERT INTO public.users (id, email, role, first_name, last_name, full_name)
  VALUES (
    new.id, 
    new.email, 
    extracted_role,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    full_name = EXCLUDED.full_name;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Re-link the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
