import { Profile } from "@/models/profile";

export interface ChemistryIndex {
  aasScore: number;          // E
  aasLevel: number;          // 1~5
  big5Score: number;         // B
  big5Level: number;         // 1~5
  flexibilityScore: number;  // L
  flexibilityLevel: number;  // 1~5
  chemistryIndex: number;    // 최종 LLUBB
}

/**
 * 표준정규분포 CDF Φ(z) 근사 (0~1 사이).
 * Abramowitz & Stegun 근사식.
 */
function normalCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * x);
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-x * x));

  return 0.5 * (1 + sign * y);
}

/** Φ(z)를 0~100 백분위로 변환 */
function phiPct(z: number): number {
  return normalCdf(z) * 100;
}

/** 0~100 점수를 1~5 레벨로 변환 */
function scoreToLevel(score: number): number {
  if (score < 20) return 1;
  if (score < 40) return 2;
  if (score < 60) return 3;
  if (score < 80) return 4;
  return 5;
}

/** 필요한 z값이 null이면 에러를 던지는 헬퍼 */
function nz(value: number | null, name: string): number {
  if (value === null || Number.isNaN(value)) {
    throw new Error(`필요한 z-score(${name})가 없습니다.`);
  }
  return value;
}



/**
 * 두 프로필로부터 AAS(애착 안정), Big5, 정서적 유연성 점수와
 * 최종 chemistry_index(LLUBB)를 계산
 */
export function calculateChemistryIndex(
  a: Profile,
  b: Profile
): ChemistryIndex {
  // ----- 상수 (문서 기준) -----
  const alpha = 0.5; // E 가중치
  const beta = 0.2;  // B 가중치
  const gamma = 0.3; // L 가중치
  const kappa = 20;  // P_trap 가중치
  const delta = 0.3; // B, L에서 차이 패널티

  // ===== 1) E: 애착 안정 지수 (AAS) =====
  const zAnxA = nz(a.z_anxiety, "z_anxiety(A)");
  const zAnxB = nz(b.z_anxiety, "z_anxiety(B)");
  const zAvoidA = nz(a.z_avoidance, "z_avoidance(A)");
  const zAvoidB = nz(b.z_avoidance, "z_avoidance(B)");

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
  const zAgreeA = nz(a.z_agreeableness, "z_agreeableness(A)");
  const zAgreeB = nz(b.z_agreeableness, "z_agreeableness(B)");
  const zConsA = nz(a.z_conscientiousness, "z_conscientiousness(A)");
  const zConsB = nz(b.z_conscientiousness, "z_conscientiousness(B)");
  const zExtraA = nz(a.z_extraversion, "z_extraversion(A)");
  const zExtraB = nz(b.z_extraversion, "z_extraversion(B)");
  const zOpenA = nz(a.z_openness, "z_openness(A)");
  const zOpenB = nz(b.z_openness, "z_openness(B)");

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
  const zConflictA = nz(a.z_conflict, "z_conflict(A)");
  const zConflictB = nz(b.z_conflict, "z_conflict(B)");
  const zHumorA = nz(a.z_humor, "z_humor(A)");
  const zHumorB = nz(b.z_humor, "z_humor(B)");

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
    aasScore,
    aasLevel,
    big5Score,
    big5Level,
    flexibilityScore,
    flexibilityLevel,
    chemistryIndex,
  };
}

// 표준정규분포 CDF
function cdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

// erf 함수 구현
function erf(x: number): number {
  // Abramowitz & Stegun approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1 / (1 + p * x);
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) *
      Math.exp(-x * x);

  return sign * y;
}


interface TikitakaResult {
  totalDifficulty: number;
  tikitakaIndex: number;
  penalty_stability: number;
  penalty_interaction: number;
}

/**
 * Tikitaka Index calculation
 * @param male Profile
 * @param female Profile
 */
export function calculateTikitakaIndex(
  male: Profile,
  female: Profile
): TikitakaResult {
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
    cdf(Z_anxM) * cdf(Z_avoidF) +
    cdf(Z_anxF) * cdf(Z_avoidM);

  const penalty_interaction = k2 * interactionTerm;

  // Total penalty
  const C_penalty = penalty_stability + penalty_interaction;

  // 3) Total Difficulty = (0.5 * SM + 0.5 * SF) + C_penalty
  const difficulty = 0.5 * S_M + 0.5 * S_F + C_penalty;

  // 4) Final Tikitaka Index
  const tikitaka = 100 - difficulty;

  return {
    totalDifficulty: difficulty,
    tikitakaIndex: tikitaka,
    penalty_stability,
    penalty_interaction,
  };
}