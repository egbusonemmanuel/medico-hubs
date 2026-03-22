-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE user_role AS ENUM ('student', 'tutor', 'admin');
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'institutional');
CREATE TYPE group_member_role AS ENUM ('member', 'leader');
CREATE TYPE competition_status AS ENUM ('upcoming', 'active', 'completed');
CREATE TYPE session_status AS ENUM ('scheduled', 'live', 'ended');
CREATE TYPE sub_status AS ENUM ('active', 'canceled', 'past_due');
CREATE TYPE diff_level AS ENUM ('easy', 'medium', 'hard');

-- Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'student',
    subscription_tier subscription_tier DEFAULT 'free',
    streak_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles Table
CREATE TABLE public.profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    institution TEXT
);

-- Notes Table (Source material)
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT, -- Link to Supabase Storage
    raw_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Summaries Table
CREATE TABLE public.summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    ai_summary JSONB NOT NULL, -- 5-point structure
    key_concepts JSONB,
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Flashcards Table
CREATE TABLE public.flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    source_summary_id UUID REFERENCES public.summaries(id) ON DELETE CASCADE,
    difficulty_level diff_level DEFAULT 'medium',
    next_review_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- MindMaps Table
CREATE TABLE public.mindmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    summary_id UUID NOT NULL REFERENCES public.summaries(id) ON DELETE CASCADE,
    mermaid_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Groups (Med-Squads)
CREATE TABLE public.groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Group Members
CREATE TABLE public.group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role group_member_role DEFAULT 'member',
    UNIQUE(group_id, user_id)
);

-- Competitions (Clinic Clash)
CREATE TABLE public.competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    status competition_status DEFAULT 'upcoming'
);

-- Group Scores
CREATE TABLE public.group_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    UNIQUE(group_id, competition_id)
);

-- Tutor Sessions
CREATE TABLE public.tutor_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    live_status session_status DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Session Questions
CREATE TABLE public.session_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.tutor_sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL
);

-- Subscriptions
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL,
    status sub_status DEFAULT 'active',
    renewal_date TIMESTAMPTZ NOT NULL
);
