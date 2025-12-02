import { supabase } from "@/lib/supabase";
import { Profile } from "@/models/profile";
import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getWebStorage } from "./get-web-storage";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  redirectPath: string | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setRedirectPath: (path: string | null) => void;
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
      redirectPath: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      setRedirectPath: (path) => set({ redirectPath: path }),

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
        // 초기 세션 확인
        const {
          data: { session },
        } = await supabase.auth.getSession();

        set({ user: session?.user ?? null });

        if (session?.user) {
          await get().fetchProfile();
        }

        // 로그인/로그아웃 실시간 반영
        supabase.auth.onAuthStateChange(async (event, session) => {
          const currentUser = get().user;
          const newUser = session?.user ?? null;

          set({ user: newUser });

          if (newUser) {
            // 유저가 변경되었거나 프로필이 없는 경우 fetch
            // (이미 있는 경우 불필요한 fetch 방지 로직을 추가할 수도 있지만,
            //  onAuthStateChange는 로그인/앱시작 시 주로 발생하므로 안전하게 fetch)
             await get().fetchProfile();
          } else {
            set({ profile: null });
          }
          
          set({ loading: false });
        });

        set({ loading: false });
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => getWebStorage()),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);
