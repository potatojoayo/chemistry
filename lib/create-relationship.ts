import { calculateRelationshipMetrics } from "@/lib/calculator";
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




  let male: Profile;
  let female: Profile;

  // Determine male/female for calculation
  if (invitingProfile.gender === 'male' && invitedProfile.gender === 'female') {
    male = invitingProfile;
    female = invitedProfile;
  } else if (invitingProfile.gender === 'female' && invitedProfile.gender === 'male') {
    male = invitedProfile;
    female = invitingProfile;
  } else {
    // Fallback: Default assignment if genders are same or missing
    male = invitingProfile;
    female = invitedProfile;
  }

  const { couple_passion_index, ...restMetrics } = calculateRelationshipMetrics({ male, female });

  const newRelationship: NewRelationship = {
    inviting_profile_id: invitingProfile.id,
    invited_profile_id: invitedProfile.id,
    relation_type: "couple",
    passion_index: couple_passion_index,
    ...restMetrics,
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