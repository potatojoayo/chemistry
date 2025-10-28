export interface Relation {
  id: string;
  requester_id: string;
  target_id: string;
  relation_type: "friend" | "family" | "couple" | "other";
  status: "pending" | "accepted" | "declined" | "blocked";
  invited_at: string | null;
  accepted_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}
