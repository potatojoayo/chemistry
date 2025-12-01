import { supabase } from "@/lib/supabase";
import { Profile } from "@/models/profile";
import { RealtimeChannel, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getWebStorage } from "./get-web-storage";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  redirectPath: string | null;
  profileSubscription: RealtimeChannel | null;
  authSubscription: any;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setRedirectPath: (path: string | null) => void;
  setProfileSubscription: (subscription: RealtimeChannel | null) => void;
  loadProfile: (userId: string) => Promise<void>;
  cleanup: () => void;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,
      redirectPath: null,
      profileSubscription: null,
      authSubscription: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      setRedirectPath: (path) => set({ redirectPath: path }),
      setProfileSubscription: (subscription) =>
        set({ profileSubscription: subscription }),
      loadProfile: async (userId: string) => {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          if (error) {
            console.error("Error loading profile:", error);
            return;
          }

          set({ profile: profile ?? null });
        } catch (error) {
          console.error("Unexpected error loading profile:", error);
        }
      },

      cleanup: () => {
        const { profileSubscription, authSubscription } = get();
        if (profileSubscription) {
          profileSubscription.unsubscribe();
          set({ profileSubscription: null });
        }
        if (authSubscription) {
          authSubscription.unsubscribe();
          set({ authSubscription: null });
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
          // 상태 정리
          set({ user: null, profile: null, loading: false });
          
          // Only cleanup profile subscription
          const { profileSubscription } = get();
          if (profileSubscription) {
            profileSubscription.unsubscribe();
            set({ profileSubscription: null });
          }
        } catch (error) {
          console.error("Error signing out:", error);
        }
      },

      initialize: () => {
        // 이미 초기화된 경우 중복 방지
        // const { authSubscription } = get();
        // if (authSubscription) {
        //   authSubscription.unsubscribe();
        //   set({ authSubscription: null });
        // }

        // 초기 로딩 상태 설정
        set({ loading: true });

        // 초기 사용자 상태 가져오기
        supabase.auth.getUser().then(async ({ data: { user }, error }) => {
          if (error) {
            console.error("Error getting user:", error);
            set({ loading: false, user: null });
            return;
          }

          console.log("user", user);
          if (user) {
            await get().loadProfile(user.id);
            set({ user, loading: false });
          } else {
            set({ loading: false, user: null });
          }
        });

        // 인증 상태 변화 감지
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          // 기존 프로필 구독 해제
          const { profileSubscription } = get();
          if (profileSubscription) {
            profileSubscription.unsubscribe();
            set({ profileSubscription: null });
          }

          if (session?.user) {
            set({ user: session.user });
            // 프로필 로드
            await get().loadProfile(session.user.id);
            set({ loading: false });

            // 프로필 realtime 구독 (user_id 필터 사용)
            const newProfileSubscription = supabase
              .channel(`profile-changes-${session.user.id}`)
              .on(
                "postgres_changes",
                {
                  event: "*",
                  schema: "public",
                  table: "profiles",
                  filter: `user_id=eq.${session.user.id}`,
                },
                (payload) => {
                  console.log("Profile changed:", payload);
                  if (payload.eventType === "DELETE") {
                    set({ profile: null });
                  } else {
                    set({ profile: payload.new as Profile });
                  }
                }
              )
              .subscribe();

            set({ profileSubscription: newProfileSubscription });
          } else {
            set({ profile: null, user: null, loading: false });
          }
        });

        // auth 구독 핸들 저장
        set({ authSubscription: subscription });
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
