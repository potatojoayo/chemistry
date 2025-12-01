import { supabase } from "@/lib/supabase";
import { Profile } from "@/models/profile";
import { NewRelationship } from "@/models/relationship";

export const createRelationship = async ({
  invitingProfile,
  invitedProfile,
}: {
  invitingProfile: Profile;
  invitedProfile: Profile;
}) => {

    const newRelationship: NewRelationship = {
      inviting_profile_id: invitingProfile.id,
      invited_profile_id: invitedProfile.id,
      relation_type: "couple",
    };
  const { data, error } = await supabase
    .from("relationships")
    .insert(newRelationship)
    .select()
    .single();

  if (error) {
    console.error("Error creating relationship:", error);
    throw error;
  }

  return data;
};