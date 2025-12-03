import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getWebStorage } from "./get-web-storage";

interface InvitationState {
  inviterProfileId: string | null;
  redirectPath: string | null;
  setInviterProfileId: (id: string | null) => void;
  setRedirectPath: (path: string | null) => void;
  clearInvitation: () => void;
}

export const useInvitationStore = create<InvitationState>()(
  persist(
    (set) => ({
      inviterProfileId: null,
      redirectPath: null,
      setInviterProfileId: (id) => set({ inviterProfileId: id }),
      setRedirectPath: (path) => set({ redirectPath: path }),
      clearInvitation: () =>
        set({ inviterProfileId: null, redirectPath: null }),
    }),
    {
      name: "invitation-store",
      storage: createJSONStorage(() => getWebStorage()),
    }
  )
);
