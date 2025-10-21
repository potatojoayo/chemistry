// utils/computeProfileScores.ts
import { supabase } from "@/lib/supabase";

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

  // 4) 업데이트 payload 구성(정의된 것만 보냄)
  const patch: Record<string, unknown> = {
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
    },
  };
}
