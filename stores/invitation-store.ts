import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getWebStorage } from "./get-web-storage";

interface InvitationState {
  invitedProfileId: string | null;
  redirectPath: string | null;
  setInvitedProfileId: (id: string | null) => void;
  setRedirectPath: (path: string | null) => void;
  clearInvitation: () => void;
}

export const useInvitationStore = create<InvitationState>()(
  persist(
    (set) => ({
      invitedProfileId: null,
      redirectPath: null,
      setInvitedProfileId: (id) => set({ invitedProfileId: id }),
      setRedirectPath: (path) => set({ redirectPath: path }),
      clearInvitation: () =>
        set({ invitedProfileId: null, redirectPath: null }),
    }),
    {
      name: "invitation-store",
      storage: createJSONStorage(() => getWebStorage()),
    }
  )
);
