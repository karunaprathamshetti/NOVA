import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setUser: (user) => set({ user }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, loading: false });
    });

    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ session, user: session?.user ?? null, loading: false });
      
      // Handle Profile Creation for new OAuth users
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!profile) {
          const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "user";
          const username = fullName.toLowerCase().replace(/\s+/g, "_") + Math.floor(Math.random() * 1000);
          
          await supabase.from("profiles").insert({
            id: user.id,
            username: username,
            email: user.email!,
            avatar_url: user.user_metadata?.avatar_url || "",
            bio: "",
            stream_key: crypto.randomUUID(),
            rtmp_url: 'rtmp://live.cloudflare.com/live/',
          });
        }
      }
    });
  },
}));
