import { Profile } from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { storage } from "./storage";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authRedirectPath: string | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setAuthRedirectPath: (path: string | null) => void;
  fetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,
      authRedirectPath: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      setAuthRedirectPath: (path) => set({ authRedirectPath: path }),
      fetchProfile: async () => {
        const user = get().user;
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
            // 프로필이 없을 수도 있음 (회원가입 중)
            return;
          }

          set({ profile: data });
        } catch (error) {
          console.error("Unexpected error fetching profile:", error);
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({ user: null, profile: null, loading: false });
        } catch (error) {
          console.error("Error signing out:", error);
        }
      },

      init: async () => {
        try {
          // 초기 세션 확인
          const {
            data: { session },
          } = await supabase.auth.getSession();

          set({ user: session?.user ?? null });

          if (session?.user) {
            await get().fetchProfile();
          }
        } catch (error) {
          console.error("Error initializing auth:", error);
        } finally {
          set({ loading: false });
        }

        // 로그인/로그아웃 실시간 반영
        supabase.auth.onAuthStateChange(async (event, session) => {
          const currentUser = get().user;
          const newUser = session?.user ?? null;

          // 세션이 변경되었을 때만 업데이트
          if (currentUser?.id !== newUser?.id) {
            set({ user: newUser });
            if (newUser) {
              await get().fetchProfile();
            } else {
              set({ profile: null });
            }
          }

          set({ loading: false });
        });
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);
