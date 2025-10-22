export type AASType = "안정형" | "불안형" | "회피형" | "혼란형";

/**
 * AAS (Adult Attachment Style) 유형을 결정합니다.
 * @param zAnxiety 불안 Z-score
 * @param zAvoidance 회피 Z-score
 * @returns 4가지 유형 중 하나
 */
export function getAdultAttachmentType(
  zAnxiety: number,
  zAvoidance: number
): AASType {
  if (zAnxiety < 0 && zAvoidance < 0) return "안정형";
  if (zAnxiety > 0 && zAvoidance < 0) return "불안형";
  if (zAnxiety < 0 && zAvoidance > 0) return "회피형";
  if (zAnxiety > 0 && zAvoidance > 0) return "혼란형";
  throw new Error("유효하지 않은 Z-score입니다.");
}
