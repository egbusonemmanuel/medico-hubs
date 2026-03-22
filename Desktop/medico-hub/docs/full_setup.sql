-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'tutor', 'admin');
    CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'institutional');
    CREATE TYPE group_member_role AS ENUM ('member', 'leader');
    CREATE TYPE competition_status AS ENUM ('upcoming', 'active', 'completed');
    CREATE TYPE session_status AS ENUM ('scheduled', 'live', 'ended');
    CREATE TYPE sub_status AS ENUM ('active', 'canceled', 'past_due');
    CREATE TYPE diff_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop tables if needed to ensure clean start (Be careful in production!)
-- DROP TABLE IF EXISTS public.flashcards, public.mindmaps, public.summaries, public.notes, public.profiles, public.users CASCADE;

-- 1. Users Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'student',
    subscription_tier subscription_tier DEFAULT 'free',
    streak_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Notes Table (Source material)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Untitled Note',
    file_url TEXT, 
    raw_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Summaries Table
CREATE TABLE IF NOT EXISTS public.summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    ai_summary JSONB NOT NULL, 
    key_concepts JSONB,
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Flashcards Table
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    source_summary_id UUID REFERENCES public.summaries(id) ON DELETE CASCADE,
    difficulty_level diff_level DEFAULT 'medium',
    next_review_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

------------------------------------------------------------------------------------------------
-- TRIGGER: Automatically create a public.user when a new user signs up in Supabase Auth
------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


------------------------------------------------------------------------------------------------
-- STORAGE: Create the Notes Bucket
------------------------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('notes_bucket', 'notes_bucket', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read files in notes_bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'notes_bucket' );

-- Allow authenticated users to upload files to notes_bucket
CREATE POLICY "Auth Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'notes_bucket' AND auth.role() = 'authenticated' );


------------------------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) - Basic configuration to allow the app to work for authenticated users
------------------------------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Users can read all users (needed for leaderboard) and update their own
CREATE POLICY "Read all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Update self" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Notes/Summaries/Flashcards policies: For this phase, we allow authenticated users to select/insert/update
CREATE POLICY "Auth everything notes" ON public.notes FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth everything summaries" ON public.summaries FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth everything flashcards" ON public.flashcards FOR ALL TO authenticated USING (true);
