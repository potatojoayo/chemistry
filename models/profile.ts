export interface Profile {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
  test_index: number;
  test_completed: boolean;

  // Big 5 Personality Traits
  openness: number | null;
  conscientiousness: number | null;
  extraversion: number | null;
  agreeableness: number | null;
  neuroticism: number | null;

  // Attachment Styles
  avoidance: number | null;
  anxiety: number | null;

  // Communication Styles
  humor: number | null;
  conflict: number | null;

  // Z-scores (normalized values)
  z_openness: number | null;
  z_conscientiousness: number | null;
  z_extraversion: number | null;
  z_agreeableness: number | null;
  z_neuroticism: number | null;
  z_avoidance: number | null;
  z_anxiety: number | null;
  z_humor: number | null;
  z_conflict: number | null;

  // New Calculated Fields
  big_5_type: number | null;
  emotional_stability_percentage: number | null;
  emotional_stability_level: number | null;
  attachment_type: string | null;
  flexibility_percentage: number | null;
  flexibility_level: number | null;

  passion_index:number| null;
  passion_level: number | null;
  passion_type: 
  'COLD' | 'COOL' | 'MILD' | 'WARM' | 'HOT' | null;
}
