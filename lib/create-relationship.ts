import { NewRelationship, Profile } from "@/db/schema";
import { calculateRelationshipMetrics } from "@/lib/calculator";
import { supabase } from "@/lib/supabase";

export const createRelationship = async ({
  male,
  female,
}: {
  male: Profile;
  female: Profile;
}) => {
  try {
    // Check if relationship already exists
    const { data: existing } = await supabase
      .from("relationships")
      .select()
      .or(
        `and(inviting_profile_id.eq.${male.id},invited_profile_id.eq.${female.id}),and(inviting_profile_id.eq.${female.id},invited_profile_id.eq.${male.id})`
      )
      .maybeSingle();

    if (existing) {
      return existing;
    }

    const {
      couple_passion_index,
      chemistry_index,
      tikitaka_index,
      aas_score,
      aas_level,
      big_5_score,
      big_5_level,
      flexibility_score,
      flexibility_level,
      passion_type_number,
    } = calculateRelationshipMetrics({
      male,
      female,
    });

    const newRelationship: NewRelationship = {
      inviter_profile_id: male.id,
      invitee_profile_id: female.id,
      relationship_type: "couple",
      passion_index: couple_passion_index,
      chemistry_index,
      tikitaka_index,
      aas_score,
      aas_level,
      big_5_score,
      big_5_level,
      flexibility_score,
      flexibility_level,
      passion_type_number,
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
  } catch (error) {
    console.error("createRelationship failed:", error);
    throw error;
  }
};
