-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mindmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_sessions ENABLE ROW LEVEL SECURITY;

-- Utility Function to check if user is a tutor or admin
CREATE OR REPLACE FUNCTION auth.is_tutor_or_admin() RETURNS BOOLEAN AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
    RETURN user_role IN ('tutor', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users
-- Users can read their own data, and basic info of others
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = id);

-- Profiles
-- Profiles are publicly viewable by authenticated users
CREATE POLICY "Profiles are viewable by all users" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Notes
-- Users can only see, insert, update, or delete their own notes
CREATE POLICY "Users can perform all actions on their own notes" ON public.notes USING (auth.uid() = user_id);

-- Summaries
-- Anyone can view verified summaries, but only authors can view unverified summaries globally unless tutor
CREATE POLICY "Authenticated users can view verified summaries" ON public.summaries FOR SELECT USING (verified = true);
CREATE POLICY "Users can view their own unverified summaries" ON public.summaries FOR SELECT USING (
    note_id IN (SELECT id FROM public.notes WHERE user_id = auth.uid())
);
CREATE POLICY "Tutors can view all summaries to verify them" ON public.summaries FOR SELECT USING (auth.is_tutor_or_admin());

-- Tutors can verify summaries
CREATE POLICY "Tutors can update summaries for verification" ON public.summaries FOR UPDATE USING (auth.is_tutor_or_admin());

-- Flashcards
-- Users manage their own flashcards
CREATE POLICY "Users manage their own flashcards" ON public.flashcards USING (auth.uid() = user_id);

-- MindMaps
-- Viewable by anyone who can view the parent summary
CREATE POLICY "Mindmaps viewable by anyone who can view the summary" ON public.mindmaps FOR SELECT USING (
    summary_id IN (
        SELECT id FROM public.summaries WHERE verified = true 
        OR note_id IN (SELECT id FROM public.notes WHERE user_id = auth.uid())
        OR auth.is_tutor_or_admin()
    )
);

-- Groups
-- Anyone can view groups
CREATE POLICY "Groups are viewable by anyone" ON public.groups FOR SELECT USING (auth.role() = 'authenticated');
-- Only creator or admin can update/delete
CREATE POLICY "Group creators can update their groups" ON public.groups FOR UPDATE USING (auth.uid() = created_by);

-- Group Members
-- Members can be viewed by anyone in the group or if public
CREATE POLICY "Group members visible to authenticated users" ON public.group_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can join/leave groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING (auth.uid() = user_id);

-- Only leaders can remove other members
CREATE POLICY "Leaders can manage group members" ON public.group_members FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.group_members gm 
        WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.role = 'leader'
    )
);

-- Tutor Sessions
CREATE POLICY "Sessions viewable by everyone" ON public.tutor_sessions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Tutors can manage their sessions" ON public.tutor_sessions USING (auth.uid() = tutor_id);
