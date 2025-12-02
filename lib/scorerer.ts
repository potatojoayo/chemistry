import { supabase } from "@/lib/supabase";
import { normalCdf } from "@/lib/utils";
import { Profile } from "@/models/profile";

/**
 * 질문/답변을 집계해 profiles에 평균값과 Z-score를 저장합니다.
 * - 입력: profileId
 * - 처리: adult-attachment, big-5, stability 도메인별 평균 & Z 계산
 * - 저장: profiles의 원시 평균(openness 등) + z_* 컬럼들
 * - 완료판정: 세 테스트의 모든 도메인 평균이 존재하면 test_completed=true
 */
export async function computeAndSaveProfileScores(profileId: string) {
  // 0) 기준값(평균/표준편차) 상수 ─ 제공해준 표/메모 기준
  // Adult Attachment (1~7)
  const ECR = {
    avoid: { mean: 3.1, sd: 0.9 },
    anx: { mean: 3.5, sd: 1.1 },
  };

  // Stability (1~7)  ─ Cann, 2008 예시
  const STAB = {
    humor: { mean: 5.56, sd: 0.91 },
    conflict: { mean: 5.54, sd: 0.95 },
  };

  // BIG5 (1~5)
  const BIG5 = {
    openness: { mean: 2.66, sd: 0.4 },
    conscientiousness: { mean: 3.91, sd: 0.32 },
    extraversion: { mean: 3.14, sd: 0.38 },
    agreeableness: { mean: 3.91, sd: 0.32 },
    neuroticism: { mean: 2.35, sd: 0.47 },
  };

  // 1) 해당 프로필의 모든 답변 + 질문 메타 조회
  const { data: rows, error } = await supabase
    .from("answers")
    .select(
      `
      answer,
      question_id,
      questions!inner (
        id,
        test_id,
        domain
      )
    `
    )
    .eq("profile_id", profileId);

  if (error) throw error;

  const { count: questionCount } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true });

  console.log(questionCount, rows.length);
  if (questionCount !== rows.length)
    throw new Error("아직 테스트가 완료되지 않았어요.");

  type Row = {
    answer: number;
    question_id: string;
    questions: { id: string; test_id: string; domain: string };
  };

  const byTest: Record<string, Record<string, number[]>> = {};
  for (const r of (rows ?? []) as unknown as Row[]) {
    const test = r.questions.test_id; // 'adult-attachment' | 'big-5' | 'stability'
    const domain = r.questions.domain; // 'Anxiety', 'Avoidance', 'Openness', ...
    byTest[test] ||= {};
    byTest[test][domain] ||= [];
    byTest[test][domain].push(Number(r.answer));
  }

  const mean = (arr?: number[]) =>
    arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined;

  const z = (x: number | undefined, m: number, s: number) =>
    x == null || s === 0 ? undefined : (x - m) / s;

  // 2) 도메인 평균 계산
  // ─ Adult Attachment
  const avgAvoid = mean(byTest["adult-attachment"]?.["Avoidance"]);
  const avgAnx = mean(byTest["adult-attachment"]?.["Anxiety"]);

  // ─ Stability
  const avgHumor = mean(byTest["stability"]?.["Humor"]);
  const avgConflict = mean(byTest["stability"]?.["Conflict"]);

  // ─ BIG5
  const avgOpen = mean(byTest["big-5"]?.["Openness"]);
  const avgCons = mean(byTest["big-5"]?.["Conscientiousness"]);
  const avgExtra = mean(byTest["big-5"]?.["Extraversion"]);
  const avgAgree = mean(byTest["big-5"]?.["Agreeableness"]);
  const avgNeuro = mean(byTest["big-5"]?.["Neuroticism"]);

  // 3) Z-score 계산 (신경성은 가중합에서 음의 방향)
  const zAvoid =
    avgAvoid == null ? undefined : z(avgAvoid, ECR.avoid.mean, ECR.avoid.sd);
  const zAnx = avgAnx == null ? undefined : z(avgAnx, ECR.anx.mean, ECR.anx.sd);

  const zHumor =
    avgHumor == null ? undefined : z(avgHumor, STAB.humor.mean, STAB.humor.sd);
  const zConflict =
    avgConflict == null
      ? undefined
      : z(avgConflict, STAB.conflict.mean, STAB.conflict.sd);

  const zOpen =
    avgOpen == null
      ? undefined
      : z(avgOpen, BIG5.openness.mean, BIG5.openness.sd);
  const zCons =
    avgCons == null
      ? undefined
      : z(avgCons, BIG5.conscientiousness.mean, BIG5.conscientiousness.sd);
  const zExtra =
    avgExtra == null
      ? undefined
      : z(avgExtra, BIG5.extraversion.mean, BIG5.extraversion.sd);
  const zAgree =
    avgAgree == null
      ? undefined
      : z(avgAgree, BIG5.agreeableness.mean, BIG5.agreeableness.sd);
  const zNeuro =
    avgNeuro == null
      ? undefined
      : z(avgNeuro, BIG5.neuroticism.mean, BIG5.neuroticism.sd);

  // 통합 지수 (원한다면 profiles에 별도 컬럼 추가 후 저장)
  const zBig5Total =
    zNeuro == null &&
    zAgree == null &&
    zCons == null &&
    zExtra == null &&
    zOpen == null
      ? undefined
      : 0 +
        (zNeuro != null ? -0.35 * zNeuro : 0) +
        (zAgree != null ? 0.31 * zAgree : 0) +
        (zCons != null ? 0.25 * zCons : 0) +
        (zExtra != null ? 0.08 * zExtra : 0) +
        (zOpen != null ? 0.02 * zOpen : 0);

  const zStability =
    zHumor == null || zConflict == null
      ? undefined
      : 0.6 * zHumor + 0.4 * zConflict;

  // Flexibility Percentage Calculation
  // Percentage = ((zStability - Zmin) / (Zmax - Zmin)) * 100
  // Zmin corresponds to raw scores of 1 (Min Humor/Conflict -> Min Total Score)
  // Zmax corresponds to raw scores of 7 (Max Humor/Conflict -> Max Total Score)
  let flexibilityPercentage: number | undefined;
  let flexibilityLevel: number | undefined;
  if (zStability != null) {
    // Calculate theoretical Min/Max Z-scores based on raw range 1-7
    const rawMin = 1;
    const rawMax = 7;

    const zHumorMin = (rawMin - STAB.humor.mean) / STAB.humor.sd;
    const zHumorMax = (rawMax - STAB.humor.mean) / STAB.humor.sd;
    const zConflictMin = (rawMin - STAB.conflict.mean) / STAB.conflict.sd;
    const zConflictMax = (rawMax - STAB.conflict.mean) / STAB.conflict.sd;

    // zStability is positive weighted sum
    const zStabilityMin = 0.6 * zHumorMin + 0.4 * zConflictMin;
    const zStabilityMax = 0.6 * zHumorMax + 0.4 * zConflictMax;

    const percentage =
      ((zStability - zStabilityMin) / (zStabilityMax - zStabilityMin)) * 100;

    // Clamp between 0 and 100, keep decimals for float4
    flexibilityPercentage = Math.max(0, Math.min(100, percentage));

    // Calculate Level (1-5)
    if (flexibilityPercentage < 20) flexibilityLevel = 1;
    else if (flexibilityPercentage < 40) flexibilityLevel = 2;
    else if (flexibilityPercentage < 60) flexibilityLevel = 3;
    else if (flexibilityPercentage < 80) flexibilityLevel = 4;
    else flexibilityLevel = 5;
  }

  // Emotional Stability Percentage Calculation (formerly Calmness/AAS Percentage)
  // Zecr_total = -(0.57 * zAnx + 0.15 * zAvoid)
  // Percentage = ((Zecr_total - Zmin) / (Zmax - Zmin)) * 100
  // Zmin corresponds to raw scores of 7 (Max Anxiety/Avoidance -> Min Total Score)
  // Zmax corresponds to raw scores of 1 (Min Anxiety/Avoidance -> Max Total Score)
  let emotionalStabilityPercentage: number | undefined;
  let emotionalStabilityLevel: number | undefined;
  let attachmentType: string | undefined;

  if (zAnx != null && zAvoid != null) {
    const zEcrTotal = -(0.57 * zAnx + 0.15 * zAvoid);

    // Calculate theoretical Min/Max Z-scores based on raw range 1-7
    const rawMin = 1;
    const rawMax = 7;

    const zAnxMin = (rawMin - ECR.anx.mean) / ECR.anx.sd;
    const zAnxMax = (rawMax - ECR.anx.mean) / ECR.anx.sd;
    const zAvoidMin = (rawMin - ECR.avoid.mean) / ECR.avoid.sd;
    const zAvoidMax = (rawMax - ECR.avoid.mean) / ECR.avoid.sd;

    // Zecr_total is negative weighted sum, so:
    // Max Total Score comes from Min Raw Scores (1, 1)
    const zEcrTotalMax = -(0.57 * zAnxMin + 0.15 * zAvoidMin);
    // Min Total Score comes from Max Raw Scores (7, 7)
    const zEcrTotalMin = -(0.57 * zAnxMax + 0.15 * zAvoidMax);

    const percentage =
      ((zEcrTotal - zEcrTotalMin) / (zEcrTotalMax - zEcrTotalMin)) * 100;

    // Clamp between 0 and 100, keep decimals for float4
    emotionalStabilityPercentage = Math.max(0, Math.min(100, percentage));

    // Calculate Level (1-5)
    if (emotionalStabilityPercentage < 20) emotionalStabilityLevel = 1;
    else if (emotionalStabilityPercentage < 40) emotionalStabilityLevel = 2;
    else if (emotionalStabilityPercentage < 60) emotionalStabilityLevel = 3;
    else if (emotionalStabilityPercentage < 80) emotionalStabilityLevel = 4;
    else emotionalStabilityLevel = 5;

    // Calculate Attachment Type (4 Quadrants)
    // Secure (안정형): Low Anxiety, Low Avoidance
    // Anxious (불안형): High Anxiety, Low Avoidance
    // Avoidant (회피형): Low Anxiety, High Avoidance
    // Fearful (혼란형): High Anxiety, High Avoidance
    // Threshold is the population mean (raw score)
    // Since we have averages, we can compare directly to ECR.anx.mean and ECR.avoid.mean
    // Or use Z-scores (Z > 0 means above mean)
    // Let's use Z-scores for consistency with "above/below mean"
    // zAnx >= 0 means High Anxiety
    // zAvoid >= 0 means High Avoidance

    const isHighAnx = zAnx >= 0;
    const isHighAvoid = zAvoid >= 0;

    if (!isHighAnx && !isHighAvoid) attachmentType = "secure"; // 안정형
    else if (isHighAnx && !isHighAvoid) attachmentType = "anxious"; // 불안형
    else if (!isHighAnx && isHighAvoid) attachmentType = "avoidant"; // 회피형
    else attachmentType = "disorganized"; // 혼란형
  }

  // Big 5 Type Calculation
  // Formula: (E-1)*625 + (A-1)*125 + (C-1)*25 + (N-1)*5 + (O-1) + 1
  // Scores are rounded to nearest integer (1-5)
  let big5Type: number | undefined;
  if (
    avgExtra != null &&
    avgAgree != null &&
    avgCons != null &&
    avgNeuro != null &&
    avgOpen != null
  ) {
    const rE = Math.round(avgExtra);
    const rA = Math.round(avgAgree);
    const rC = Math.round(avgCons);
    const rN = Math.round(avgNeuro);
    const rO = Math.round(avgOpen);

    // Ensure scores are within 1-5 range just in case
    const clamp = (n: number) => Math.max(1, Math.min(5, n));

    big5Type =
      (clamp(rE) - 1) * 625 +
      (clamp(rA) - 1) * 125 +
      (clamp(rC) - 1) * 25 +
      (clamp(rN) - 1) * 5 +
      (clamp(rO) - 1) +
      1;
  }

  // Passion Index Calculation
  let passionIndex: number | undefined;
  let passionLevel: number | undefined;
  let passionType: "COLD" | "COOL" | "MILD" | "WARM" | "HOT" | undefined;

  if (
    zAnx != null &&
    zAvoid != null &&
    zAgree != null &&
    zOpen != null
  ) {
    // Z_erc = 0.79 * Z_anx - 0.21 * Z_avoid
    const zErc = 0.79 * zAnx - 0.21 * zAvoid;

    // Z_big = 0.44 * Z_anx - 0.31 * Z_agreeableness - 0.25 * Z_openness
    const zBig = 0.44 * zAnx - 0.31 * zAgree - 0.25 * zOpen;

    // Relationship Passion Index = (0.5 * Phi(Z_erc) + 0.5 * Phi(Z_big)) * 100
    const phiErc = normalCdf(zErc);
    const phiBig = normalCdf(zBig);
    
    const index = (0.5 * phiErc + 0.5 * phiBig) * 100;
    passionIndex = Math.max(0, Math.min(100, index));

    // Calculate Level (1-5) based on quintiles
    if (passionIndex < 20) passionLevel = 1;
    else if (passionIndex < 40) passionLevel = 2;
    else if (passionIndex < 60) passionLevel = 3;
    else if (passionIndex < 80) passionLevel = 4;
    else passionLevel = 5;

    // Determine Type based on Level
    switch (passionLevel) {
      case 1:
        passionType = "COLD";
        break;
      case 2:
        passionType = "COOL";
        break;
      case 3:
        passionType = "MILD";
        break;
      case 4:
        passionType = "WARM";
        break;
      case 5:
        passionType = "HOT";
        break;
    }
  }

  // 4) 업데이트 payload 구성(정의된 것만 보냄)
  const patch: Partial<Profile> = {
    // raw means
    ...(avgAvoid != null ? { avoidance: avgAvoid } : {}),
    ...(avgAnx != null ? { anxiety: avgAnx } : {}),
    ...(avgHumor != null ? { humor: avgHumor } : {}),
    ...(avgConflict != null ? { conflict: avgConflict } : {}),
    ...(avgOpen != null ? { openness: avgOpen } : {}),
    ...(avgCons != null ? { conscientiousness: avgCons } : {}),
    ...(avgExtra != null ? { extraversion: avgExtra } : {}),
    ...(avgAgree != null ? { agreeableness: avgAgree } : {}),
    ...(avgNeuro != null ? { neuroticism: avgNeuro } : {}),

    // z-scores
    ...(zAvoid != null ? { z_avoidance: zAvoid } : {}),
    ...(zAnx != null ? { z_anxiety: zAnx } : {}),
    ...(zHumor != null ? { z_humor: zHumor } : {}),
    ...(zConflict != null ? { z_conflict: zConflict } : {}),
    ...(zOpen != null ? { z_openness: zOpen } : {}),
    ...(zCons != null ? { z_conscientiousness: zCons } : {}),
    ...(zExtra != null ? { z_extraversion: zExtra } : {}),
    ...(zAgree != null ? { z_agreeableness: zAgree } : {}),
    ...(zNeuro != null ? { z_neuroticism: zNeuro } : {}),

    // completed (세 테스트의 모든 도메인 평균이 있을 때)
    ...(avgAvoid != null &&
    avgAnx != null &&
    avgHumor != null &&
    avgConflict != null &&
    avgOpen != null &&
    avgCons != null &&
    avgExtra != null &&
    avgAgree != null &&
    avgNeuro != null
      ? { test_completed: true }
      : {}),
    ...(big5Type != null ? { big_5_type: big5Type } : {}),
    ...(emotionalStabilityPercentage != null
      ? { emotional_stability_percentage: emotionalStabilityPercentage }
      : {}),
    ...(emotionalStabilityLevel != null
      ? { emotional_stability_level: emotionalStabilityLevel }
      : {}),
    ...(attachmentType != null ? { attachment_type: attachmentType } : {}),
    ...(flexibilityPercentage != null
      ? { flexibility_percentage: flexibilityPercentage }
      : {}),
    ...(flexibilityLevel != null
      ? { flexibility_level: flexibilityLevel }
      : {}),
    ...(passionIndex != null ? { passion_index: passionIndex } : {}),
    ...(passionLevel != null ? { passion_level: passionLevel } : {}),
    ...(passionType != null ? { passion_type: passionType } : {}),
    updated_at: new Date().toISOString(),
  };

  // 5) 업데이트 실행
  const { error: upErr } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", profileId);

  if (upErr) throw upErr;

  return {
    // 디버깅/로깅에 유용한 리턴
    means: {
      avoidance: avgAvoid,
      anxiety: avgAnx,
      humor: avgHumor,
      conflict: avgConflict,
      openness: avgOpen,
      conscientiousness: avgCons,
      extraversion: avgExtra,
      agreeableness: avgAgree,
      neuroticism: avgNeuro,
    },
    z: {
      z_avoidance: zAvoid,
      z_anxiety: zAnx,
      z_humor: zHumor,
      z_conflict: zConflict,
      z_openness: zOpen,
      z_conscientiousness: zCons,
      z_extraversion: zExtra,
      z_agreeableness: zAgree,
      z_neuroticism: zNeuro,
      z_big5_total: zBig5Total,
      z_stability: zStability,
      big_5_type: big5Type,
      emotional_stability_percentage: emotionalStabilityPercentage,
      emotional_stability_level: emotionalStabilityLevel,
      attachment_type: attachmentType,
      flexibility_percentage: flexibilityPercentage,
      flexibility_level: flexibilityLevel,
      passion_index: passionIndex,
      passion_level: passionLevel,
      passion_type: passionType,
    },
  };
}
