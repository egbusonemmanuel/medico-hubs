import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: 'student' | 'tutor' | 'admin' | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  role: null,
  isLoading: true,
  
  setUser: (user) => {
     // Read the custom role attached to the user metadata during signup
     const role = user?.user_metadata?.role || 'student';
     set({ user, role });
  },
  
  setSession: (session) => set({ session }),

  initialize: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      set({ 
        session, 
        user: session?.user || null,
        role: session?.user?.user_metadata?.role || null,
        isLoading: false 
      });

      // Listen for auth changes recursively (Login, Logout, Token Refreshes)
      supabase.auth.onAuthStateChange((_event, newSession) => {
        set({ 
            session: newSession, 
            user: newSession?.user || null,
            role: newSession?.user?.user_metadata?.role || null
        });
      });

    } catch (error) {
      console.error("Error fetching session:", error);
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, role: null });
  }
}));
