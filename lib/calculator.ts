import { normalCdf, nz, phiPct, scoreToLevel } from "@/lib/utils";
import { Profile } from "@/models/profile";

interface ChemistryIndex {
  aas_score: number;          // E
  aas_level: number;          // 1~5
  big_5_score: number;         // B
  big_5_level: number;         // 1~5
  flexibility_score: number;  // L
  flexibility_level: number;  // 1~5
  chemistry_index: number;    // 최종 LLUBB
}

interface TikitakaResult {
  total_difficulty: number;
  tikitaka_index: number;
  penalty_stability: number;
  penalty_interaction: number;
}

interface PassionResult {
  passion_type_number: number; // 1~25
  couple_passion_index: number; // 0~100
}

export interface RelationshipMetrics extends ChemistryIndex, TikitakaResult, PassionResult {}

/**
 * 두 프로필로부터 AAS(애착 안정), Big5, 정서적 유연성 점수와
 * 최종 chemistry_index(LLUBB)를 계산
 */
/**
 * 두 프로필로부터 AAS(애착 안정), Big5, 정서적 유연성 점수와
 * 최종 chemistry_index(LLUBB)를 계산
 */
function calculateChemistryIndex({
  male,
  female,
}: {
  male: Profile;
  female: Profile;
}): ChemistryIndex {
  // ----- 상수 (문서 기준) -----
  const alpha = 0.5; // E 가중치
  const beta = 0.2;  // B 가중치
  const gamma = 0.3; // L 가중치
  const kappa = 20;  // P_trap 가중치
  const delta = 0.3; // B, L에서 차이 패널티

  // ===== 1) E: 애착 안정 지수 (AAS) =====
  const zAnxA = nz(male.z_anxiety, "z_anxiety(A)");
  const zAnxB = nz(female.z_anxiety, "z_anxiety(B)");
  const zAvoidA = nz(male.z_avoidance, "z_avoidance(A)");
  const zAvoidB = nz(female.z_avoidance, "z_avoidance(B)");

  const zErcA = 0.57 * zAnxA + 0.15 * zAvoidA;
  const zErcB = 0.57 * zAnxB + 0.15 * zAvoidB;

  const phiErcA = phiPct(zErcA);
  const phiErcB = phiPct(zErcB);

  const avgErc = (phiErcA + phiErcB) / 2;

  // 애착 함정 지표 P_trap
  const phiAnxA = phiPct(zAnxA);
  const phiAnxB = phiPct(zAnxB);
  const phiAvoidA = phiPct(zAvoidA);
  const phiAvoidB = phiPct(zAvoidB);

  // percent(0~100) 기준 공식:
  // P_trap = (Φ(AnxA)*Φ(AvoidB) + Φ(AnxB)*Φ(AvoidA)) / 10000
  const pTrap =
    (phiAnxA * phiAvoidB + phiAnxB * phiAvoidA) / 10000;

  let E = 100 - avgErc - kappa * pTrap;
  E = Math.max(0, Math.min(100, E));

  const aasScore = E;
  const aasLevel = scoreToLevel(aasScore);

  // ===== 2) B: Big-5 성격성향 지수 =====
  const zAgreeA = nz(male.z_agreeableness, "z_agreeableness(A)");
  const zAgreeB = nz(female.z_agreeableness, "z_agreeableness(B)");
  const zConsA = nz(male.z_conscientiousness, "z_conscientiousness(A)");
  const zConsB = nz(female.z_conscientiousness, "z_conscientiousness(B)");
  const zExtraA = nz(male.z_extraversion, "z_extraversion(A)");
  const zExtraB = nz(female.z_extraversion, "z_extraversion(B)");
  const zOpenA = nz(male.z_openness, "z_openness(A)");
  const zOpenB = nz(female.z_openness, "z_openness(B)");

  const zBigA =
    -0.42 * zAnxA +
    0.37 * zAgreeA +
    0.3 * zConsA +
    0.08 * zExtraA +
    0.02 * zOpenA;
  const zBigB =
    -0.42 * zAnxB +
    0.37 * zAgreeB +
    0.3 * zConsB +
    0.08 * zExtraB +
    0.02 * zOpenB;

  const phiBigA = phiPct(zBigA);
  const phiBigB = phiPct(zBigB);
  const avgBig = (phiBigA + phiBigB) / 2;
  const diffBig = Math.abs(phiBigA - phiBigB);

  let B = avgBig - delta * diffBig;
  B = Math.max(0, Math.min(100, B));

  const big5Score = B;
  const big5Level = scoreToLevel(big5Score);

  // ===== 3) L: 롱텀 성향(정서적 유연성) 지수 =====
  const zConflictA = nz(male.z_conflict, "z_conflict(A)");
  const zConflictB = nz(female.z_conflict, "z_conflict(B)");
  const zHumorA = nz(male.z_humor, "z_humor(A)");
  const zHumorB = nz(female.z_humor, "z_humor(B)");

  const zLongA = 0.6 * zConflictA + 0.4 * zHumorA;
  const zLongB = 0.6 * zConflictB + 0.4 * zHumorB;

  const phiLongA = phiPct(zLongA);
  const phiLongB = phiPct(zLongB);
  const avgLong = (phiLongA + phiLongB) / 2;
  const diffLong = Math.abs(phiLongA - phiLongB);

  let L = avgLong - delta * diffLong;
  L = Math.max(0, Math.min(100, L));

  const flexibilityScore = L;
  const flexibilityLevel = scoreToLevel(flexibilityScore);

  // ===== 4) 최종 Chemistry Index (LLUBB) =====
  const chemistryIndex = alpha * E + beta * B + gamma * L;

  return {
    aas_score: aasScore,
    aas_level: aasLevel,
    big_5_score: big5Score,
    big_5_level: big5Level,
    flexibility_score: flexibilityScore,
    flexibility_level: flexibilityLevel,
    chemistry_index: chemistryIndex,
  };
}

/**
 * Tikitaka Index calculation
 * @param male Profile
 * @param female Profile
 */
function calculateTikitakaIndex({
  male,
  female,
}: {
  male: Profile;
  female: Profile;
}): TikitakaResult {
  const k1 = 0.3;
  const k2 = 0.3;

  // S = 불안정성 점수 = 100 - stability%
  const S_M = 100 - (male.emotional_stability_percentage ?? 50);
  const S_F = 100 - (female.emotional_stability_percentage ?? 50);

  // 1) Stability penalty
  const Stab_M = 100 - S_M;
  const Stab_F = 100 - S_F;
  const penalty_stability = k1 * (100 - Math.min(Stab_M, Stab_F));

  // 2) Interaction penalty
  const Z_anxM = male.z_anxiety ?? 0;
  const Z_avoidF = female.z_avoidance ?? 0;
  const Z_anxF = female.z_anxiety ?? 0;
  const Z_avoidM = male.z_avoidance ?? 0;

  const interactionTerm =
    normalCdf(Z_anxM) * normalCdf(Z_avoidF) +
    normalCdf(Z_anxF) * normalCdf(Z_avoidM);

  const penalty_interaction = k2 * interactionTerm;

  // Total penalty
  const C_penalty = penalty_stability + penalty_interaction;

  // 3) Total Difficulty = (0.5 * SM + 0.5 * SF) + C_penalty
  const difficulty = 0.5 * S_M + 0.5 * S_F + C_penalty;

  // 4) Final Tikitaka Index
  const tikitaka = 100 - difficulty;

  return {
    total_difficulty: difficulty,
    tikitaka_index: tikitaka,
    penalty_stability,
    penalty_interaction,
  };
}

/**
 * passion_type_number:
 * (M_level - 1) * 5 + F_level
 *
 * passion_index:
 * (my_index + partner_index) / 2
 */
function calculateCouplePassion({
  male,
  female,
}: {
  male: Profile;
  female: Profile;
}): PassionResult {
  if (
    !male.passion_level ||
    !female.passion_level ||
    !male.passion_index ||
    !female.passion_index
  ) {
    throw new Error("Profiles must have passion_level and passion_index.");
  }

  // 1) passion_type_number 계산
  const passion_type_number =
    (male.passion_level - 1) * 5 + female.passion_level;

  // 2) 커플 패션 인덱스 = 평균
  const couple_passion_index = Number(
    ((male.passion_index + female.passion_index) / 2).toFixed(2)
  );

  return {
    passion_type_number,
    couple_passion_index,
  };
}

export function calculateRelationshipMetrics({
  male,
  female,
}: {
  male: Profile;
  female: Profile;
}): RelationshipMetrics {
  // 1. Chemistry Index
  const chemistry = calculateChemistryIndex({ male, female });

  // 2. Tikitaka Index
  const tikitaka = calculateTikitakaIndex({ male, female });

  // 3. Passion Index
  const passion = calculateCouplePassion({ male, female });

  return {
    ...chemistry,
    ...tikitaka,
    ...passion,
  };
}