export interface Relationship {
  id: string;
  inviting_profile_id: string;
  invited_profile_id: string;
  relation_type: "couple" | "friend";
  created_at: string;
  updated_at: string;
  tikitaka_index: number;
  chemistry_index: number;
  aas_score: number;
  aas_level: number;
  big_5_score: number;
  big_5_level: number;
  passion_type_number: number;
  passion_index: number;
}

export interface NewRelationship extends Omit<Relationship, "id" | "created_at" | "updated_at"> {}  